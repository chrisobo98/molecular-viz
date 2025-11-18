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
      <h1>
        <Icon name="mdi:molecule" class="header-icon" />
        Molecular Visualizer
      </h1>
      <p class="subtitle">WebGL-Powered 3D Molecular Viewer</p>
      <span class="keyboard-hint">Press <kbd>?</kbd> for shortcuts</span>
    </header>

    <!-- Main Content -->
    <main class="main-content">
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
      </div>

      <!-- Control Panel -->
      <MoleculesControlPanel
        :stats="moleculeStats"
        :current-molecule="currentMolecule"
        :current-style="currentStyle"
        :current-color-scheme="currentColorScheme"
        :current-background="currentBackground"
        :is-spinning="isSpinning"
        :measure-mode="measureMode"
        :show-labels="showLabels"
        @update:molecule="loadMolecule"
        @update:style="setStyle"
        @update:color-scheme="setColorScheme"
        @update:background="setBackground"
        @toggle-spin="toggleSpin"
        @toggle-measure="toggleMeasureMode"
        @toggle-labels="toggleLabels"
        @reset-view="resetView"
        @screenshot="takeScreenshot"
      />
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <p>
        Built with <strong>Nuxt 3</strong>, <strong>TypeScript</strong>, and
        <strong>3Dmol.js (WebGL)</strong> by Christopher Bermudez |
        <a href="https://christopherbermudez.com" target="_blank">
          christopherbermudez.com
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

import { ref } from 'vue'
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
  currentMoleculeName,
  moleculeStats,
  hasFirstAtom,
  loadMolecule,
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

/* Header */
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

/* Main Content */
.main-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
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

/* Footer */
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

/* Responsive Design */
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
}
</style>
