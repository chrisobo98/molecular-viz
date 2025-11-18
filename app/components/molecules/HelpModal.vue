<!--
  HelpModal Component

  Displays keyboard shortcuts and usage instructions.
  Closes on overlay click or close button.
-->

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click="close">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Keyboard Shortcuts & Help</h2>
          <button class="close-button" @click="close">
            <Icon name="mdi:close" />
          </button>
        </div>

        <div class="modal-body">
          <section class="shortcuts-section">
            <h3>Keyboard Shortcuts</h3>
            <div class="shortcut-grid">
              <div
                v-for="shortcut in shortcuts"
                :key="shortcut.key"
                class="shortcut-item"
              >
                <kbd>{{ shortcut.key }}</kbd>
                <span>{{ shortcut.label }}</span>
              </div>
            </div>
          </section>

          <section class="usage-section">
            <h3>Mouse Controls</h3>
            <ul>
              <li><strong>Left Click + Drag:</strong> Rotate molecule</li>
              <li><strong>Right Click + Drag:</strong> Pan view</li>
              <li><strong>Scroll:</strong> Zoom in/out</li>
              <li><strong>Click Atom:</strong> Select atom (shows info)</li>
              <li><strong>Measure Mode:</strong> Click two atoms to measure distance</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { KEYBOARD_SHORTCUTS } from '~/constants/molecules'

interface Props {
  modelValue: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const shortcuts = KEYBOARD_SHORTCUTS

const close = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.shortcuts-section,
.usage-section {
  margin-bottom: 1.5rem;
}

.shortcuts-section:last-child,
.usage-section:last-child {
  margin-bottom: 0;
}

.shortcuts-section h3,
.usage-section h3 {
  margin: 0 0 1rem;
  font-size: 1rem;
  color: #667eea;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.shortcut-item kbd {
  background: #f0f0f0;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.85rem;
  min-width: 2rem;
  text-align: center;
  border: 1px solid #ddd;
}

.shortcut-item span {
  font-size: 0.85rem;
  color: #555;
}

.usage-section ul {
  margin: 0;
  padding-left: 1.25rem;
}

.usage-section li {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #555;
}

@media (max-width: 600px) {
  .shortcut-grid {
    grid-template-columns: 1fr;
  }
}
</style>
