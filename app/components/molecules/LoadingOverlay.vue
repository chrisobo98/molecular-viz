<!--
  LoadingOverlay Component

  Displays loading spinner with molecule name during fetch.
-->

<template>
  <div v-if="loading" class="loading-overlay">
    <div class="loading-spinner" />
    <p>Loading {{ moleculeName }}...</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  loading: boolean
  moleculeName: string
}

defineProps<Props>()
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay p {
  margin-top: 1rem;
  color: #333;
  font-weight: 500;
}
</style>
