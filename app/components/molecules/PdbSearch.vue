<!--
  PdbSearch Component

  Search input for loading any molecule from the PDB database.
  Validates PDB ID format and displays errors.
-->

<template>
  <UiControlCard title="Search PDB Database" icon="mdi:database-search" collapsible :default-open="false">
    <div class="pdb-search">
      <div class="search-input-wrapper">
        <input
          v-model="pdbInput"
          type="text"
          placeholder="Enter PDB ID (e.g., 1CRN)"
          maxlength="4"
          class="search-input"
          @keyup.enter="handleSearch"
          @input="clearError"
        >
        <button
          class="search-button"
          :disabled="isLoading"
          @click="handleSearch"
        >
          <Icon v-if="isLoading" name="mdi:loading" class="spinning" />
          <Icon v-else name="mdi:magnify" />
        </button>
      </div>

      <!-- Error message -->
      <p v-if="error" class="error-message">
        <Icon name="mdi:alert-circle" />
        {{ error }}
      </p>

      <!-- Help text -->
      <p class="help-text">
        Load any molecule from the
        <a href="https://www.rcsb.org/" target="_blank">RCSB PDB</a>
      </p>

      <!-- Example IDs -->
      <div class="example-ids">
        <span class="example-label">Try:</span>
        <button
          v-for="id in exampleIds"
          :key="id"
          class="example-button"
          @click="loadExample(id)"
        >
          {{ id }}
        </button>
      </div>
    </div>
  </UiControlCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  isLoading: boolean
  error: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  search: [pdbId: string]
  'clear-error': []
}>()

const pdbInput = ref('')

const exampleIds = ['1CRN', '4HHB', '1BNA', '2POR']

const handleSearch = () => {
  if (pdbInput.value.trim()) {
    emit('search', pdbInput.value.trim())
  }
}

const clearError = () => {
  if (props.error) {
    emit('clear-error')
  }
}

const loadExample = (id: string) => {
  pdbInput.value = id
  emit('search', id)
}
</script>

<style scoped>
.pdb-search {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.search-input-wrapper {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
  padding: 0.6rem 0.75rem;
  border: 1px solid rgba(71, 85, 105, 0.5);
  background: rgba(51, 65, 85, 0.5);
  color: #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.search-input::placeholder {
  color: #64748b;
  text-transform: none;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.search-button {
  padding: 0.6rem 0.75rem;
  border: 1px solid #3b82f6;
  background: #3b82f6;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.search-button:hover:not(:disabled) {
  background: #2563eb;
}

.search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
  padding: 0.5rem 0.75rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 6px;
  color: #fca5a5;
  font-size: 0.8rem;
}

.help-text {
  margin: 0;
  font-size: 0.75rem;
  color: #64748b;
}

.help-text a {
  color: #3b82f6;
  text-decoration: none;
}

.help-text a:hover {
  text-decoration: underline;
}

.example-ids {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.example-label {
  font-size: 0.75rem;
  color: #64748b;
}

.example-button {
  padding: 0.25rem 0.5rem;
  border: 1px solid rgba(71, 85, 105, 0.5);
  background: rgba(51, 65, 85, 0.3);
  color: #94a3b8;
  border-radius: 4px;
  font-size: 0.7rem;
  font-family: monospace;
  cursor: pointer;
  transition: all 0.2s ease;
}

.example-button:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}
</style>
