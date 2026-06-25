import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export type Theme = 'light' | 'dark'

/** Reads/writes the persisted theme and reflects it on <html data-theme>. */
export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>('fd.theme', 'dark')
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  return { theme, setTheme }
}
