import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff, Fingerprint, Info, LogIn } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { DEMO_ADMIN } from '../../config/site'
import { useAuth } from '../../context/AuthContext'

function AdminLogin() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(DEMO_ADMIN.email)
  const [password, setPassword] = useState(DEMO_ADMIN.password)
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const from = location.state?.from?.pathname || '/admin/dashboard'

  if (user) return <Navigate to={from} replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const res = await login({ email, password })
    setBusy(false)
    if (res.ok) navigate(from, { replace: true })
    else setError(res.error)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-neutral-100">
              <Fingerprint size={20} />
            </span>
            <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-neutral-900">
              Studio Admin
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Sign in to manage the Oddaka Inksters studio.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-neutral-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 text-sm shadow-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-neutral-700">Password</span>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 pr-11 text-sm shadow-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-neutral-400 hover:text-neutral-700"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-red-600"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-neutral-100 transition-colors hover:bg-neutral-800 disabled:opacity-60"
            >
              <LogIn size={15} /> {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 flex items-start gap-2.5 rounded-md bg-neutral-50 p-3.5 ring-1 ring-inset ring-neutral-200">
            <Info size={14} className="mt-0.5 shrink-0 text-neutral-400" />
            <p className="text-xs leading-relaxed text-neutral-500">
              Prototype sign-in. Demo credentials are pre-filled — just press sign in. This will be
              replaced with real authentication in Part 2.
            </p>
          </div>
        </div>
        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
          Oddaka Inksters · Prototype build
        </p>
      </motion.div>
    </div>
  )
}

export default AdminLogin