<!--
  ControlPanel Component

  Contains all control cards for the molecular viewer.
  Handles molecule selection, visualization settings, and tools.
-->

<template>
  <div class="controls-section">
    <!-- Stats Panel -->
    <StatsCard :stats="stats" />

    <!-- Molecule Selector -->
    <ControlCard title="Select Molecule" icon="mdi:flask">
      <ButtonGroup
        :options="moleculeOptions"
        :model-value="currentMolecule"
        @update:model-value="$emit('update:molecule', $event)"
      />
    </ControlCard>

    <!-- Visualization Style -->
    <ControlCard title="Visualization Style" icon="mdi:eye">
      <ButtonGroup
        :options="styleOptions"
        :model-value="currentStyle"
        @update:model-value="$emit('update:style', $event)"
      />
    </ControlCard>

    <!-- Color Scheme -->
    <ControlCard title="Color Scheme" icon="mdi:palette">
      <ButtonGroup
        :options="colorOptions"
        :model-value="currentColorScheme"
        @update:model-value="$emit('update:colorScheme', $event)"
      />
    </ControlCard>

    <!-- Background -->
    <ControlCard title="Background" icon="mdi:image">
      <ButtonGroup
        :options="backgroundOptions"
        :model-value="currentBackground"
        @update:model-value="$emit('update:background', $event)"
      />
    </ControlCard>

    <!-- Tools -->
    <ControlCard title="Tools" icon="mdi:tools">
      <div class="button-group">
        <ActionButton
          icon="mdi:rotate-3d"
          :active="isSpinning"
          @click="$emit('toggleSpin')"
        >
          {{ isSpinning ? 'Stop Spin' : 'Auto-Rotate' }}
        </ActionButton>

        <ActionButton
          icon="mdi:ruler"
          :active="measureMode"
          @click="$emit('toggleMeasure')"
        >
          {{ measureMode ? 'Measuring...' : 'Measure' }}
        </ActionButton>

        <ActionButton
          icon="mdi:label"
          :active="showLabels"
          @click="$emit('toggleLabels')"
        >
          {{ showLabels ? 'Hide Labels' : 'Show Labels' }}
        </ActionButton>
      </div>

      <div class="button-group" style="margin-top: 0.5rem;">
        <ActionButton icon="mdi:restore" @click="$emit('resetView')">
          Reset View
        </ActionButton>

        <ActionButton icon="mdi:camera" @click="$emit('screenshot')">
          Screenshot
        </ActionButton>
      </div>
    </ControlCard>
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
