// Data access layer for Oddaka Inksters.
//
// All functions are async and return plain data objects. The UI never imports
// the JSON files directly — it only goes through this module (or through the
// admin context for mutable data).
//
// In Part 2 this file is replaced with Supabase-backed implementations that
// keep the exact same signatures, so no UI component needs to change.

import tattoosData from './tattoos.json'
import artistsData from './artists.json'
import reviewsData from './reviews.json'
import enquiriesData from './enquiries.json'
import categoriesData from './categories.json'
import { appendLocalEnquiry } from './enquiryStore'

const delay = (ms = 160) => new Promise((resolve) => setTimeout(resolve, ms))

// --- Tattoos ---------------------------------------------------------------

export async function getTattoos({ onlyPublished = false } = {}) {
  await delay()
  let rows = tattoosData
  if (onlyPublished) rows = rows.filter((t) => t.published)
  return clone(rows)
}

export async function getTattooById(id) {
  await delay(60)
  const row = tattoosData.find((t) => t.id === id)
  return row ? clone(row) : null
}

export async function getFeaturedTattoos() {
  await delay()
  return clone(tattoosData.filter((t) => t.featured && t.published))
}

export async function getTattoosByArtist(artistId) {
  await delay(80)
  return clone(tattoosData.filter((t) => t.artistId === artistId))
}

export async function getTattoosByCategory(category, { onlyPublished = true } = {}) {
  await delay()
  let rows = tattoosData.filter((t) => t.category === category)
  if (onlyPublished) rows = rows.filter((t) => t.published)
  return clone(rows)
}

export async function getRelatedTattoos(id, limit = 3) {
  await delay(80)
  const current = tattoosData.find((t) => t.id === id)
  if (!current) return []
  const sameArtist = tattoosData.filter((t) => t.artistId === current.artistId && t.id !== id)
  const sameCategory = tattoosData.filter((t) => t.category === current.category && t.id !== id)
  const rest = tattoosData.filter(
    (t) => t.id !== id && t.artistId !== current.artistId && t.category !== current.category,
  )
  const pool = [...sameArtist, ...sameCategory, ...rest]
  return clone(pool.slice(0, limit))
}

// --- Artists ---------------------------------------------------------------

export async function getArtists() {
  await delay()
  return clone([...artistsData].sort((a, b) => a.order - b.order))
}

export async function getArtistById(id) {
  await delay(60)
  const row = artistsData.find((a) => a.id === id)
  return row ? clone(row) : null
}

// --- Reviews ---------------------------------------------------------------

export async function getReviews() {
  await delay(80)
  return clone(reviewsData)
}

// --- Categories ------------------------------------------------------------

export async function getCategories() {
  await delay(40)
  return clone(categoriesData)
}

// --- Enquiries -------------------------------------------------------------

export async function getEnquiries() {
  await delay()
  return clone([...enquiriesData].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)))
}

// --- Mutations (local mock only) -------------------------------------------
// These mirror the future Supabase inserts/updates. In Part 1 they only
// simulate persistence so the UI flow can be demonstrated.

export async function createEnquiry(payload) {
  await delay(600)
  const created = {
    id: `enq-${Date.now()}`,
    ...payload,
    status: 'NEW',
    createdAt: new Date().toISOString().slice(0, 10),
  }
  // Persist locally so it appears in the admin prototype immediately.
  appendLocalEnquiry(created)
  return clone(created)
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}