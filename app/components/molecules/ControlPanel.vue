<!--
  ControlPanel Component

  Contains all control cards for the molecular viewer.
  Handles molecule selection, visualization settings, and tools.
-->

<template>
  <div class="controls-section">
    <!-- Stats Panel -->
    <MoleculesStatsCard :stats="stats" />

    <!-- Molecule Selector -->
    <UiControlCard title="Select Molecule" icon="mdi:flask">
      <UiButtonGroup
        :options="moleculeOptions"
        :model-value="currentMolecule"
        @update:model-value="$emit('update:molecule', $event)"
      />
    </UiControlCard>

    <!-- Visualization Style -->
    <UiControlCard title="Visualization Style" icon="mdi:eye">
      <UiButtonGroup
        :options="styleOptions"
        :model-value="currentStyle"
        @update:model-value="$emit('update:style', $event)"
      />
    </UiControlCard>

    <!-- Color Scheme -->
    <UiControlCard title="Color Scheme" icon="mdi:palette">
      <UiButtonGroup
        :options="colorOptions"
        :model-value="currentColorScheme"
        @update:model-value="$emit('update:colorScheme', $event)"
      />
    </UiControlCard>

    <!-- Background -->
    <UiControlCard title="Background" icon="mdi:image">
      <UiButtonGroup
        :options="backgroundOptions"
        :model-value="currentBackground"
        @update:model-value="$emit('update:background', $event)"
      />
    </UiControlCard>

    <!-- Tools -->
    <UiControlCard title="Tools" icon="mdi:tools">
      <div class="button-group">
        <UiActionButton
          icon="mdi:rotate-3d"
          :active="isSpinning"
          @click="$emit('toggleSpin')"
        >
          {{ isSpinning ? 'Stop Spin' : 'Auto-Rotate' }}
        </UiActionButton>

        <UiActionButton
          icon="mdi:ruler"
          :active="measureMode"
          @click="$emit('toggleMeasure')"
        >
          {{ measureMode ? 'Measuring...' : 'Measure' }}
        </UiActionButton>

        <UiActionButton
          icon="mdi:label"
          :active="showLabels"
          @click="$emit('toggleLabels')"
        >
          {{ showLabels ? 'Hide Labels' : 'Show Labels' }}
        </UiActionButton>
      </div>

      <div class="button-group" style="margin-top: 0.5rem;">
        <UiActionButton icon="mdi:restore" @click="$emit('resetView')">
          Reset View
        </UiActionButton>

        <UiActionButton icon="mdi:camera" @click="$emit('screenshot')">
          Screenshot
        </UiActionButton>

        <UiActionButton
          icon="mdi:compare"
          @click="$emit('toggle-comparison')"
        >
          Compare
        </UiActionButton>
      </div>
    </UiControlCard>
  </div>
</template>

<script setup lang="ts">
import type { MoleculeStats } from '~/types/molecule'
import {
  MOLECULES,
  VISUALIZATION_STYLES,
  COLOR_SCHEMES,
  BACKGROUNDS
} from '~/constants/molecules'

interface Props {
  stats: MoleculeStats
  currentMolecule: string
  currentStyle: string
  currentColorScheme: string
  currentBackground: string
  isSpinning: boolean
  measureMode: boolean
  showLabels: boolean
  comparisonMode: boolean
}

defineProps<Props>()

defineEmits<{
  'update:molecule': [value: string]
  'update:style': [value: string]
  'update:colorScheme': [value: string]
  'update:background': [value: string]
  'toggleSpin': []
  'toggleMeasure': []
  'toggleLabels': []
  'resetView': []
  'screenshot': []
  'toggle-comparison': []
}>()

// Transform data for ButtonGroup component
const moleculeOptions = MOLECULES.map(m => ({ id: m.id, name: m.name }))
const styleOptions = VISUALIZATION_STYLES
const colorOptions = COLOR_SCHEMES
const backgroundOptions = BACKGROUNDS
</script>

<style scoped>
.controls-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
