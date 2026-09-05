import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Restores scroll to top on every route change.
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname])
  return null
}

export default ScrollToTop