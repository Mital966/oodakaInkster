// Local persistence for enquiries.
// In a real system this would be a Supabase table; for the prototype it is a
// localStorage queue so enquiries submitted on the public site show up in the
// admin prototype without a server.

const KEY = 'oddaka-enquiries-v1'

export function loadLocalEnquiries() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveLocalEnquiries(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    // storage unavailable — prototype continues in memory only
  }
}

export function appendLocalEnquiry(entry) {
  const current = loadLocalEnquiries() || []
  saveLocalEnquiries([entry, ...current])
}

export function updateLocalEnquiry(id, patch) {
  const current = loadLocalEnquiries()
  if (!current) return
  const next = current.map((e) => (e.id === id ? { ...e, ...patch } : e))
  saveLocalEnquiries(next)
}