import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEMO_ADMIN } from '../config/site'
import { isSupabaseConfigured, supabase } from '../services/client'

const AuthContext = createContext(null)

function mapUser(profile, session) {
  return {
    id: session?.user?.id || profile?.id || 'demo',
    email: profile?.email || session?.user?.email || '',
    name: profile?.full_name || 'Studio Admin',
    role: profile?.role || 'admin',
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(isSupabaseConfigured))

  // Seed from a previous demo session before supabase decides.
  useEffect(() => {
    if (isSupabaseConfigured) return
    try {
      const raw = sessionStorage.getItem('oddaka-admin-session')
      if (raw) setUser(JSON.parse(raw))
    } catch {
      // ignore
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined

    let mounted = true

    async function refresh() {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      const session = data.session
      if (!session) {
        setUser(null)
        setLoading(false)
        return
      }
      let profile = { email: session.user.email }
      const { data: row } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
      if (row) profile = row
      setUser(mapUser(profile, session))
      setLoading(false)
    }

    refresh()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null)
        setLoading(false)
      } else {
        refresh()
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(async ({ email, password }) => {
    if (isSupabaseConfigured) {
      if (!email || !password) return { ok: false, error: 'Enter your email and password.' }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (error.message?.toLowerCase().includes('invalid login')) {
          return { ok: false, error: 'That email or password doesn’t match. Please try again.' }
        }
        return { ok: false, error: 'We couldn’t sign you in. Please try again.' }
      }
      let profile = { email: data.user.email }
      const { data: row } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle()
      if (row) profile = row
      setUser(mapUser(profile, data.session))
      return { ok: true }
    }

    await new Promise((resolve) => setTimeout(resolve, 450))
    if (email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      const session = { id: 'demo', email: DEMO_ADMIN.email, name: 'Studio Admin', role: 'admin' }
      try {
        sessionStorage.setItem('oddaka-admin-session', JSON.stringify(session))
      } catch {
        // storage unavailable — session still works in memory
      }
      setUser(session)
      return { ok: true }
    }
    return { ok: false, error: 'Invalid credentials. Use the demo sign-in shown below.' }
  }, [])

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    try {
      sessionStorage.removeItem('oddaka-admin-session')
    } catch {
      // ignore
    }
    setUser(null)
  }, [])

  const resetPassword = useCallback(async (email) => {
    if (!isSupabaseConfigured) {
      return { ok: false, error: 'Password reset needs Supabase to be configured for production.' }
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/login`,
    })
    if (error) return { ok: false, error: 'We couldn’t send a reset link. Please try again.' }
    return { ok: true }
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, logout, resetPassword, remoteConfigured: isSupabaseConfigured }),
    [user, loading, login, logout, resetPassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}