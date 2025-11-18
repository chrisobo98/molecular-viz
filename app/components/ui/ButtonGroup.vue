<!--
  ButtonGroup Component

  Reusable button group for selection controls.
  Handles active state styling and click events.
  DRY: Used 5+ times in the app for different selectors.
-->

<template>
  <div class="button-group">
    <button
      v-for="option in options"
      :key="option.id"
      :class="['button-group__button', { 'button-group__button--active': modelValue === option.id }]"
      @click="$emit('update:modelValue', option.id)"
    >
      <Icon v-if="option.icon" :name="option.icon" />
      {{ option.label || option.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface Option {
  id: string
  name?: string
  label?: string
  icon?: string
}

interface Props {
  options: Option[]
  modelValue: string
}

defineProps<Props>()
defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.button-group__button {
  flex: 1;
  min-width: calc(50% - 0.25rem);
  padding: 0.6rem 0.75rem;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.button-group__button:hover {
  border-color: #667eea;
  color: #667eea;
}

.button-group__button--active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.button-group__button :deep(svg) {
  font-size: 1rem;
}
</style>
