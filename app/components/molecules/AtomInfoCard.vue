<!--
  AtomInfoCard Component

  Displays selected atom information: element, position, residue, chain.
  Only renders when an atom is selected.
-->

<template>
  <div v-if="atom" class="atom-info-card">
    <h4>
      <Icon name="mdi:atom" />
      Atom Information
    </h4>
    <div class="atom-details">
      <p><strong>Element:</strong> {{ atom.elem }}</p>
      <p>
        <strong>Position:</strong>
        ({{ atom.x.toFixed(2) }}, {{ atom.y.toFixed(2) }}, {{ atom.z.toFixed(2) }}) Å
      </p>
      <p v-if="atom.resn">
        <strong>Residue:</strong> {{ atom.resn }} {{ atom.resi }}
      </p>
      <p v-if="atom.chain">
        <strong>Chain:</strong> {{ atom.chain }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AtomInfo } from '~/types/molecule'

interface Props {
  atom: AtomInfo | null
}

defineProps<Props>()
</script>

<style scoped>
.atom-info-card {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 50;
}

.atom-info-card h4 {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.atom-details p {
  margin: 0.3rem 0;
  font-size: 0.85rem;
  color: #333;
}
</style>
