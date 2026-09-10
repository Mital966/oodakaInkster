import { useEffect } from 'react'
import { SITE } from '../../config/site'

const ORIGIN = 'https://oddakainksters.in'

function setMeta(attr, key, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

// Keeps the document title, meta description, Open Graph and canonical tags in
// sync on every public page. Defaults come from the site config so every route
// at least exposes an accurate name and description.
function Seo({ title, description, image, type = 'website', path = '' }) {
  useEffect(() => {
    const fullTitle = title || SITE.name
    document.title = fullTitle

    const desc = description || SITE.description
    const url = `${ORIGIN}${path || (typeof window !== 'undefined' ? window.location.pathname : '/')}`

    setMeta('name', 'description', desc)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', image || `${ORIGIN}/hero.svg`)
    setMeta('property', 'og:site_name', SITE.name)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', desc)

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url

    let robots = document.head.querySelector('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement('meta')
      robots.name = 'robots'
      document.head.appendChild(robots)
    }
    robots.content = 'index, follow'
  }, [title, description, image, type, path])

  return null
}

export default Seo