import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/admin/AdminSidebar'

function AdminLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 lg:block">
        <AdminSidebar />
      </aside>

      {/* mobile topbar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 lg:hidden">
        <span className="font-display text-sm font-extrabold tracking-tight text-neutral-900">
          ODDAKA <span className="font-mono text-[9px] font-normal uppercase tracking-[0.2em] text-neutral-400">Admin</span>
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open admin navigation"
          className="rounded-md border border-neutral-200 p-2 text-neutral-700"
        >
          <Menu size={18} />
        </button>
      </header>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-neutral-900/40" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative h-full">
                <AdminSidebar onNavigate={() => setOpen(false)} />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close admin navigation"
                  className="absolute right-3 top-4 rounded-md p-1.5 text-neutral-400 hover:text-neutral-100"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="lg:pl-60">
        <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout