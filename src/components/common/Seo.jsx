import { useEffect } from 'react'

function Seo({ title, description }) {
  useEffect(() => {
    document.title = title
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    }
  }, [title, description])
  return null
}

export default Seo