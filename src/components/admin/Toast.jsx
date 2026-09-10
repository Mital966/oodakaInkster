import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { cn } from '../../utils/cn'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

// Tiny toast system for the admin area. Pages call `toast('success', 'Saved!')`
// with a friendly, human message and it fades in/out top-right.
export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const seq = useRef(0)

  const dismiss = useCallback((id) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (kind = 'info', message) => {
      if (!message) return
      const id = ++seq.current
      setItems((prev) => [...prev.slice(-3), { id, kind, message }])
      window.setTimeout(() => dismiss(id), 4200)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        <AnimatePresence>
          {items.map((t) => {
            const Icon = ICONS[t.kind] || Info
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 24, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto flex items-start gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-lg"
                role="status"
              >
                <Icon
                  size={16}
                  className={cn(
                    'mt-0.5 shrink-0',
                    t.kind === 'success' && 'text-emerald-600',
                    t.kind === 'error' && 'text-red-600',
                    t.kind === 'info' && 'text-neutral-500',
                  )}
                />
                <p className="text-sm leading-relaxed text-neutral-700">{t.message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  className="ml-auto rounded p-0.5 text-neutral-300 transition-colors hover:text-neutral-600"
                >
                  <XCircle size={13} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}