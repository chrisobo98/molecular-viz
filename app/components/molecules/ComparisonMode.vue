<!--
  ComparisonMode Component

  Split-screen view for comparing two molecules side-by-side.
  Each viewer is independent with its own controls.

  Features:
  - Two synchronized WebGL viewers
  - Independent molecule selection
  - Independent style controls
  - Swap molecules button
-->

<template>
  <div class="comparison-mode">
    <div class="comparison-header">
      <h3>
        <Icon name="mdi:compare" />
        Comparison Mode
      </h3>
      <div class="comparison-actions">
        <button class="swap-button" @click="swapMolecules">
          <Icon name="mdi:swap-horizontal" />
          Swap
        </button>
        <button class="exit-button" @click="$emit('exit')">
          <Icon name="mdi:close" />
          Exit
        </button>
      </div>
    </div>

    <div class="comparison-viewers">
      <div class="viewer-panel">
        <MoleculesSingleViewer
          :initial-molecule="leftMolecule"
          label="Viewer A"
          :show-controls="true"
          @molecule-loaded="onLeftMoleculeLoaded"
        />
      </div>

      <div class="divider" />

      <div class="viewer-panel">
        <MoleculesSingleViewer
          :initial-molecule="rightMolecule"
          label="Viewer B"
          :show-controls="true"
          @molecule-loaded="onRightMoleculeLoaded"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ComparisonMode Component
 *
 * Provides side-by-side molecular comparison with independent viewers.
 * Useful for comparing structural differences between molecules.
 */

import { ref } from 'vue'

// =============================================================================
// EMITS
// =============================================================================

defineEmits<{
  exit: []
}>()

// =============================================================================
// STATE
// =============================================================================

// Initial molecules for each viewer
const leftMolecule = ref('caffeine')
const rightMolecule = ref('aspirin')

// Track loaded molecules for swap functionality
const loadedLeftMolecule = ref('caffeine')
const loadedRightMolecule = ref('aspirin')

// =============================================================================
// METHODS
// =============================================================================

/**
 * Swap molecules between viewers
 */
const swapMolecules = () => {
  const temp = leftMolecule.value
  leftMolecule.value = rightMolecule.value
  rightMolecule.value = temp
}

/**
 * Track left viewer molecule
 */
const onLeftMoleculeLoaded = (moleculeId: string) => {
  loadedLeftMolecule.value = moleculeId
}

/**
 * Track right viewer molecule
 */
const onRightMoleculeLoaded = (moleculeId: string) => {
  loadedRightMolecule.value = moleculeId
}
</script>

<style scoped>
.comparison-mode {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  border: 1px solid rgba(71, 85, 105, 0.5);
  overflow: hidden;
}

.comparison-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(15, 23, 42, 0.8);
  border-bottom: 1px solid rgba(71, 85, 105, 0.5);
  color: white;
}

.comparison-header h3 {
  margin: 0;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e2e8f0;
}

.comparison-actions {
  display: flex;
  gap: 0.5rem;
}

.swap-button,
.exit-button {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(51, 65, 85, 0.5);
  color: #e2e8f0;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.swap-button:hover {
  background: rgba(59, 130, 246, 0.8);
  border-color: #3b82f6;
  color: white;
}

.exit-button:hover {
  background: rgba(239, 68, 68, 0.8);
  border-color: #ef4444;
  color: white;
}

.comparison-viewers {
  flex: 1;
  display: flex;
  min-height: 0;
  padding: 1rem;
  gap: 1rem;
}

.viewer-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.divider {
  width: 2px;
  background: rgba(71, 85, 105, 0.5);
  border-radius: 1px;
}

/* Responsive: Stack vertically on smaller screens */
@media (max-width: 900px) {
  .comparison-viewers {
    flex-direction: column;
    padding: 0.75rem;
  }

  .divider {
    width: 100%;
    height: 2px;
  }

  .viewer-panel {
    min-height: 250px;
  }
}
</style>
