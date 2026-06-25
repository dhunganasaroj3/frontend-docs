import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scrolls the main content region to top whenever the route changes. */
export function ScrollToTop({ target }: { target?: string }) {
  const { pathname } = useLocation()
  useEffect(() => {
    const el = target ? document.querySelector(target) : null
    if (el) el.scrollTo({ top: 0 })
    else window.scrollTo({ top: 0 })
  }, [pathname, target])
  return null
}
