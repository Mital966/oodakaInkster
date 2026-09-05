import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import tattoosData from '../data/tattoos.json'
import artistsData from '../data/artists.json'
import enquiriesData from '../data/enquiries.json'
import {
  loadLocalEnquiries,
  saveLocalEnquiries,
  updateLocalEnquiry,
} from '../data/enquiryStore'

// Mutable data context for the admin prototype.
//
// Initialised from the local JSON datasets, then kept in React state and
// mirrored to localStorage (key namespaced so public reads and admin edits
// never collide). In Part 2 this provider is replaced by a Supabase client;
// the exposed actions — add/update/delete/toggle + updateEnquiryStatus — are
// the same surface the admin UI depends on.

const LS_TATTOOS = 'oddaka-admin-tattoos-v1'
const LS_ARTISTS = 'oddaka-admin-artists-v1'

function readLocal(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage unavailable — state still works for the session
  }
}

function mergeEnquiries() {
  const local = loadLocalEnquiries()
  if (!local || local.length === 0) return enquiriesData
  const ids = new Set(local.map((e) => e.id))
  const seed = enquiriesData.filter((e) => !ids.has(e.id))
  return [...local, ...seed]
}

const AdminDataContext = createContext(null)

export function AdminDataProvider({ children }) {
  const [tattoos, setTattoos] = useState(() => readLocal(LS_TATTOOS) || tattoosData)
  const [artists, setArtists] = useState(() => readLocal(LS_ARTISTS) || artistsData)
  const [enquiries, setEnquiries] = useState(() => mergeEnquiries())

  // mirror to storage whenever state changes
  useEffect(() => writeLocal(LS_TATTOOS, tattoos), [tattoos])
  useEffect(() => writeLocal(LS_ARTISTS, artists), [artists])

  // --- tattoos -----------------------------------------------------------
  const addTattoo = (payload) => {
    const id = payload.id || `tattoo-${Date.now()}`
    setTattoos((prev) => [{ ...payload, id }, ...prev])
    return id
  }
  const updateTattoo = (id, patch) =>
    setTattoos((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  const deleteTattoo = (id) => setTattoos((prev) => prev.filter((t) => t.id !== id))
  const togglePublish = (id) =>
    setTattoos((prev) => prev.map((t) => (t.id === id ? { ...t, published: !t.published } : t)))
  const toggleFeatured = (id) =>
    setTattoos((prev) => prev.map((t) => (t.id === id ? { ...t, featured: !t.featured } : t)))

  // --- artists -----------------------------------------------------------
  const addArtist = (payload) => {
    const id = payload.id || `artist-${Date.now()}`
    setArtists((prev) => [...prev, { ...payload, id }])
    return id
  }
  const updateArtist = (id, patch) =>
    setArtists((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  const deleteArtist = (id) => setArtists((prev) => prev.filter((a) => a.id !== id))

  // --- enquiries ---------------------------------------------------------
  const updateEnquiryStatus = (id, status) => {
    updateLocalEnquiry(id, { status })
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)))
  }
  const deleteEnquiry = (id) =>
    setEnquiries((prev) => prev.filter((e) => e.id !== id))

  const artistName = (id) => artists.find((a) => a.id === id)?.name || '—'

  const value = useMemo(
    () => ({
      tattoos,
      artists,
      enquiries,
      artistName,
      addTattoo,
      updateTattoo,
      deleteTattoo,
      togglePublish,
      toggleFeatured,
      addArtist,
      updateArtist,
      deleteArtist,
      updateEnquiryStatus,
      deleteEnquiry,
    }),
    [tattoos, artists, enquiries],
  )

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>
}

export function useAdminData() {
  return useContext(AdminDataContext)
}