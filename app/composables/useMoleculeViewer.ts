/**
 * Molecule Viewer Composable
 *
 * Encapsulates all 3Dmol.js WebGL viewer logic in a reusable composable.
 * This follows Vue 3 Composition API best practices for separating
 * business logic from presentation.
 *
 * WEBGL ARCHITECTURE:
 * - Creates and manages WebGL context lifecycle
 * - Handles molecule loading from PDB database
 * - Manages visualization state (style, color, background)
 * - Provides atom interaction (selection, measurement)
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { AtomInfo, Viewer, MoleculeStats } from '~/types/molecule'
import {
  ETHANOL_PDB,
  VIEWER_CONFIG,
  getMoleculeById,
  getBackgroundById,
  getAtomCount
} from '~/constants/molecules'

/**
 * Calculate Euclidean distance between two 3D points
 *
 * Formula: d = √[(x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²]
 * Result is in Angstroms (Å)
 */
const calculateDistance = (a: AtomInfo, b: AtomInfo): number => {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dz = b.z - a.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
 * Build 3Dmol style object from color scheme ID
 */
const buildColorStyle = (schemeId: string): object => {
  const schemeMap: Record<string, string> = {
    'Jmol': 'Jmol',
    'carbon': 'greenCarbon',
    'spectrum': 'spectrum',
    'chain': 'chain'
  }
  return { colorscheme: schemeMap[schemeId] || 'Jmol' }
}

export function useMoleculeViewer() {
  // ==========================================================================
  // REACTIVE STATE
  // ==========================================================================

  // Viewer instance (WebGL context)
  let viewer: Viewer | null = null

  // Container element reference
  const viewerContainer = ref<HTMLElement | null>(null)

  // Loading state
  const isLoading = ref(false)

  // Current selections
  const currentMolecule = ref(VIEWER_CONFIG.defaultMolecule)
  const currentStyle = ref(VIEWER_CONFIG.defaultStyle)
  const currentColorScheme = ref(VIEWER_CONFIG.defaultColorScheme)
  const currentBackground = ref(VIEWER_CONFIG.defaultBackground)

  // Feature toggles
  const isSpinning = ref(false)
  const showLabels = ref(false)
  const measureMode = ref(false)

  // Atom selection state
  const selectedAtom = ref<AtomInfo | null>(null)
  const measureAtom1 = ref<AtomInfo | null>(null)
  const measurementDistance = ref<number | null>(null)

  // Stats
  const atomCount = ref(0)

  // PDB Search state
  const searchError = ref<string | null>(null)
  const customPdbId = ref<string | null>(null)

  // ==========================================================================
  // COMPUTED PROPERTIES
  // ==========================================================================

  const currentMoleculeName = computed(() => {
    if (customPdbId.value) {
      return `PDB: ${customPdbId.value.toUpperCase()}`
    }
    const mol = getMoleculeById(currentMolecule.value)
    return mol?.name || 'molecule'
  })

  const moleculeStats = computed<MoleculeStats>(() => {
    if (customPdbId.value) {
      return {
        formula: 'Custom PDB',
        atomCount: atomCount.value,
        weight: '-'
      }
    }
    const mol = getMoleculeById(currentMolecule.value)
    return {
      formula: mol?.formula || '-',
      atomCount: atomCount.value,
      weight: mol?.weight.toFixed(2) || '-'
    }
  })

  const hasFirstAtom = computed(() => measureAtom1.value !== null)

  // ==========================================================================
  // VIEWER INITIALIZATION
  // ==========================================================================

  /**
   * Initialize the WebGL viewer
   * Must be called after DOM is ready (in onMounted)
   */
  const initViewer = () => {
    if (!viewerContainer.value || !window.$3Dmol) return

    viewer = window.$3Dmol.createViewer(viewerContainer.value, {
      backgroundColor: VIEWER_CONFIG.backgroundColor,
      antialias: VIEWER_CONFIG.antialias,
      id: 'mol-viewer'
    })

    loadMolecule(VIEWER_CONFIG.defaultMolecule)
  }

  /**
   * Wait for 3Dmol.js to load then initialize
   */
  const waitForLibraryAndInit = () => {
    if (window.$3Dmol) {
      initViewer()
    } else {
      setTimeout(waitForLibraryAndInit, 100)
    }
  }

  /**
   * Cleanup WebGL resources
   */
  const cleanup = () => {
    if (viewer) {
      viewer.clear()
      viewer = null
    }
  }

  // ==========================================================================
  // MOLECULE LOADING
  // ==========================================================================

  /**
   * Load a molecule by ID
   */
  const loadMolecule = (moleculeId: string) => {
    if (!viewer) return

    const molecule = getMoleculeById(moleculeId)
    if (!molecule) return

    isLoading.value = true
    currentMolecule.value = moleculeId
    customPdbId.value = null // Clear custom PDB when loading preset
    searchError.value = null

    // Clear previous state
    viewer.clear()
    viewer.removeAllLabels()
    viewer.removeAllShapes()
    selectedAtom.value = null
    clearMeasurement()

    if (moleculeId === 'ethanol') {
      loadInlineMolecule(ETHANOL_PDB, molecule.pdbId)
    } else {
      loadFromPDB(molecule.pdbId)
    }
  }

  /**
   * Load from inline PDB string
   */
  const loadInlineMolecule = (pdbData: string, pdbId: string) => {
    if (!viewer) return

    try {
      viewer.addModel(pdbData, 'pdb')
      finalizeLoad(pdbId)
    } catch (error) {
      console.error('Error loading inline molecule:', error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load from PDB database
   */
  const loadFromPDB = (pdbId: string) => {
    if (!viewer) return

    window.$3Dmol.download(`pdb:${pdbId}`, viewer, {}, () => {
      finalizeLoad(pdbId)
      isLoading.value = false
    })
  }

  /**
   * Search and load molecule from PDB database by ID
   * Handles errors for invalid/not found PDB IDs
   */
  const searchPDB = async (pdbId: string): Promise<boolean> => {
    if (!viewer || !pdbId.trim()) {
      searchError.value = 'Please enter a PDB ID'
      return false
    }

    const cleanId = pdbId.trim().toUpperCase()

    // Validate PDB ID format (typically 4 characters)
    if (!/^[A-Z0-9]{4}$/i.test(cleanId)) {
      searchError.value = 'PDB ID must be 4 characters (e.g., 1CRN, 4HHB)'
      return false
    }

    isLoading.value = true
    searchError.value = null
    customPdbId.value = cleanId
    currentMolecule.value = '' // Clear preset selection when loading custom PDB

    // Clear previous state
    viewer.clear()
    viewer.removeAllLabels()
    viewer.removeAllShapes()
    selectedAtom.value = null
    clearMeasurement()

    return new Promise((resolve) => {
      window.$3Dmol.download(`pdb:${cleanId}`, viewer!, {}, () => {
        // Check if model was loaded by checking atoms
        if (viewer) {
          const atoms = viewer.selectedAtoms({})
          if (atoms.length === 0) {
            searchError.value = `PDB ID "${cleanId}" not found`
            customPdbId.value = null
            isLoading.value = false
            resolve(false)
            return
          }
          atomCount.value = atoms.length
        }

        applyVisualizationSettings()
        setupAtomClicking()

        if (viewer) {
          viewer.zoomTo()
          viewer.zoom(VIEWER_CONFIG.zoomFactor, VIEWER_CONFIG.animationDuration)
          viewer.render()
        }

        if (showLabels.value) {
          addLabels()
        }

        isLoading.value = false
        resolve(true)
      })
    })
  }

  /**
   * Clear search error
   */
  const clearSearchError = () => {
    searchError.value = null
  }

  /**
   * Common finalization after molecule load
   */
  const finalizeLoad = (pdbId: string) => {
    if (!viewer) return

    applyVisualizationSettings()
    setupAtomClicking()
    atomCount.value = getAtomCount(pdbId)

    viewer.zoomTo()
    viewer.zoom(VIEWER_CONFIG.zoomFactor, VIEWER_CONFIG.animationDuration)
    viewer.render()

    if (showLabels.value) {
      addLabels()
    }
  }

  // ==========================================================================
  // VISUALIZATION SETTINGS
  // ==========================================================================

  /**
   * Apply current style and color scheme
   */
  const applyVisualizationSettings = () => {
    if (!viewer) return

    const styleObj: Record<string, object> = {
      [currentStyle.value]: buildColorStyle(currentColorScheme.value)
    }

    viewer.setStyle({}, styleObj)
    viewer.render()
  }

  /**
   * Set visualization style
   */
  const setStyle = (styleId: string) => {
    currentStyle.value = styleId
    applyVisualizationSettings()
  }

  /**
   * Set color scheme
   */
  const setColorScheme = (schemeId: string) => {
    currentColorScheme.value = schemeId
    applyVisualizationSettings()
  }

  /**
   * Set background color
   */
  const setBackground = (bgId: string) => {
    if (!viewer) return

    currentBackground.value = bgId
    const bg = getBackgroundById(bgId)
    if (bg) {
      viewer.setBackgroundColor(bg.color)
      viewer.render()
    }
  }

  // ==========================================================================
  // ATOM INTERACTION
  // ==========================================================================

  /**
   * Setup click handlers for atom selection
   */
  const setupAtomClicking = () => {
    if (!viewer) return

    viewer.setClickable({}, true, (atom: AtomInfo) => {
      if (measureMode.value) {
        handleMeasurementClick(atom)
      } else {
        selectedAtom.value = atom
      }
    })
  }

  /**
   * Handle click in measurement mode
   */
  const handleMeasurementClick = (atom: AtomInfo) => {
    if (!measureAtom1.value) {
      measureAtom1.value = atom
      selectedAtom.value = atom
    } else {
      measurementDistance.value = calculateDistance(measureAtom1.value, atom)
      drawMeasurementLine(measureAtom1.value, atom)
      measureAtom1.value = null
      measureMode.value = false
    }
  }

  /**
   * Draw measurement line between atoms
   */
  const drawMeasurementLine = (atom1: AtomInfo, atom2: AtomInfo) => {
    if (!viewer) return

    viewer.removeAllShapes()
    viewer.addCylinder(
      { x: atom1.x, y: atom1.y, z: atom1.z },
      { x: atom2.x, y: atom2.y, z: atom2.z },
      { radius: 0.1, color: 'yellow', dashed: true }
    )
    viewer.render()
  }

  /**
   * Clear measurement
   */
  const clearMeasurement = () => {
    measurementDistance.value = null
    measureAtom1.value = null
    if (viewer) {
      viewer.removeAllShapes()
      viewer.render()
    }
  }

  /**
   * Toggle measurement mode
   */
  const toggleMeasureMode = () => {
    measureMode.value = !measureMode.value
    if (!measureMode.value) {
      measureAtom1.value = null
    }
  }

  // ==========================================================================
  // VIEWER CONTROLS
  // ==========================================================================

  /**
   * Reset view to default
   */
  const resetView = () => {
    if (!viewer) return

    if (isSpinning.value) {
      toggleSpin()
    }

    viewer.zoomTo()
    viewer.zoom(VIEWER_CONFIG.zoomFactor, VIEWER_CONFIG.animationDuration)
    viewer.render()
  }

  /**
   * Toggle auto-rotation
   */
  const toggleSpin = () => {
    if (!viewer) return

    isSpinning.value = !isSpinning.value
    viewer.spin(isSpinning.value ? VIEWER_CONFIG.spinAxis : false, VIEWER_CONFIG.spinSpeed)
  }

  /**
   * Toggle atom labels
   */
  const toggleLabels = () => {
    showLabels.value = !showLabels.value

    if (showLabels.value) {
      addLabels()
    } else {
      removeLabels()
    }
  }

  /**
   * Add labels to viewer showing element symbols on each atom
   *
   * Performance optimization:
   * - Skip hydrogen atoms (most numerous, least informative)
   * - Limit total labels to prevent browser freeze on large molecules
   */
  const addLabels = () => {
    if (!viewer) return

    // Get all atoms in the current model
    const atoms = viewer.selectedAtoms({})

    // Filter out hydrogens and limit to max 50 labels for performance
    const heavyAtoms = atoms
      .filter((atom: AtomInfo) => atom.elem !== 'H')
      .slice(0, 50)

    // Warn if molecule is too large
    if (atoms.length > 100) {
      console.warn(`Large molecule (${atoms.length} atoms) - showing only ${heavyAtoms.length} labels`)
    }

    // Add a label for each heavy atom showing its element symbol
    heavyAtoms.forEach((atom: AtomInfo) => {
      viewer!.addLabel(atom.elem, {
        position: { x: atom.x, y: atom.y, z: atom.z },
        backgroundColor: 'rgba(0,0,0,0.6)',
        fontColor: 'white',
        fontSize: 10,
        backgroundOpacity: 0.7
      })
    })

    viewer.render()
  }

  /**
   * Remove all labels
   */
  const removeLabels = () => {
    if (!viewer) return
    viewer.removeAllLabels()
    viewer.render()
  }

  /**
   * Take screenshot
   */
  const takeScreenshot = () => {
    if (!viewer) return

    const imgData = viewer.pngURI()
    const link = document.createElement('a')
    link.href = imgData
    // Use custom PDB ID if loaded, otherwise use preset molecule ID
    const filename = customPdbId.value
      ? `${customPdbId.value.toLowerCase()}-molecule.png`
      : `${currentMolecule.value}-molecule.png`
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================

  onMounted(() => {
    waitForLibraryAndInit()
  })

  onUnmounted(() => {
    cleanup()
  })

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  return {
    // Refs
    viewerContainer,
    isLoading,
    currentMolecule,
    currentStyle,
    currentColorScheme,
    currentBackground,
    isSpinning,
    showLabels,
    measureMode,
    selectedAtom,
    measurementDistance,
    searchError,

    // Computed
    currentMoleculeName,
    moleculeStats,
    hasFirstAtom,

    // Methods
    initViewer: waitForLibraryAndInit,
    loadMolecule,
    searchPDB,
    clearSearchError,
    setStyle,
    setColorScheme,
    setBackground,
    resetView,
    toggleSpin,
    toggleLabels,
    toggleMeasureMode,
    clearMeasurement,
    takeScreenshot
  }
}
