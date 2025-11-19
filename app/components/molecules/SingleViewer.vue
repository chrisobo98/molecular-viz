<!--
  SingleViewer Component

  A self-contained molecular viewer that can be instantiated multiple times.
  Used for both single view and comparison mode.

  This component encapsulates:
  - WebGL viewer initialization
  - Molecule loading and rendering
  - Atom selection and measurement
  - All visualization controls
-->

<template>
  <div class="single-viewer">
    <div class="viewer-wrapper">
      <!-- Loading Overlay -->
      <MoleculesLoadingOverlay
        :loading="isLoading"
        :molecule-name="currentMoleculeName"
      />

      <!-- Viewer Container -->
      <div ref="viewerContainer" class="viewer-container" />

      <!-- Atom Info -->
      <MoleculesAtomInfoCard :atom="selectedAtom" />

      <!-- Distance Measurement -->
      <MoleculesMeasurementCard
        :distance="measurementDistance"
        :measure-mode="measureMode"
        :has-first-atom="hasFirstAtom"
        @clear="clearMeasurement"
      />

      <!-- Viewer Label (for comparison mode) -->
      <div v-if="label" class="viewer-label">{{ label }}</div>
    </div>

    <!-- Controls (only shown if showControls is true) -->
    <div v-if="showControls" class="viewer-controls">
      <!-- PDB Search -->
      <div class="control-row pdb-search">
        <input
          v-model="pdbInput"
          type="text"
          placeholder="PDB ID (e.g., 1CRN)"
          maxlength="4"
          class="pdb-input"
          @keyup.enter="handlePdbSearch"
        >
        <button class="search-btn" :disabled="isLoading" @click="handlePdbSearch">
          <Icon v-if="isLoading" name="mdi:loading" class="spinning" />
          <Icon v-else name="mdi:magnify" />
        </button>
      </div>

      <!-- Search Error -->
      <div v-if="searchError" class="search-error">
        {{ searchError }}
      </div>

      <!-- Molecule Selector -->
      <div class="control-row">
        <label>Preset:</label>
        <select v-model="selectedMoleculeId" @change="onMoleculeChange">
          <option v-for="mol in molecules" :key="mol.id" :value="mol.id">
            {{ mol.name }}
          </option>
        </select>
      </div>

      <!-- Style Selector -->
      <div class="control-row">
        <label>Style:</label>
        <select v-model="selectedStyle" @change="onStyleChange">
          <option v-for="style in styles" :key="style.id" :value="style.id">
            {{ style.name }}
          </option>
        </select>
      </div>

      <!-- Quick Actions -->
      <div class="control-row actions">
        <button :class="{ active: isSpinning }" @click="toggleSpin">
          {{ isSpinning ? 'Stop' : 'Spin' }}
        </button>
        <button @click="resetView">Reset</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * SingleViewer Component
 *
 * Reusable molecular viewer for single or comparison mode.
 * Each instance manages its own WebGL context and state.
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { AtomInfo, Viewer } from '~/types/molecule'
import {
  MOLECULES,
  VISUALIZATION_STYLES,
  ETHANOL_PDB,
  VIEWER_CONFIG,
  getMoleculeById
} from '~/constants/molecules'

// =============================================================================
// PROPS & EMITS
// =============================================================================

interface Props {
  /** Initial molecule to load */
  initialMolecule?: string
  /** Label to display on viewer (e.g., "Viewer A") */
  label?: string
  /** Whether to show inline controls */
  showControls?: boolean
  /** Background color */
  backgroundColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialMolecule: 'caffeine',
  label: '',
  showControls: true,
  backgroundColor: 'white'
})

const emit = defineEmits<{
  'molecule-loaded': [moleculeId: string]
}>()

// =============================================================================
// CONSTANTS
// =============================================================================

const molecules = MOLECULES
const styles = VISUALIZATION_STYLES

// =============================================================================
// STATE
// =============================================================================

// Viewer instance
let viewer: Viewer | null = null
const viewerContainer = ref<HTMLElement | null>(null)

// Loading state
const isLoading = ref(false)

// Current selections
const selectedMoleculeId = ref(props.initialMolecule)
const selectedStyle = ref(VIEWER_CONFIG.defaultStyle)

// Feature toggles
const isSpinning = ref(false)
const measureMode = ref(false)

// Atom selection
const selectedAtom = ref<AtomInfo | null>(null)
const measureAtom1 = ref<AtomInfo | null>(null)
const measurementDistance = ref<number | null>(null)

// PDB search
const pdbInput = ref('')
const searchError = ref<string | null>(null)
const customPdbId = ref<string | null>(null)

// =============================================================================
// COMPUTED
// =============================================================================

const currentMoleculeName = computed(() => {
  if (customPdbId.value) {
    return `PDB: ${customPdbId.value.toUpperCase()}`
  }
  const mol = getMoleculeById(selectedMoleculeId.value)
  return mol?.name || 'molecule'
})

const hasFirstAtom = computed(() => measureAtom1.value !== null)

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate Euclidean distance between two atoms
 */
const calculateDistance = (a: AtomInfo, b: AtomInfo): number => {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dz = b.z - a.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
 * Build color style object
 */
const buildColorStyle = (): object => {
  return { colorscheme: 'Jmol' }
}

// =============================================================================
// VIEWER METHODS
// =============================================================================

/**
 * Initialize WebGL viewer
 */
const initViewer = () => {
  if (!viewerContainer.value || !window.$3Dmol) return

  viewer = window.$3Dmol.createViewer(viewerContainer.value, {
    backgroundColor: props.backgroundColor,
    antialias: true
  })

  loadMolecule(selectedMoleculeId.value)
}

/**
 * Wait for 3Dmol.js to load
 */
const waitForLibraryAndInit = () => {
  if (window.$3Dmol) {
    initViewer()
  } else {
    setTimeout(waitForLibraryAndInit, 100)
  }
}

/**
 * Load molecule by ID
 */
const loadMolecule = (moleculeId: string) => {
  if (!viewer) return

  const molecule = getMoleculeById(moleculeId)
  if (!molecule) return

  isLoading.value = true
  selectedMoleculeId.value = moleculeId
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
 * Search and load from PDB database
 */
const handlePdbSearch = () => {
  if (!viewer || !pdbInput.value.trim()) {
    searchError.value = 'Please enter a PDB ID'
    return
  }

  const cleanId = pdbInput.value.trim().toUpperCase()

  // Validate PDB ID format
  if (!/^[A-Z0-9]{4}$/i.test(cleanId)) {
    searchError.value = 'PDB ID must be 4 characters'
    return
  }

  isLoading.value = true
  searchError.value = null
  customPdbId.value = cleanId

  // Clear previous state
  viewer.clear()
  viewer.removeAllLabels()
  viewer.removeAllShapes()
  selectedAtom.value = null
  clearMeasurement()

  window.$3Dmol.download(`pdb:${cleanId}`, viewer, {}, () => {
    // Check if model was loaded by checking atoms
    const atoms = viewer?.selectedAtoms({})
    if (!atoms || atoms.length === 0) {
      searchError.value = `PDB ID "${cleanId}" not found`
      customPdbId.value = null
      isLoading.value = false
      return
    }

    applyStyle()
    setupAtomClicking()

    if (viewer) {
      viewer.zoomTo()
      viewer.zoom(VIEWER_CONFIG.zoomFactor, VIEWER_CONFIG.animationDuration)
      viewer.render()
    }

    emit('molecule-loaded', cleanId)
    isLoading.value = false
  })
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
 * Finalize molecule load
 */
const finalizeLoad = (_pdbId: string) => {
  if (!viewer) return

  applyStyle()
  setupAtomClicking()

  viewer.zoomTo()
  viewer.zoom(VIEWER_CONFIG.zoomFactor, VIEWER_CONFIG.animationDuration)
  viewer.render()

  emit('molecule-loaded', selectedMoleculeId.value)
}

/**
 * Apply current visualization style
 */
const applyStyle = () => {
  if (!viewer) return

  const styleObj: Record<string, object> = {
    [selectedStyle.value]: buildColorStyle()
  }

  viewer.setStyle({}, styleObj)
  viewer.render()
}

/**
 * Setup atom click handlers
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
 * Handle measurement click
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
 * Draw measurement line
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
 * Reset view
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
 * Toggle auto-rotate
 */
const toggleSpin = () => {
  if (!viewer) return

  isSpinning.value = !isSpinning.value
  viewer.spin(isSpinning.value ? VIEWER_CONFIG.spinAxis : false, VIEWER_CONFIG.spinSpeed)
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

const onMoleculeChange = () => {
  loadMolecule(selectedMoleculeId.value)
}

const onStyleChange = () => {
  applyStyle()
}

// =============================================================================
// LIFECYCLE
// =============================================================================

onMounted(() => {
  waitForLibraryAndInit()
})

onUnmounted(() => {
  if (viewer) {
    viewer.clear()
    viewer = null
  }
})

// Watch for initial molecule changes from parent
watch(() => props.initialMolecule, (newMolecule) => {
  if (newMolecule && newMolecule !== selectedMoleculeId.value) {
    loadMolecule(newMolecule)
  }
})
</script>

<style scoped>
.single-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.viewer-wrapper {
  position: relative;
  flex: 1;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  min-height: 300px;
}

.viewer-container {
  width: 100%;
  height: 100%;
}

.viewer-label {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background: rgba(59, 130, 246, 0.9);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 60;
}

.viewer-controls {
  padding: 0.75rem;
  background: rgba(30, 41, 59, 0.8);
  border-top: 1px solid rgba(71, 85, 105, 0.5);
}

.control-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.control-row:last-child {
  margin-bottom: 0;
}

.control-row label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  min-width: 50px;
}

.control-row select {
  flex: 1;
  padding: 0.3rem 0.5rem;
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 4px;
  font-size: 0.8rem;
  background: rgba(51, 65, 85, 0.5);
  color: #e2e8f0;
}

.control-row select:focus {
  outline: none;
  border-color: #3b82f6;
}

/* PDB Search Styles */
.control-row.pdb-search {
  gap: 0.4rem;
}

.pdb-input {
  flex: 1;
  padding: 0.35rem 0.5rem;
  border: 1px solid rgba(71, 85, 105, 0.5);
  background: rgba(51, 65, 85, 0.5);
  color: #e2e8f0;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.pdb-input::placeholder {
  color: #64748b;
  text-transform: none;
}

.pdb-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.search-btn {
  padding: 0.35rem 0.5rem;
  border: 1px solid #3b82f6;
  background: #3b82f6;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.search-btn:hover:not(:disabled) {
  background: #2563eb;
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.search-error {
  padding: 0.3rem 0.5rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 4px;
  color: #fca5a5;
  font-size: 0.7rem;
  margin-bottom: 0.5rem;
}

.control-row.actions {
  justify-content: flex-end;
  gap: 0.5rem;
}

.control-row.actions button {
  padding: 0.3rem 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(51, 65, 85, 0.5);
  color: #e2e8f0;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-row.actions button:hover {
  background: rgba(59, 130, 246, 0.8);
  border-color: #3b82f6;
  color: white;
}

.control-row.actions button.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}
</style>
