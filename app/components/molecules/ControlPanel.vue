<!--
  ControlPanel Component

  Contains all control cards for the molecular viewer.
  Handles molecule selection, visualization settings, and tools.
-->

<template>
  <div class="controls-section">
    <!-- Stats Panel -->
    <MoleculesStatsCard :stats="stats" />

    <!-- PDB Search -->
    <MoleculesPdbSearch
      :is-loading="isSearching"
      :error="searchError"
      @search="$emit('search-pdb', $event)"
      @clear-error="$emit('clear-search-error')"
    />

    <!-- Molecule Selector -->
    <UiControlCard title="Select Molecule" icon="mdi:flask" collapsible :default-open="true">
      <UiButtonGroup
        :options="moleculeOptions"
        :model-value="currentMolecule"
        @update:model-value="$emit('update:molecule', $event)"
      />
    </UiControlCard>

    <!-- Visualization Style -->
    <UiControlCard title="Visualization Style" icon="mdi:eye" collapsible :default-open="false">
      <UiButtonGroup
        :options="styleOptions"
        :model-value="currentStyle"
        @update:model-value="$emit('update:style', $event)"
      />
    </UiControlCard>

    <!-- Color Scheme -->
    <UiControlCard title="Color Scheme" icon="mdi:palette" collapsible :default-open="false">
      <UiButtonGroup
        :options="colorOptions"
        :model-value="currentColorScheme"
        @update:model-value="$emit('update:colorScheme', $event)"
      />
    </UiControlCard>

    <!-- Background -->
    <UiControlCard title="Background" icon="mdi:image" collapsible :default-open="false">
      <UiButtonGroup
        :options="backgroundOptions"
        :model-value="currentBackground"
        @update:model-value="$emit('update:background', $event)"
      />
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
  isSearching: boolean
  searchError: string | null
}

defineProps<Props>()

defineEmits<{
  'update:molecule': [value: string]
  'update:style': [value: string]
  'update:colorScheme': [value: string]
  'update:background': [value: string]
  'search-pdb': [pdbId: string]
  'clear-search-error': []
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
