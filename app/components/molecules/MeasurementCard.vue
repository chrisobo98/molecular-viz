<!--
  MeasurementCard Component

  Displays distance measurement between two atoms.
  Shows distance in Angstroms with clear button.
-->

<template>
  <!-- Instruction card when measure mode is active but no atoms selected yet -->
  <div v-if="measureMode && !hasFirstAtom && distance === null" class="measurement-card measurement-card--instruction">
    <h4>
      <Icon name="mdi:ruler" />
      Measure Mode
    </h4>
    <p class="instruction-text">Click on first atom</p>
  </div>

  <!-- Instruction card when first atom is selected -->
  <div v-else-if="measureMode && hasFirstAtom && distance === null" class="measurement-card measurement-card--instruction">
    <h4>
      <Icon name="mdi:ruler" />
      Measure Mode
    </h4>
    <p class="instruction-text">Click on second atom</p>
  </div>

  <!-- Result card when measurement is complete -->
  <div v-else-if="distance !== null" class="measurement-card">
    <h4>
      <Icon name="mdi:ruler" />
      Distance Measurement
    </h4>
    <p class="distance-value">{{ distance.toFixed(3) }} Å</p>
    <button class="clear-button" @click="$emit('clear')">Clear</button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  distance: number | null
  measureMode: boolean
  hasFirstAtom: boolean
}

defineProps<Props>()
defineEmits<{
  clear: []
}>()
</script>

<style scoped>
.measurement-card {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: rgba(30, 41, 59, 0.9);
  backdrop-filter: blur(12px);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(71, 85, 105, 0.5);
  text-align: center;
  z-index: 50;
}

.measurement-card h4 {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.distance-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0.5rem 0;
}

.clear-button {
  padding: 0.3rem 0.75rem;
  background: rgba(51, 65, 85, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  color: #e2e8f0;
  transition: all 0.2s ease;
}

.clear-button:hover {
  background: rgba(59, 130, 246, 0.8);
  border-color: #3b82f6;
}

.measurement-card--instruction {
  border: 2px solid #3b82f6;
}

.instruction-text {
  font-size: 0.9rem;
  color: #3b82f6;
  margin: 0;
  font-weight: 500;
}
</style>
