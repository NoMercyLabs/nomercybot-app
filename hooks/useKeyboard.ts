import { useEffect } from 'react'
import { Platform } from 'react-native'

type KeyCombo = {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
}

export function useKeyboardShortcut(combo: KeyCombo, handler: () => void, enabled = true) {
  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrlMatch = combo.ctrl ? (e.ctrlKey || e.metaKey) : true
      const shiftMatch = combo.shift ? e.shiftKey : !e.shiftKey
      const altMatch = combo.alt ? e.altKey : !e.altKey

      if (e.key.toLowerCase() === combo.key.toLowerCase() && ctrlMatch && shiftMatch && altMatch) {
        e.preventDefault()
        handler()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [combo, handler, enabled])
}

type KeyboardShortcut = {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  handler: () => void
}

export function useKeyboard(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    if (Platform.OS !== 'web') return

    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : true
        const metaMatch = shortcut.meta ? e.metaKey : true
        const shiftMatch = shortcut.shift ? e.shiftKey : true
        if (e.key === shortcut.key && ctrlMatch && metaMatch && shiftMatch) {
          e.preventDefault()
          shortcut.handler()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}
