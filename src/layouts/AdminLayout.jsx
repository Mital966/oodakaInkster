import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Loader2, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/admin/AdminSidebar'
import { ToastProvider, useToast } from '../components/admin/Toast'
import { useAdminData } from '../context/AdminDataContext'

// Small banner shown when a data load from the backend fails.
function DataErrorBanner() {
  const { error, refresh } = useAdminData()
  const { toast } = useToast()
  if (!error) return null
  return (
    <div className="mb-6 flex items-start justify-between gap-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
      <div className="flex items-start gap-2.5">
        <AlertTriangle size={15} className="mt-0.5 shrink-0 text-red-600" />
        <div>
          <p className="text-sm font-semibold text-red-800">We ran into a problem loading your data.</p>
          <p className="mt-0.5 text-xs leading-relaxed text-red-600">{error?.message || 'Please try again.'}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          refresh().catch((err) => toast('error', err.message || 'Still can’t reach the database.'))
        }}
        className="shrink-0 rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
      >
        Retry
      </button>
    </div>
  )
}

function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { loading } = useAdminData()

  return (
    <ToastProvider>
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
            <DataErrorBanner />
            {loading ? (
              <div className="flex min-h-[50vh] items-center justify-center">
                <span className="inline-flex items-center gap-2.5 rounded-md border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500 shadow-sm">
                  <Loader2 size={15} className="animate-spin" /> Loading your studio…
                </span>
              </div>
            ) : (
              <Outlet />
            )}
          </div>
        </main>
      </div>
    </ToastProvider>
  )
}

export default AdminLayout