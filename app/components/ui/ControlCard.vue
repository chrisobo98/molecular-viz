<!--
  ControlCard Component

  Reusable card container for control sections.
  Supports collapsible mode for better UX on smaller screens.
-->

<template>
  <div :class="['control-card', { 'control-card--gradient': gradient }]">
    <h3
      v-if="title"
      :class="['control-card__title', { 'control-card__title--clickable': collapsible }]"
      @click="collapsible && toggle()"
    >
      <Icon v-if="icon" :name="icon" />
      {{ title }}
      <Icon
        v-if="collapsible"
        :name="isOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'"
        class="control-card__chevron"
      />
    </h3>
    <div v-show="!collapsible || isOpen" class="control-card__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title?: string
  icon?: string
  gradient?: boolean
  collapsible?: boolean
  defaultOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  icon: '',
  gradient: false,
  collapsible: false,
  defaultOpen: true
})

const isOpen = ref(props.defaultOpen)

const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>

<style scoped>
.control-card {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid rgba(71, 85, 105, 0.5);
}

.control-card--gradient {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.8) 100%);
  border-color: rgba(59, 130, 246, 0.5);
}

.control-card__title {
  margin: 0 0 1rem;
  font-size: 1rem;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-card__title--clickable {
  cursor: pointer;
  user-select: none;
  margin-bottom: 0;
  transition: color 0.2s ease;
}

.control-card__title--clickable:hover {
  color: #3b82f6;
}

.control-card__chevron {
  margin-left: auto;
  font-size: 1.2rem;
  transition: transform 0.2s ease;
}

.control-card__content {
  margin-top: 1rem;
}

.control-card--gradient .control-card__title {
  color: white;
}

.control-card--gradient .control-card__title--clickable:hover {
  color: rgba(255, 255, 255, 0.8);
}

.control-card__title :deep(svg) {
  color: #3b82f6;
}

.control-card--gradient .control-card__title :deep(svg) {
  color: white;
}
</style>
