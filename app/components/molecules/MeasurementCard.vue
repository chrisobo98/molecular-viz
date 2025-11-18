<!--
  MeasurementCard Component

  Displays distance measurement between two atoms.
  Shows distance in Angstroms with clear button.
-->

<template>
  <div v-if="distance !== null" class="measurement-card">
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
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-align: center;
  z-index: 50;
}

.measurement-card h4 {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.distance-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0.5rem 0;
}

.clear-button {
  padding: 0.3rem 0.75rem;
  background: #e0e0e0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.2s ease;
}

.clear-button:hover {
  background: #d0d0d0;
}
</style>
