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
      <p><strong>Element:</strong> {{ elementFullName }} ({{ atom.elem }})</p>
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
import { computed } from 'vue'
import type { AtomInfo } from '~/types/molecule'

interface Props {
  atom: AtomInfo | null
}

const props = defineProps<Props>()

/**
 * Element symbol to full name mapping
 * Common elements found in organic molecules
 */
const elementNames: Record<string, string> = {
  H: 'Hydrogen',
  C: 'Carbon',
  N: 'Nitrogen',
  O: 'Oxygen',
  S: 'Sulfur',
  P: 'Phosphorus',
  F: 'Fluorine',
  Cl: 'Chlorine',
  Br: 'Bromine',
  I: 'Iodine',
  Fe: 'Iron',
  Zn: 'Zinc',
  Cu: 'Copper',
  Mg: 'Magnesium',
  Ca: 'Calcium',
  Na: 'Sodium',
  K: 'Potassium'
}

const elementFullName = computed(() => {
  if (!props.atom) return ''
  return elementNames[props.atom.elem] || props.atom.elem
})
</script>

<style scoped>
.atom-info-card {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background: rgba(30, 41, 59, 0.9);
  backdrop-filter: blur(12px);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(71, 85, 105, 0.5);
  min-width: 200px;
  z-index: 50;
}

.atom-info-card h4 {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  color: #3b82f6;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.atom-details p {
  margin: 0.3rem 0;
  font-size: 0.85rem;
  color: #e2e8f0;
}

.atom-details strong {
  color: #94a3b8;
}
</style>
