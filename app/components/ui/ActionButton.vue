<!--
  ActionButton Component

  Reusable action button with icon support and active state.
  Used for tools like spin, measure, labels, reset, screenshot.
-->

<template>
  <button
    :class="['action-button', { 'action-button--active': active }]"
    @click="$emit('click')"
  >
    <Icon v-if="icon" :name="icon" />
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  icon?: string
  active?: boolean
}

defineProps<Props>()
defineEmits<{
  click: []
}>()
</script>

<style scoped>
.action-button {
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

.action-button:hover {
  border-color: #667eea;
  color: #667eea;
}

.action-button--active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.action-button :deep(svg) {
  font-size: 1rem;
}
</style>
