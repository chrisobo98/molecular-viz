/**
 * Keyboard Shortcuts Composable
 *
 * Manages keyboard event handling in a reusable, testable way.
 * Separates input handling from business logic.
 */

import { onMounted, onUnmounted } from 'vue'

interface ShortcutHandlers {
  onReset: () => void
  onToggleSpin: () => void
  onLoadMolecule: (index: number) => void
  onScreenshot: () => void
  onToggleMeasure: () => void
  onToggleLabels: () => void
  onToggleHelp: () => void
}

/**
 * Molecule IDs mapped to number keys
 */
const MOLECULE_KEYS = ['caffeine', 'aspirin', 'glucose', 'ethanol']

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  /**
   * Handle keydown events
   */
  const handleKeydown = (event: KeyboardEvent) => {
    // Ignore if typing in an input field
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return
    }

    const key = event.key.toLowerCase()

    switch (key) {
      case 'r':
        handlers.onReset()
        break

      case 's':
        handlers.onToggleSpin()
        break

      case '1':
      case '2':
      case '3':
      case '4': {
        const index = parseInt(key) - 1
        handlers.onLoadMolecule(index)
        break
      }

      case ' ':
        event.preventDefault()
        handlers.onScreenshot()
        break

      case 'm':
        handlers.onToggleMeasure()
        break

      case 'l':
        handlers.onToggleLabels()
        break

      case '?':
        handlers.onToggleHelp()
        break
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    MOLECULE_KEYS
  }
}
