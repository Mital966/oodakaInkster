import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

// Fullscreen lightbox for the tattoo detail page with keyboard navigation.
function Lightbox({ images, index, onClose, onNavigate }) {
  const [ready, setReady] = useState(index)

  const prev = useCallback(
    () => onNavigate((index - 1 + images.length) % images.length),
    [index, images.length, onNavigate],
  )
  const next = useCallback(
    () => onNavigate((index + 1) % images.length),
    [index, images.length, onNavigate],
  )

  useEffect(() => {
    setReady(index)
  }, [index])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, prev, next])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col bg-ink-950/97"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        role="dialog"
        aria-modal="true"
        aria-label="Image viewer"
      >
        <div className="flex items-center justify-between px-5 py-4">
          <span className="font-mono text-[11px] uppercase tracking-wide3 text-ink-300">
            {index + 1} / {images.length}
          </span>
          <button
            onClick={onClose}
            aria-label="Close viewer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-600 text-bone transition-colors hover:border-bone"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="relative flex flex-1 items-center justify-center px-4">
          <button
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-ink-600 bg-ink-950/60 p-2.5 text-bone transition-colors hover:border-bone sm:left-6"
          >
            <ChevronLeft size={20} />
          </button>

          <motion.img
            key={ready}
            src={images[ready]}
            alt="Tattoo {index+1} large view"
            className="max-h-[78vh] max-w-full object-contain"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />

          <button
            onClick={next}
            aria-label="Next image"
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-ink-600 bg-ink-950/60 p-2.5 text-bone transition-colors hover:border-bone sm:right-6"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex justify-center gap-2.5 px-5 py-5">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => onNavigate(i)}
              aria-label={`View image ${i + 1}`}
              className={`h-14 w-11 overflow-hidden rounded-sm border transition-all ${
                i === index ? 'border-bone' : 'border-ink-600 opacity-50 hover:opacity-90'
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default Lightbox