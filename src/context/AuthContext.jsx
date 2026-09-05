import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { DEMO_ADMIN } from '../config/site'

// Mock authentication for the Part 1 prototype.
//
// In Part 2 the internals of this provider get replaced with Supabase Auth
// (signInWithPassword / onAuthStateChange). The public shape of the context —
// { user, loading, login, logout } — is kept intentionally small so pages do
// not need to change.

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem('oddaka-admin-session')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  const login = useCallback(async ({ email, password }) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 550))
    setLoading(false)
    if (email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      const session = { email: DEMO_ADMIN.email, role: 'admin', name: 'Studio Admin' }
      try {
        sessionStorage.setItem('oddaka-admin-session', JSON.stringify(session))
      } catch {
        // browser blocking storage — session still works in memory
      }
      setUser(session)
      return { ok: true }
    }
    return { ok: false, error: 'Invalid credentials. Use the demo sign-in shown below.' }
  }, [])

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem('oddaka-admin-session')
    } catch {
      // ignore
    }
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}