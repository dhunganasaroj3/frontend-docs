import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { scrollPageToTop } from '../lib/scroll'

/** Scrolls to top whenever the route changes (covers Prev/Next + cross-topic nav). */
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    scrollPageToTop()
  }, [pathname])
  return null
}
