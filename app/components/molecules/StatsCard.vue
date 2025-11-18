<!--
  StatsCard Component

  Displays molecular statistics: formula, atom count, weight.
  Uses gradient background for visual prominence.
-->

<template>
  <UiControlCard title="Molecule Stats" icon="mdi:chart-bar" gradient>
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">Formula</span>
        <span class="stat-value">{{ stats.formula }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Atoms</span>
        <span class="stat-value">{{ stats.atomCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Mol. Weight</span>
        <span class="stat-value">{{ stats.weight }} g/mol</span>
      </div>
    </div>
  </UiControlCard>
</template>

<script setup lang="ts">
import type { MoleculeStats } from '~/types/molecule'

interface Props {
  stats: MoleculeStats
}

defineProps<Props>()
</script>

<style scoped>
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
</style>
