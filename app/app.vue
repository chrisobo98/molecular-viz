<!--
  MOLECULAR VISUALIZATION APP
  ============================

  A WebGL-powered 3D molecular viewer built with Nuxt 3 and TypeScript.

  Architecture:
  - Components: Modular, reusable UI elements
  - Composables: Business logic separated from presentation
  - Constants: Single source of truth for configuration
  - Types: Strict TypeScript for maintainability

  Author: Christopher Bermudez | christopherbermudez.com
-->

<template>
  <div class="app-container">
    <!-- Help Modal -->
    <MoleculesHelpModal v-model="showHelpModal" />

    <!-- Header -->
    <header class="app-header">
      <div class="header-content">
        <div class="header-icon-wrapper">
          <Icon name="mdi:atom" class="header-icon" />
        </div>
        <div class="header-text">
          <h1>Molecular Viewer</h1>
          <p class="subtitle">WebGL-based 3D molecular visualization</p>
        </div>
      </div>
      <span class="keyboard-hint">Press <kbd>?</kbd> for shortcuts</span>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Comparison Mode -->
      <template v-if="comparisonMode">
        <div class="comparison-section">
          <MoleculesComparisonMode @exit="comparisonMode = false" />
        </div>
      </template>

      <!-- Single Viewer Mode -->
      <template v-else>
        <!-- Viewer Section -->
        <div class="viewer-section">
          <div class="viewer-wrapper">
            <!-- Loading Overlay -->
            <MoleculesLoadingOverlay
              :loading="isLoading"
              :molecule-name="currentMoleculeName"
            />

            <!-- Help Button -->
            <button
              class="help-button"
              title="Help & Shortcuts"
              @click="showHelpModal = true"
            >
              <Icon name="mdi:help-circle-outline" />
            </button>

            <!-- 3Dmol Viewer Container -->
            <div id="viewer-container" ref="viewerContainer" />

            <!-- Atom Info -->
            <MoleculesAtomInfoCard :atom="selectedAtom" />

            <!-- Distance Measurement -->
            <MoleculesMeasurementCard
              :distance="measurementDistance"
              :measure-mode="measureMode"
              :has-first-atom="hasFirstAtom"
              @clear="clearMeasurement"
            />
          </div>

          <!-- Quick Tools Bar (below viewer) -->
          <div class="quick-tools">
            <button
              title="Auto-Rotate (S)"
              :class="{ active: isSpinning }"
              @click="toggleSpin"
            >
              <Icon name="mdi:rotate-3d" />
              {{ isSpinning ? 'Stop' : 'Spin' }}
            </button>
            <button
              title="Measure Distance (M)"
              :class="{ active: measureMode }"
              @click="toggleMeasureMode"
            >
              <Icon name="mdi:ruler" />
              Measure
            </button>
            <button
              title="Toggle Labels (L)"
              :class="{ active: showLabels }"
              @click="toggleLabels"
            >
              <Icon name="mdi:label" />
              Labels
            </button>
            <button title="Reset View (R)" @click="resetView">
              <Icon name="mdi:restore" />
              Reset
            </button>
            <button title="Screenshot (Space)" @click="takeScreenshot">
              <Icon name="mdi:camera" />
              Screenshot
            </button>
            <button title="Compare Molecules" @click="comparisonMode = true">
              <Icon name="mdi:compare" />
              Compare
            </button>
          </div>
        </div>

        <!-- Control Panel -->
        <MoleculesControlPanel
          :stats="moleculeStats"
          :current-molecule="currentMolecule"
          :current-style="currentStyle"
          :current-color-scheme="currentColorScheme"
          :current-background="currentBackground"
          :is-searching="isLoading"
          :search-error="searchError"
          @update:molecule="loadMolecule"
          @update:style="setStyle"
          @update:color-scheme="setColorScheme"
          @update:background="setBackground"
          @search-pdb="searchPDB"
          @clear-search-error="clearSearchError"
        />
      </template>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <p>
        Built with <strong>Nuxt 3</strong>, <strong>TypeScript</strong>, and
        <strong>3Dmol.js (WebGL)</strong> by Christopher Bermudez |
        <a href="https://github.com/chrisobo98/molecular-viz" target="_blank">
          <Icon name="mdi:github" /> View on GitHub
        </a>
      </p>
      <p class="footer-note">
        WebGL-powered molecular visualization demo for OpenEye/Cadence Molecular Sciences
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * Main Application Component
 *
 * Orchestrates the molecular viewer using composables and components.
 * Follows Vue 3 Composition API best practices.
 */

import { ref, watch, nextTick } from 'vue'
import { useMoleculeViewer } from '~/composables/useMoleculeViewer'
import { useKeyboardShortcuts } from '~/composables/useKeyboardShortcuts'

// Load 3Dmol.js via CDN
useHead({
  script: [
    {
      src: 'https://3Dmol.org/build/3Dmol-min.js',
      async: true
    }
  ]
})

// Initialize molecule viewer
const {
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
  currentMoleculeName,
  moleculeStats,
  hasFirstAtom,
  initViewer,
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
} = useMoleculeViewer()

// Help modal state
const showHelpModal = ref(false)

// Comparison mode state
const comparisonMode = ref(false)

// Molecule IDs for keyboard shortcuts
const moleculeIds = ['caffeine', 'aspirin', 'glucose', 'ethanol'] as const

// Setup keyboard shortcuts
useKeyboardShortcuts({
  onReset: resetView,
  onToggleSpin: toggleSpin,
  onLoadMolecule: (index: number) => {
    const id = moleculeIds[index]
    if (id) loadMolecule(id)
  },
  onScreenshot: takeScreenshot,
  onToggleMeasure: toggleMeasureMode,
  onToggleLabels: toggleLabels,
  onToggleHelp: () => { showHelpModal.value = !showHelpModal.value }
})

// Reinitialize viewer when exiting comparison mode
watch(comparisonMode, (newValue, oldValue) => {
  if (oldValue === true && newValue === false) {
    // Wait for DOM to update with the viewer container
    nextTick(() => {
      initViewer()
    })
  }
})
</script>

<style scoped>
/**
 * Application Styles
 *
 * Uses BEM-like naming for maintainability.
 * Scoped to prevent style leakage.
 */

.app-container {
  min-height: 100vh;
  background: linear-gradient(to bottom right, #0f172a, #1e3a5f, #0f172a);
  padding: 0;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  margin: 0.5rem 0.25rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(71, 85, 105, 0.3);
  overflow: hidden;
  min-height: calc(100vh - 1rem);
}

/* Header */
.app-header {
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(71, 85, 105, 0.5);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon-wrapper {
  background: #3b82f6;
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon {
  font-size: 1.5rem;
  color: white;
}

.header-text h1 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: white;
}

.subtitle {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0;
}

.keyboard-hint {
  font-size: 0.75rem;
  color: #94a3b8;
}

.keyboard-hint kbd {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-family: inherit;
  color: white;
}

/* Main Content */
.main-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem;
  overflow-x: hidden;
}

.main-content > * {
  min-width: 0;
}

/* Comparison Section */
.comparison-section {
  grid-column: 1 / -1;
  height: 600px;
}

/* Viewer Section */
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

/* Quick Tools Bar */
.quick-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  border: 1px solid rgba(71, 85, 105, 0.5);
}

.quick-tools button {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(51, 65, 85, 0.5);
  color: #e2e8f0;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-tools button:hover {
  background: rgba(59, 130, 246, 0.8);
  border-color: #3b82f6;
  color: white;
}

.quick-tools button.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

/* Help Button */
.help-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.9);
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
  background: #3b82f6;
  transform: scale(1.1);
}

/* Footer */
.app-footer {
  text-align: center;
  color: #94a3b8;
  padding: 1.5rem;
  border-top: 1px solid rgba(71, 85, 105, 0.5);
  background: rgba(15, 23, 42, 0.5);
}

.app-footer p {
  margin: 0.3rem 0;
  font-size: 0.85rem;
}

.app-footer strong {
  color: #e2e8f0;
}

.app-footer a {
  color: #3b82f6;
  text-decoration: none;
}

.app-footer a:hover {
  text-decoration: underline;
}

.footer-note {
  font-size: 0.75rem;
  color: #64748b;
}

/* Responsive Design */
@media (max-width: 1100px) {
  .main-content {
    grid-template-columns: 1fr 300px;
  }
}

@media (max-width: 900px) {
  .main-content {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 1rem;
  }

  .viewer-wrapper {
    height: 400px;
  }

  .comparison-section {
    height: 500px;
  }

  .quick-tools {
    justify-content: center;
  }
}

@media (max-width: 600px) {
  .app-container {
    margin: 0.25rem;
    border-radius: 0.5rem;
    min-height: calc(100vh - 0.5rem);
  }

  .main-content {
    padding: 0.75rem;
    gap: 1rem;
  }

  .app-header {
    padding: 0.75rem 1rem;
  }

  .header-text h1 {
    font-size: 1rem;
  }

  .subtitle {
    font-size: 0.75rem;
  }

  .keyboard-hint {
    display: none;
  }

  .viewer-wrapper {
    height: 300px;
  }

  .quick-tools {
    padding: 0.75rem;
    gap: 0.4rem;
  }

  .quick-tools button {
    padding: 0.4rem 0.6rem;
    font-size: 0.75rem;
  }

  .app-footer {
    padding: 1rem;
  }

  .app-footer p {
    font-size: 0.75rem;
  }
}
</style>
