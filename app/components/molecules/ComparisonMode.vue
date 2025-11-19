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
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.comparison-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.comparison-header h3 {
  margin: 0;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.swap-button:hover,
.exit-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.comparison-viewers {
  flex: 1;
  display: flex;
  min-height: 0;
}

.viewer-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.divider {
  width: 2px;
  background: #e0e0e0;
}

/* Responsive: Stack vertically on smaller screens */
@media (max-width: 900px) {
  .comparison-viewers {
    flex-direction: column;
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
