import { useCallback, useEffect, useState } from 'react'

/**
 * Persisted state. SSR-safe-ish (guards window), survives reloads, and syncs
 * across tabs via the `storage` event. Stores JSON.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const read = useCallback((): T => {
    if (typeof window === 'undefined') return initial
    try {
      const raw = window.localStorage.getItem(key)
      return raw === null ? initial : (JSON.parse(raw) as T)
    } catch {
      return initial
    }
  }, [key, initial])

  const [value, setValue] = useState<T>(read)

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          /* quota or disabled storage — keep in-memory value */
        }
        return resolved
      })
    },
    [key],
  )

  // keep multiple tabs in sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue) as T)
        } catch {
          /* ignore malformed */
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  return [value, set] as const
}
