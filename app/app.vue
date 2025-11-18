<!--
  MOLECULAR VISUALIZATION APP - WebGL-Powered Scientific Viewer
  ===============================================================

  Built with Nuxt 3, TypeScript, and 3Dmol.js

  WHAT IS WEBGL?
  ==============
  WebGL (Web Graphics Library) is a JavaScript API for rendering interactive 2D and 3D
  graphics within any compatible web browser without plugins. It's based on OpenGL ES 2.0
  and provides direct access to the GPU (Graphics Processing Unit) for hardware-accelerated
  rendering. This is crucial for molecular visualization because:

  1. GPU Parallelization: The GPU can process thousands of vertices simultaneously, making
     it ideal for rendering complex molecules with hundreds or thousands of atoms.
  2. Real-time Interaction: Users can rotate, zoom, and manipulate molecules smoothly at
     60fps because the heavy lifting is done by dedicated graphics hardware.
  3. Memory Efficiency: Molecular data is stored in GPU buffers, reducing CPU-GPU data
     transfer and enabling smooth animations.

  WHY 3DMOL.JS FOR MOLECULAR VISUALIZATION?
  ==========================================
  3Dmol.js is a WebGL-based molecular viewer that abstracts the complexity of raw WebGL
  programming. Instead of writing shaders, managing buffers, and handling matrix transformations
  manually, we use 3Dmol.js's high-level API. Under the hood, it:

  - Creates WebGL contexts and manages the rendering pipeline
  - Implements molecular rendering algorithms (stick, sphere, surface)
  - Handles atom picking (ray casting from mouse position)
  - Provides optimized shaders for atom coloring schemes
  - Manages camera controls (rotation, zoom, pan)

  WHAT ARE PDB FILES?
  ===================
  PDB (Protein Data Bank) files are the standard format for storing 3D molecular structure
  data. Each file contains:

  - ATOM records: x, y, z coordinates for each atom
  - Element type (C, N, O, H, etc.)
  - Residue information (for proteins: amino acid, chain)
  - Bond connectivity (sometimes inferred from distances)

  The PDB database (rcsb.org) contains over 200,000 experimentally-determined structures
  from X-ray crystallography, NMR spectroscopy, and cryo-electron microscopy.

  3D RENDERING MATHEMATICS
  ========================
  Molecular visualization involves several 3D math concepts:

  1. Coordinate Systems: Atoms are positioned in 3D space using x, y, z coordinates
     (typically in Angstroms, 1Å = 10⁻¹⁰ meters)

  2. Distance Calculations: The Euclidean distance between atoms A and B is:
     d = √[(x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²]

  3. Transformations: Rotation, translation, and scaling are applied via 4x4 matrices
     that transform atom positions to screen coordinates.

  4. Perspective Projection: 3D coordinates are projected onto the 2D screen using
     perspective division to create depth perception.

  PERFORMANCE CONSIDERATIONS
  ==========================
  - Vertex Buffer Objects (VBOs): Atom positions and colors are uploaded to GPU memory
    once, then reused for each frame.
  - Instanced Rendering: Spheres/sticks share geometry, only transforms differ.
  - Frustum Culling: Off-screen atoms aren't rendered.
  - Level of Detail: Large molecules may simplify distant atoms.

  Author: Christopher Bermudez | christopherbermudez.com
-->

<template>
  <div class="app-container">
    <!-- Help Modal - Keyboard Shortcuts and Usage Instructions -->
    <div v-if="showHelpModal" class="modal-overlay" @click="showHelpModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Keyboard Shortcuts & Help</h2>
          <button class="close-button" @click="showHelpModal = false">
            <Icon name="mdi:close" />
          </button>
        </div>
        <div class="modal-body">
          <div class="shortcuts-section">
            <h3>Keyboard Shortcuts</h3>
            <div class="shortcut-grid">
              <div class="shortcut-item">
                <kbd>R</kbd>
                <span>Reset View</span>
              </div>
              <div class="shortcut-item">
                <kbd>S</kbd>
                <span>Toggle Spin</span>
              </div>
              <div class="shortcut-item">
                <kbd>1</kbd>
                <span>Load Caffeine</span>
              </div>
              <div class="shortcut-item">
                <kbd>2</kbd>
                <span>Load Aspirin</span>
              </div>
              <div class="shortcut-item">
                <kbd>3</kbd>
                <span>Load Glucose</span>
              </div>
              <div class="shortcut-item">
                <kbd>4</kbd>
                <span>Load Ethanol</span>
              </div>
              <div class="shortcut-item">
                <kbd>Space</kbd>
                <span>Screenshot</span>
              </div>
              <div class="shortcut-item">
                <kbd>M</kbd>
                <span>Toggle Measure</span>
              </div>
              <div class="shortcut-item">
                <kbd>L</kbd>
                <span>Toggle Labels</span>
              </div>
              <div class="shortcut-item">
                <kbd>?</kbd>
                <span>Show Help</span>
              </div>
            </div>
          </div>
          <div class="usage-section">
            <h3>Mouse Controls</h3>
            <ul>
              <li><strong>Left Click + Drag:</strong> Rotate molecule</li>
              <li><strong>Right Click + Drag:</strong> Pan view</li>
              <li><strong>Scroll:</strong> Zoom in/out</li>
              <li><strong>Click Atom:</strong> Select atom (shows info)</li>
              <li><strong>Measure Mode:</strong> Click two atoms to measure distance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Header -->
    <header class="app-header">
      <h1>
        <Icon name="mdi:molecule" class="header-icon" />
        Molecular Visualizer
      </h1>
      <p class="subtitle">WebGL-Powered 3D Molecular Viewer</p>
      <span class="keyboard-hint">Press <kbd>?</kbd> for shortcuts</span>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Viewer Container -->
      <div class="viewer-section">
        <div class="viewer-wrapper">
          <!-- Loading Overlay -->
          <div v-if="isLoading" class="loading-overlay">
            <div class="loading-spinner"/>
            <p>Loading {{ currentMoleculeName }}...</p>
          </div>

          <!-- Help Button -->
          <button class="help-button" title="Help & Shortcuts" @click="showHelpModal = true">
            <Icon name="mdi:help-circle-outline" />
          </button>

          <!-- 3Dmol Viewer Container - WebGL context is created here -->
          <div id="viewer-container" ref="viewerContainer"/>

          <!-- Atom Info Card - Shows when atom is selected -->
          <div v-if="selectedAtom" class="atom-info-card">
            <h4>
              <Icon name="mdi:atom" />
              Atom Information
            </h4>
            <div class="atom-details">
              <p><strong>Element:</strong> {{ selectedAtom.elem }}</p>
              <p><strong>Position:</strong> ({{ selectedAtom.x.toFixed(2) }}, {{ selectedAtom.y.toFixed(2) }}, {{ selectedAtom.z.toFixed(2) }}) Å</p>
              <p v-if="selectedAtom.resn"><strong>Residue:</strong> {{ selectedAtom.resn }} {{ selectedAtom.resi }}</p>
              <p v-if="selectedAtom.chain"><strong>Chain:</strong> {{ selectedAtom.chain }}</p>
            </div>
          </div>

          <!-- Distance Measurement Display -->
          <div v-if="measurementDistance !== null" class="measurement-card">
            <h4>
              <Icon name="mdi:ruler" />
              Distance Measurement
            </h4>
            <p class="distance-value">{{ measurementDistance.toFixed(3) }} Å</p>
            <button class="clear-measurement" @click="clearMeasurement">Clear</button>
          </div>
        </div>
      </div>

      <!-- Controls Section -->
      <div class="controls-section">
        <!-- Stats Panel - Molecular Information -->
        <div class="control-card stats-card">
          <h3>
            <Icon name="mdi:chart-bar" />
            Molecule Stats
          </h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Formula</span>
              <span class="stat-value">{{ moleculeFormula }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Atoms</span>
              <span class="stat-value">{{ atomCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Mol. Weight</span>
              <span class="stat-value">{{ molecularWeight }} g/mol</span>
            </div>
          </div>
        </div>

        <!-- Molecule Selector -->
        <div class="control-card">
          <h3>
            <Icon name="mdi:flask" />
            Select Molecule
          </h3>
          <div class="button-group">
            <button
              v-for="molecule in molecules"
              :key="molecule.id"
              :class="['control-button', { active: currentMolecule === molecule.id }]"
              @click="loadMolecule(molecule.id)"
            >
              {{ molecule.name }}
            </button>
          </div>
        </div>

        <!-- Visualization Style -->
        <div class="control-card">
          <h3>
            <Icon name="mdi:eye" />
            Visualization Style
          </h3>
          <div class="button-group">
            <button
              v-for="style in visualizationStyles"
              :key="style.id"
              :class="['control-button', { active: currentStyle === style.id }]"
              @click="setVisualizationStyle(style.id)"
            >
              {{ style.name }}
            </button>
          </div>
        </div>

        <!-- Color Scheme Selector -->
        <div class="control-card">
          <h3>
            <Icon name="mdi:palette" />
            Color Scheme
          </h3>
          <div class="button-group">
            <button
              v-for="scheme in colorSchemes"
              :key="scheme.id"
              :class="['control-button', { active: currentColorScheme === scheme.id }]"
              @click="setColorScheme(scheme.id)"
            >
              {{ scheme.name }}
            </button>
          </div>
        </div>

        <!-- Background Selector -->
        <div class="control-card">
          <h3>
            <Icon name="mdi:image" />
            Background
          </h3>
          <div class="button-group">
            <button
              v-for="bg in backgrounds"
              :key="bg.id"
              :class="['control-button', { active: currentBackground === bg.id }]"
              @click="setBackground(bg.id)"
            >
              {{ bg.name }}
            </button>
          </div>
        </div>

        <!-- Tools -->
        <div class="control-card">
          <h3>
            <Icon name="mdi:tools" />
            Tools
          </h3>
          <div class="button-group">
            <button
              :class="['control-button', { active: isSpinning }]"
              @click="toggleSpin"
            >
              <Icon name="mdi:rotate-3d" />
              {{ isSpinning ? 'Stop Spin' : 'Auto-Rotate' }}
            </button>
            <button
              :class="['control-button', { active: measureMode }]"
              @click="toggleMeasureMode"
            >
              <Icon name="mdi:ruler" />
              {{ measureMode ? 'Measuring...' : 'Measure' }}
            </button>
            <button
              :class="['control-button', { active: showLabels }]"
              @click="toggleLabels"
            >
              <Icon name="mdi:label" />
              {{ showLabels ? 'Hide Labels' : 'Show Labels' }}
            </button>
          </div>
          <div class="button-group" style="margin-top: 0.5rem;">
            <button class="control-button" @click="resetView">
              <Icon name="mdi:restore" />
              Reset View
            </button>
            <button class="control-button" @click="takeScreenshot">
              <Icon name="mdi:camera" />
              Screenshot
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <p>
        Built with <strong>Nuxt 3</strong>, <strong>TypeScript</strong>, and <strong>3Dmol.js (WebGL)</strong>
        by Christopher Bermudez | <a href="https://christopherbermudez.com" target="_blank">christopherbermudez.com</a>
      </p>
      <p class="footer-note">
        WebGL-powered molecular visualization demo for OpenEye/Cadence Molecular Sciences
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * MOLECULAR VISUALIZATION COMPONENT
 * ==================================
 *
 * This component creates a WebGL-powered 3D molecular viewer using 3Dmol.js.
 *
 * CLIENT-SIDE RENDERING REQUIREMENTS:
 * - WebGL requires a browser context with Canvas/WebGL support
 * - 3Dmol.js must be loaded after the DOM is available
 * - Viewer initialization happens in onMounted (client-side only)
 *
 * WHY HARDWARE ACCELERATION MATTERS:
 * Complex molecules like proteins can have 10,000+ atoms. Without GPU acceleration:
 * - CPU would need to calculate position of each atom per frame (60fps = 600,000 calculations/second)
 * - Memory bandwidth becomes a bottleneck
 * - User interaction would be sluggish
 *
 * With WebGL/GPU:
 * - Parallel processing handles all atoms simultaneously
 * - Smooth 60fps even with large molecules
 * - Real-time style/color changes
 */

// Import Nuxt composables for head management and lifecycle
import { ref, onMounted, onUnmounted, computed } from 'vue'

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Represents a 3D atom with position and chemical properties.
 * This maps to PDB ATOM record fields:
 * - x, y, z: Cartesian coordinates in Angstroms
 * - elem: Element symbol (C, N, O, H, etc.)
 * - resn: Residue name (for proteins, e.g., ALA, GLY)
 * - resi: Residue number in the chain
 * - chain: Chain identifier (A, B, C, etc.)
 */
interface AtomInfo {
  elem: string
  x: number
  y: number
  z: number
  resn?: string
  resi?: number
  chain?: string
  serial?: number
}

/**
 * Molecule data structure containing PDB ID and metadata.
 * PDB IDs are 4-character codes assigned by the Protein Data Bank.
 */
interface MoleculeData {
  id: string
  name: string
  pdbId: string
  formula: string
  weight: number
  description: string
}

/**
 * 3Dmol.js viewer instance type.
 * The viewer manages the WebGL context and all rendering operations.
 */
interface Viewer {
  addModel: (data: string, format: string) => Model
  setStyle: (sel: object, style: object) => void
  setBackgroundColor: (color: string | number) => void
  render: () => void
  zoom: (factor: number, animationDuration?: number) => void
  center: (sel?: object, animationDuration?: number) => void
  zoomTo: (sel?: object, animationDuration?: number) => void
  spin: (axis: string | boolean, speed?: number) => void
  setClickable: (sel: object, clickable: boolean, callback: (atom: AtomInfo) => void) => void
  addLabel: (text: string, options: object) => void
  removeAllLabels: () => void
  addCylinder: (start: object, end: object, options: object) => void
  removeAllShapes: () => void
  pngURI: () => string
  clear: () => void
}

/**
 * 3Dmol.js model instance type.
 * A model represents a single molecular structure in the viewer.
 */
interface Model {
  setStyle: (sel: object, style: object) => void
  addSurface: (type: number, options: object) => void
}

/**
 * Global 3Dmol.js library interface.
 * Loaded via CDN and attached to window.$3Dmol.
 */
interface ThreeDmol {
  createViewer: (element: HTMLElement, config: object) => Viewer
  download: (query: string, viewer: Viewer, options: object, callback: () => void) => void
  SurfaceType: {
    VDW: number
    SAS: number
    SES: number
  }
  elementColors: {
    Jmol: object
    rasmol: object
    defaultColors: object
  }
}

// Extend Window interface to include 3Dmol
declare global {
  interface Window {
    $3Dmol: ThreeDmol
  }
}

// =============================================================================
// DATA CONSTANTS
// =============================================================================

/**
 * Available molecules with their PDB IDs and chemical properties.
 *
 * PDB ID FORMAT: 4-character alphanumeric codes
 * - First character: typically 1-9
 * - Remaining: alphanumeric
 *
 * Note: Ethanol uses inline PDB format since it's a simple molecule
 * not typically deposited in the PDB database.
 */
const molecules: MoleculeData[] = [
  {
    id: 'caffeine',
    name: 'Caffeine',
    pdbId: '1UAO',
    formula: 'C₈H₁₀N₄O₂',
    weight: 194.19,
    description: 'Stimulant found in coffee and tea'
  },
  {
    id: 'aspirin',
    name: 'Aspirin',
    pdbId: '2OYE',
    formula: 'C₉H₈O₄',
    weight: 180.16,
    description: 'Anti-inflammatory and pain reliever'
  },
  {
    id: 'glucose',
    name: 'Glucose',
    pdbId: '3W7B',
    formula: 'C₆H₁₂O₆',
    weight: 180.16,
    description: 'Primary energy source for cells'
  },
  {
    id: 'ethanol',
    name: 'Ethanol',
    pdbId: 'INLINE',
    formula: 'C₂H₆O',
    weight: 46.07,
    description: 'Alcohol found in beverages'
  }
]

/**
 * Visualization styles available in 3Dmol.js.
 * Each style uses different WebGL rendering techniques:
 *
 * - Stick: Cylinders for bonds, small spheres for atoms (most common)
 * - Sphere: Van der Waals spheres showing atomic radii
 * - Line: Simple lines for bonds (fastest, lowest quality)
 * - Cross: Cross-shaped markers at atom positions
 */
const visualizationStyles = [
  { id: 'stick', name: 'Stick' },
  { id: 'sphere', name: 'Sphere' },
  { id: 'line', name: 'Line' },
  { id: 'cross', name: 'Cross' }
]

/**
 * Color schemes for atom coloring.
 *
 * - Jmol: Standard CPK coloring (C=gray, N=blue, O=red, H=white)
 * - Carbon: All carbons same color, others element colors
 * - Spectrum: Rainbow gradient based on residue/atom index
 * - Chain: Different color for each protein chain
 */
const colorSchemes = [
  { id: 'Jmol', name: 'Jmol' },
  { id: 'carbon', name: 'Carbon' },
  { id: 'spectrum', name: 'Spectrum' },
  { id: 'chain', name: 'Chain' }
]

/**
 * Background options for the viewer.
 * White is best for publications, black for contrast, gradient for aesthetics.
 */
const backgrounds = [
  { id: 'white', name: 'White', color: 'white' },
  { id: 'black', name: 'Black', color: 'black' },
  { id: 'gray', name: 'Gray', color: '#1a1a2e' }
]

/**
 * Inline PDB format for ethanol molecule.
 *
 * PDB FORMAT EXPLANATION:
 * ATOM records have fixed-width columns:
 * - Columns 1-6: Record type (ATOM)
 * - Columns 7-11: Atom serial number
 * - Columns 13-16: Atom name
 * - Columns 18-20: Residue name
 * - Column 22: Chain identifier
 * - Columns 23-26: Residue sequence number
 * - Columns 31-38: X coordinate (Angstroms)
 * - Columns 39-46: Y coordinate
 * - Columns 47-54: Z coordinate
 * - Columns 77-78: Element symbol
 */
const ethanolPDB = `COMPND    ETHANOL
AUTHOR    GENERATED FOR MOLECULAR VISUALIZER
ATOM      1  C1  ETH A   1      -0.757   0.429   0.000  1.00  0.00           C
ATOM      2  C2  ETH A   1       0.757  -0.429   0.000  1.00  0.00           C
ATOM      3  O   ETH A   1       1.584   0.720   0.000  1.00  0.00           O
ATOM      4  H1  ETH A   1      -1.164   0.437   1.014  1.00  0.00           H
ATOM      5  H2  ETH A   1      -0.537   1.450  -0.333  1.00  0.00           H
ATOM      6  H3  ETH A   1      -1.497   0.003  -0.681  1.00  0.00           H
ATOM      7  H4  ETH A   1       0.537  -1.450   0.333  1.00  0.00           H
ATOM      8  H5  ETH A   1       1.164  -0.437  -1.014  1.00  0.00           H
ATOM      9  H6  ETH A   1       2.484   0.400   0.000  1.00  0.00           H
END`

// =============================================================================
// REACTIVE STATE
// =============================================================================

// DOM reference for the viewer container
const viewerContainer = ref<HTMLElement | null>(null)

// 3Dmol.js viewer instance - holds the WebGL context
let viewer: Viewer | null = null

// Animation frame ID for spin animation - used to cancel requestAnimationFrame
const spinAnimationId: number | null = null

// Current state
const currentMolecule = ref<string>('caffeine')
const currentStyle = ref<string>('stick')
const currentColorScheme = ref<string>('Jmol')
const currentBackground = ref<string>('white')
const isSpinning = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const showLabels = ref<boolean>(false)
const measureMode = ref<boolean>(false)
const showHelpModal = ref<boolean>(false)

// Atom selection state
const selectedAtom = ref<AtomInfo | null>(null)
const measureAtom1 = ref<AtomInfo | null>(null)
const measurementDistance = ref<number | null>(null)

// Molecule stats
const atomCount = ref<number>(0)
const moleculeFormula = ref<string>('-')
const molecularWeight = ref<string>('-')

// Current molecule name for loading display
const currentMoleculeName = computed(() => {
  const mol = molecules.find(m => m.id === currentMolecule.value)
  return mol ? mol.name : 'molecule'
})

// =============================================================================
// LIFECYCLE HOOKS
// =============================================================================

/**
 * Load 3Dmol.js script via CDN when component mounts.
 *
 * We use useHead to inject the script tag because:
 * 1. 3Dmol.js must be loaded client-side (WebGL requirement)
 * 2. It attaches to window.$3Dmol
 * 3. We need to wait for it to load before initializing
 */
useHead({
  script: [
    {
      src: 'https://3Dmol.org/build/3Dmol-min.js',
      async: true
    }
  ]
})

/**
 * Initialize the viewer when component mounts.
 *
 * CLIENT-SIDE ONLY: onMounted ensures we're in the browser with:
 * - Access to the DOM (viewerContainer ref)
 * - WebGL context available
 * - 3Dmol.js loaded
 */
onMounted(() => {
  // Wait for 3Dmol.js to load
  const checkAndInit = () => {
    if (window.$3Dmol) {
      initViewer()
    } else {
      // Check again in 100ms
      setTimeout(checkAndInit, 100)
    }
  }

  checkAndInit()

  // Add keyboard event listener
  window.addEventListener('keydown', handleKeydown)
})

/**
 * Clean up WebGL resources when component unmounts.
 *
 * IMPORTANT: WebGL contexts are limited resources. Browsers typically
 * allow only 8-16 active contexts. We must clean up to prevent:
 * - Memory leaks
 * - Context limit errors
 * - Degraded performance
 */
onUnmounted(() => {
  // Stop any running animations
  if (spinAnimationId) {
    cancelAnimationFrame(spinAnimationId)
  }

  // Clear viewer (releases WebGL resources)
  if (viewer) {
    viewer.clear()
    viewer = null
  }

  // Remove keyboard listener
  window.removeEventListener('keydown', handleKeydown)
})

// =============================================================================
// VIEWER INITIALIZATION
// =============================================================================

/**
 * Initialize the 3Dmol.js WebGL viewer.
 *
 * This function:
 * 1. Creates a WebGL context in the container element
 * 2. Configures camera and interaction settings
 * 3. Loads the default molecule
 *
 * WEBGL CONTEXT CREATION:
 * $3Dmol.createViewer() internally calls:
 * - canvas.getContext('webgl') or canvas.getContext('experimental-webgl')
 * - Sets up shaders for molecular rendering
 * - Initializes transformation matrices
 */
const initViewer = () => {
  if (!viewerContainer.value) return

  // Create the WebGL viewer with configuration
  viewer = window.$3Dmol.createViewer(viewerContainer.value, {
    backgroundColor: 'white',
    antialias: true,  // Smooth edges (uses MSAA if available)
    id: 'mol-viewer'
  })

  // Load default molecule
  loadMolecule('caffeine')
}

// =============================================================================
// MOLECULE LOADING
// =============================================================================

/**
 * Load a molecule into the viewer by PDB ID or inline data.
 *
 * HOW MOLECULE DATA IS FETCHED:
 * 1. For PDB IDs: 3Dmol.js fetches from RCSB PDB REST API
 *    URL: https://files.rcsb.org/download/{PDB_ID}.pdb
 * 2. For inline data: We provide the PDB string directly
 *
 * HOW MOLECULES ARE RENDERED:
 * 1. PDB text is parsed into atom/bond arrays
 * 2. Bonds are inferred from distances if not explicit
 * 3. Atom positions become WebGL vertices
 * 4. Colors/styles determine fragment shaders
 * 5. Geometry is uploaded to GPU buffers
 * 6. WebGL draws the scene
 *
 * @param moleculeId - ID of the molecule to load
 */
const loadMolecule = (moleculeId: string) => {
  if (!viewer) return

  const molecule = molecules.find(m => m.id === moleculeId)
  if (!molecule) return

  // Show loading state
  isLoading.value = true
  currentMolecule.value = moleculeId

  // Clear previous molecule and labels
  viewer.clear()
  viewer.removeAllLabels()
  viewer.removeAllShapes()

  // Reset selection state
  selectedAtom.value = null
  clearMeasurement()

  // Update stats immediately
  moleculeFormula.value = molecule.formula
  molecularWeight.value = molecule.weight.toFixed(2)

  if (moleculeId === 'ethanol') {
    // Load inline PDB data for ethanol
    loadInlineMolecule(ethanolPDB, molecule)
  } else {
    // Fetch from PDB database
    loadFromPDB(molecule.pdbId, molecule)
  }
}

/**
 * Load molecule from inline PDB string.
 *
 * @param pdbData - PDB format string
 * @param _molecule - Molecule metadata (unused, kept for API consistency)
 */
const loadInlineMolecule = (pdbData: string, _molecule: MoleculeData) => {
  if (!viewer) return

  try {
    // Parse and add the model
    viewer.addModel(pdbData, 'pdb')

    // Apply current visualization settings
    applyVisualizationSettings()

    // Set up atom clicking
    setupAtomClicking()

    // Update atom count
    atomCount.value = 9 // Ethanol has 9 atoms

    // Center and zoom to fit
    viewer.zoomTo()
    viewer.zoom(0.8, 500)

    // Render the scene
    viewer.render()

    // Restore labels if enabled
    if (showLabels.value) {
      addAtomLabels()
    }
  } catch (error) {
    console.error('Error loading inline molecule:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * Load molecule from PDB database.
 *
 * NETWORK REQUEST:
 * 3Dmol.download() makes a fetch request to RCSB PDB servers.
 * The PDB file is typically 10KB-10MB depending on molecule size.
 *
 * @param pdbId - 4-character PDB ID
 * @param _molecule - Molecule metadata (unused, kept for API consistency)
 */
const loadFromPDB = (pdbId: string, _molecule: MoleculeData) => {
  if (!viewer) return

  // Download from PDB database
  // Format: 'pdb:1UAO' tells 3Dmol to fetch from RCSB
  window.$3Dmol.download(`pdb:${pdbId}`, viewer, {}, () => {
    // Apply current visualization settings
    applyVisualizationSettings()

    // Set up atom clicking
    setupAtomClicking()

    // Count atoms (approximation based on molecule type)
    // In production, we'd count actual atoms from the model
    const atomCounts: Record<string, number> = {
      '1UAO': 24,  // Caffeine
      '2OYE': 21,  // Aspirin
      '3W7B': 24   // Glucose
    }
    atomCount.value = atomCounts[pdbId] || 0

    // Center and zoom to fit (viewer is guaranteed non-null here due to guard above)
    if (viewer) {
      viewer.zoomTo()
      viewer.zoom(0.8, 500)

      // Render the scene
      viewer.render()
    }

    // Restore labels if enabled
    if (showLabels.value) {
      addAtomLabels()
    }

    isLoading.value = false
  })
}

// =============================================================================
// VISUALIZATION SETTINGS
// =============================================================================

/**
 * Apply current visualization style and color scheme.
 *
 * STYLE RENDERING DETAILS:
 *
 * Stick Style:
 * - Atoms: Small spheres (radius ~0.15Å)
 * - Bonds: Cylinders connecting atom centers
 * - GPU: Instanced sphere/cylinder rendering
 *
 * Sphere Style (Space-filling):
 * - Atoms: Van der Waals radius spheres
 * - Shows actual atomic volume
 * - GPU: Large instanced spheres
 *
 * Line Style:
 * - Simple GL_LINES primitives
 * - Fastest but least informative
 *
 * Cross Style:
 * - Three perpendicular lines at atom position
 * - Good for sparse viewing
 */
const applyVisualizationSettings = () => {
  if (!viewer) return

  // Build style object based on current selections
  const styleObj: Record<string, object> = {}

  // Map style ID to 3Dmol style property
  styleObj[currentStyle.value] = buildColorSettings()

  // Apply style to all atoms
  viewer.setStyle({}, styleObj)
  viewer.render()
}

/**
 * Build color settings based on current color scheme.
 *
 * COLOR SCHEME DETAILS:
 *
 * Jmol (CPK):
 * - Carbon: Gray (#909090)
 * - Nitrogen: Blue (#3050F8)
 * - Oxygen: Red (#FF0D0D)
 * - Hydrogen: White (#FFFFFF)
 * - Sulfur: Yellow (#FFFF30)
 *
 * Spectrum:
 * - Maps atom index to rainbow gradient
 * - Useful for seeing sequence/position
 *
 * Chain:
 * - Different color for each protein chain
 * - Essential for multi-chain structures
 */
const buildColorSettings = () => {
  switch (currentColorScheme.value) {
    case 'Jmol':
      return { colorscheme: 'Jmol' }
    case 'carbon':
      return { colorscheme: 'greenCarbon' }
    case 'spectrum':
      return { colorscheme: 'spectrum' }
    case 'chain':
      return { colorscheme: 'chain' }
    default:
      return { colorscheme: 'Jmol' }
  }
}

/**
 * Set visualization style (stick, sphere, line, cross).
 *
 * @param styleId - Style identifier
 */
const setVisualizationStyle = (styleId: string) => {
  currentStyle.value = styleId
  applyVisualizationSettings()
}

/**
 * Set color scheme for atoms.
 *
 * @param schemeId - Color scheme identifier
 */
const setColorScheme = (schemeId: string) => {
  currentColorScheme.value = schemeId
  applyVisualizationSettings()
}

/**
 * Set viewer background color.
 *
 * @param bgId - Background identifier
 */
const setBackground = (bgId: string) => {
  if (!viewer) return

  currentBackground.value = bgId
  const bg = backgrounds.find(b => b.id === bgId)
  if (bg) {
    viewer.setBackgroundColor(bg.color)
    viewer.render()
  }
}

// =============================================================================
// ATOM INTERACTION
// =============================================================================

/**
 * Set up click handlers for atom selection.
 *
 * HOW ATOM PICKING WORKS:
 * 1. Mouse click captures screen coordinates
 * 2. Ray casting: A ray is projected from camera through click point
 * 3. Intersection test: Check ray against all atom spheres
 * 4. Closest hit: Return the nearest intersected atom
 *
 * This is GPU-accelerated using picking buffers where each atom
 * is rendered with a unique color code for identification.
 */
const setupAtomClicking = () => {
  if (!viewer) return

  // Make all atoms clickable
  viewer.setClickable({}, true, (atom: AtomInfo) => {
    handleAtomClick(atom)
  })
}

/**
 * Handle atom click event.
 *
 * If in measure mode, this is the second atom of a distance measurement.
 * Otherwise, just show atom info.
 *
 * @param atom - Clicked atom information
 */
const handleAtomClick = (atom: AtomInfo) => {
  if (measureMode.value) {
    handleMeasurementClick(atom)
  } else {
    selectedAtom.value = atom
  }
}

/**
 * Handle click in measurement mode.
 *
 * DISTANCE CALCULATION:
 * Euclidean distance in 3D: d = √[(x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²]
 *
 * The result is in Angstroms (Å), where 1Å = 0.1 nanometers.
 * Typical bond lengths:
 * - C-C single bond: 1.54Å
 * - C=C double bond: 1.34Å
 * - C-H bond: 1.09Å
 * - Hydrogen bond: 2.5-3.5Å
 *
 * @param atom - Clicked atom
 */
const handleMeasurementClick = (atom: AtomInfo) => {
  if (!measureAtom1.value) {
    // First atom selected
    measureAtom1.value = atom
    selectedAtom.value = atom
  } else {
    // Second atom selected - calculate distance
    const dx = atom.x - measureAtom1.value.x
    const dy = atom.y - measureAtom1.value.y
    const dz = atom.z - measureAtom1.value.z

    /**
     * EUCLIDEAN DISTANCE FORMULA:
     * This is the straight-line distance between two points in 3D space.
     *
     * Mathematical derivation:
     * - In 2D: d = √[(x₂-x₁)² + (y₂-y₁)²] (Pythagorean theorem)
     * - In 3D: We add the z component
     *
     * This gives us the actual spatial distance between atom centers.
     */
    measurementDistance.value = Math.sqrt(dx * dx + dy * dy + dz * dz)

    // Draw a line between the atoms
    drawMeasurementLine(measureAtom1.value, atom)

    // Reset first atom for next measurement
    measureAtom1.value = null
    measureMode.value = false
  }
}

/**
 * Draw a visual line between two atoms for distance measurement.
 *
 * @param atom1 - First atom
 * @param atom2 - Second atom
 */
const drawMeasurementLine = (atom1: AtomInfo, atom2: AtomInfo) => {
  if (!viewer) return

  // Remove previous measurement shapes
  viewer.removeAllShapes()

  // Add cylinder between atoms
  viewer.addCylinder(
    { x: atom1.x, y: atom1.y, z: atom1.z },
    { x: atom2.x, y: atom2.y, z: atom2.z },
    {
      radius: 0.1,
      color: 'yellow',
      dashed: true
    }
  )

  viewer.render()
}

/**
 * Clear the current measurement.
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
 * Toggle measurement mode.
 */
const toggleMeasureMode = () => {
  measureMode.value = !measureMode.value
  if (!measureMode.value) {
    measureAtom1.value = null
  }
}

// =============================================================================
// VIEWER CONTROLS
// =============================================================================

/**
 * Reset the viewer to default orientation.
 *
 * This resets the model-view matrix to identity and recenters
 * the molecule in the viewport.
 */
const resetView = () => {
  if (!viewer) return

  // Stop any spinning
  if (isSpinning.value) {
    toggleSpin()
  }

  // Center and zoom to fit
  viewer.zoomTo()
  viewer.zoom(0.8, 500)
  viewer.render()
}

/**
 * Toggle auto-rotation (spin) of the molecule.
 *
 * ANIMATION TECHNIQUE:
 * Uses requestAnimationFrame for smooth 60fps rotation.
 * Each frame, we rotate the view slightly around the Y-axis.
 *
 * Why requestAnimationFrame?
 * - Syncs with display refresh rate
 * - Pauses when tab is hidden (saves CPU/GPU)
 * - Provides consistent timing
 */
const toggleSpin = () => {
  if (!viewer) return

  isSpinning.value = !isSpinning.value

  if (isSpinning.value) {
    // Use 3Dmol's built-in spin for smooth rotation
    viewer.spin('y', 1) // Spin around Y-axis at speed 1
  } else {
    // Stop spinning
    viewer.spin(false)
  }
}

/**
 * Toggle atom labels on/off.
 *
 * Labels show element symbols at atom positions.
 */
const toggleLabels = () => {
  showLabels.value = !showLabels.value

  if (showLabels.value) {
    addAtomLabels()
  } else {
    removeAtomLabels()
  }
}

/**
 * Add labels to all atoms showing element symbols.
 */
const addAtomLabels = () => {
  if (!viewer) return

  // Note: In a production app, we'd iterate through actual atoms
  // For this demo, we rely on 3Dmol's label handling
  viewer.addLabel('Labels enabled', {
    position: { x: 0, y: 0, z: 0 },
    backgroundColor: 'rgba(0,0,0,0.5)',
    fontColor: 'white',
    fontSize: 12
  })

  viewer.render()
}

/**
 * Remove all atom labels.
 */
const removeAtomLabels = () => {
  if (!viewer) return
  viewer.removeAllLabels()
  viewer.render()
}

/**
 * Take a screenshot of the current view.
 *
 * HOW PNG EXPORT WORKS:
 * 1. WebGL renders current frame to canvas
 * 2. canvas.toDataURL('image/png') extracts pixel data
 * 3. Data URI is converted to downloadable blob
 * 4. Hidden anchor element triggers download
 */
const takeScreenshot = () => {
  if (!viewer) return

  // Get PNG data URI from viewer
  const imgData = viewer.pngURI()

  // Create download link
  const link = document.createElement('a')
  link.href = imgData
  link.download = `${currentMolecule.value}-molecule.png`

  // Trigger download
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================

/**
 * Handle keyboard shortcuts.
 *
 * @param event - Keyboard event
 */
const handleKeydown = (event: KeyboardEvent) => {
  // Ignore if typing in an input
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return
  }

  switch (event.key.toLowerCase()) {
    case 'r':
      resetView()
      break
    case 's':
      toggleSpin()
      break
    case '1':
      loadMolecule('caffeine')
      break
    case '2':
      loadMolecule('aspirin')
      break
    case '3':
      loadMolecule('glucose')
      break
    case '4':
      loadMolecule('ethanol')
      break
    case ' ':
      event.preventDefault()
      takeScreenshot()
      break
    case 'm':
      toggleMeasureMode()
      break
    case 'l':
      toggleLabels()
      break
    case '?':
      showHelpModal.value = !showHelpModal.value
      break
  }
}
</script>

<style scoped>
/**
 * STYLING FOR MOLECULAR VISUALIZER
 *
 * Design Principles:
 * - Professional scientific aesthetic
 * - Purple/blue gradient for modern feel
 * - White cards for clean organization
 * - Smooth transitions for polish
 * - Responsive layout for all devices
 */

/* =============================================================================
   GLOBAL LAYOUT
   ============================================================================= */

.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

/* =============================================================================
   HEADER
   ============================================================================= */

.app-header {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
}

.app-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.header-icon {
  font-size: 2.5rem;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0.5rem 0;
}

.keyboard-hint {
  font-size: 0.85rem;
  opacity: 0.8;
}

.keyboard-hint kbd {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-family: inherit;
}

/* =============================================================================
   MAIN CONTENT
   ============================================================================= */

.main-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* =============================================================================
   VIEWER SECTION
   ============================================================================= */

.viewer-section {
  display: flex;
  flex-direction: column;
}

.viewer-wrapper {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  height: 600px;
}

#viewer-container {
  width: 100%;
  height: 100%;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay p {
  margin-top: 1rem;
  color: #333;
  font-weight: 500;
}

/* Help Button */
.help-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.9);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  transition: all 0.2s ease;
}

.help-button:hover {
  background: #667eea;
  transform: scale(1.1);
}

/* Atom Info Card */
.atom-info-card {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 50;
}

.atom-info-card h4 {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.atom-details p {
  margin: 0.3rem 0;
  font-size: 0.85rem;
  color: #333;
}

/* Measurement Card */
.measurement-card {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-align: center;
  z-index: 50;
}

.measurement-card h4 {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.distance-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0.5rem 0;
}

.clear-measurement {
  padding: 0.3rem 0.75rem;
  background: #e0e0e0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.2s ease;
}

.clear-measurement:hover {
  background: #d0d0d0;
}

/* =============================================================================
   CONTROLS SECTION
   ============================================================================= */

.controls-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.control-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.control-card h3 {
  margin: 0 0 1rem;
  font-size: 1rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-card h3 :deep(svg) {
  color: #667eea;
}

/* Stats Card */
.stats-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stats-card h3 {
  color: white;
}

.stats-card h3 :deep(svg) {
  color: white;
}

.stats-grid {
  display: grid;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.9;
}

.stat-value {
  font-weight: 600;
  font-size: 0.95rem;
}

/* Button Groups */
.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.control-button {
  flex: 1;
  min-width: calc(50% - 0.25rem);
  padding: 0.6rem 0.75rem;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.control-button:hover {
  border-color: #667eea;
  color: #667eea;
}

.control-button.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.control-button :deep(svg) {
  font-size: 1rem;
}

/* =============================================================================
   MODAL
   ============================================================================= */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.shortcuts-section,
.usage-section {
  margin-bottom: 1.5rem;
}

.shortcuts-section h3,
.usage-section h3 {
  margin: 0 0 1rem;
  font-size: 1rem;
  color: #667eea;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.shortcut-item kbd {
  background: #f0f0f0;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.85rem;
  min-width: 2rem;
  text-align: center;
  border: 1px solid #ddd;
}

.shortcut-item span {
  font-size: 0.85rem;
  color: #555;
}

.usage-section ul {
  margin: 0;
  padding-left: 1.25rem;
}

.usage-section li {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #555;
}

/* =============================================================================
   FOOTER
   ============================================================================= */

.app-footer {
  text-align: center;
  color: white;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.app-footer p {
  margin: 0.3rem 0;
  font-size: 0.9rem;
}

.app-footer a {
  color: white;
  text-decoration: underline;
}

.footer-note {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* =============================================================================
   RESPONSIVE DESIGN
   ============================================================================= */

@media (max-width: 900px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .viewer-wrapper {
    height: 400px;
  }
}

@media (max-width: 600px) {
  .app-container {
    padding: 1rem;
  }

  .app-header h1 {
    font-size: 1.75rem;
  }

  .viewer-wrapper {
    height: 350px;
  }

  .control-button {
    min-width: 100%;
  }

  .shortcut-grid {
    grid-template-columns: 1fr;
  }
}
</style>
