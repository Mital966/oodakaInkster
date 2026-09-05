import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import InstagramIcon from '../../components/common/InstagramIcon'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { SITE } from '../../config/site'
import { useScrollPosition } from '../../hooks/useScrollPosition'
import { cn } from '../../utils/cn'
import { buildWhatsAppLink } from '../../utils/wa'
import Button from '../common/Button'

const LINKS = [
  { label: 'WORK', to: '/gallery' },
  { label: 'ARTISTS', to: '/artists' },
  { label: 'ABOUT', to: '/about' },
  { label: 'AFTERCARE', to: '/aftercare' },
  { label: 'CONTACT', to: '/contact' },
]

function Wordmark({ onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="group flex flex-col leading-none focus-visible:outline-offset-4"
      aria-label="Oddaka Inksters — home"
    >
      <span className="font-display text-lg font-extrabold tracking-tight text-bone">
        ODDAKA
      </span>
      <span className="font-mono text-[9px] uppercase tracking-wide3 text-ink-400">
        Inksters<span className="text-[#b3541e]">.</span>
      </span>
    </Link>
  )
}

function Navbar() {
  const scrollY = useScrollPosition()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const scrolled = scrollY > 16

  useEffect(() => setOpen(false), [location.pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[70] transition-all duration-500',
          scrolled
            ? 'border-b border-ink-700/60 bg-ink-950/85 backdrop-blur-md'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="mx-auto flex h-20 max-w-8xl items-center justify-between px-6 lg:px-10">
          <Wordmark />
          <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    'group relative font-mono text-[11px] uppercase tracking-wide2 transition-colors',
                    isActive ? 'text-bone' : 'text-ink-300 hover:text-bone',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    <span
                      className={cn(
                        'absolute -bottom-1.5 left-0 h-px origin-left bg-bone transition-transform duration-300',
                        isActive ? 'w-full scale-x-100' : 'w-full scale-x-0 group-hover:scale-x-100',
                      )}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button to="/contact" variant="outline" size="sm" className="hidden md:inline-flex">
              Book Now
            </Button>
            <button
              type="button"
              className="inline-flex items-center gap-2 p-2 text-bone lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex flex-col bg-ink-950 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex h-20 items-center justify-between px-6">
              <Wordmark onClick={() => setOpen(false)} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="p-2 text-bone"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col justify-center gap-1 px-8" aria-label="Mobile">
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={l.to}
                    className="group flex items-baseline gap-4 py-3"
                    onClick={() => setOpen(false)}
                  >
                    <span className="font-mono text-[11px] text-ink-500">0{i + 1}</span>
                    <span className="font-display text-4xl font-extrabold uppercase tracking-tight text-bone transition-colors group-hover:text-ink-200">
                      {l.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="border-t border-ink-700/60 px-8 py-7"
            >
              <Button to="/contact" variant="primary" size="lg" className="w-full" onClick={() => setOpen(false)}>
                Book a Consultation
              </Button>
              <div className="mt-6 flex items-center gap-6">
                <a href={buildWhatsAppLink()} className="font-mono text-[11px] uppercase tracking-wide2 text-ink-300 underline-offset-4 hover:underline">
                  WhatsApp
                </a>
                <a href={SITE.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide2 text-ink-300 underline-offset-4 hover:underline">
                  <InstagramIcon size={13} /> Instagram
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar