<!--
  ControlCard Component

  Reusable card container for control sections.
  Follows single responsibility principle - only handles card styling.
-->

<template>
  <div :class="['control-card', { 'control-card--gradient': gradient }]">
    <h3 v-if="title" class="control-card__title">
      <Icon v-if="icon" :name="icon" />
      {{ title }}
    </h3>
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  icon?: string
  gradient?: boolean
}

defineProps<Props>()
</script>

<style scoped>
.control-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.control-card--gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.control-card__title {
  margin: 0 0 1rem;
  font-size: 1rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-card--gradient .control-card__title {
  color: white;
}

.control-card__title :deep(svg) {
  color: #667eea;
}

.control-card--gradient .control-card__title :deep(svg) {
  color: white;
}
</style>
