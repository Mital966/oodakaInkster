import tattoosSeed from '../data/tattoos.json'
import artistsSeed from '../data/artists.json'
import reviewsSeed from '../data/reviews.json'
import enquiriesSeed from '../data/enquiries.json'
import categoriesSeed from '../data/categories.json'
import { DEFAULT_SETTINGS, deepMerge } from './defaults'

const PREFIX = 'oddaka-v2-'
const LS = (k) => PREFIX + k

// Demo data is stored in the browser so admin edits survive reloads. To guard
// against stale/partial values left over from older app versions (which can
// blank sections on the public site), we embed a storage version and reset the
// demo state once when the app is upgraded.
const DEMO_VERSION = 'v3'
const COLLECTIONS = ['tattoos', 'artists', 'reviews', 'enquiries', 'categories', 'offers', 'settings']

const delay = (ms = 90) => new Promise((resolve) => setTimeout(resolve, ms))

const clone = (v) => JSON.parse(JSON.stringify(v))

function readLS(key, seed, isValid) {
  try {
    const raw = localStorage.getItem(LS(key))
    if (raw == null) return seed
    const val = JSON.parse(raw)
    return isValid && !isValid(val) ? seed : val
  } catch {
    return seed
  }
}

function writeLS(key, value) {
  try {
    localStorage.setItem(LS(key), JSON.stringify(value))
  } catch {
    throw new Error('We couldn’t save that on this device (storage is full or unavailable). Please try again.')
  }
}

function hex(length = 8) {
  let s = ''
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i += 1) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('We couldn’t read that file. Please try another one.'))
    reader.readAsDataURL(file)
  })
}

function ensureDemoVersion() {
  try {
    const k = LS('_version')
    if (localStorage.getItem(k) !== DEMO_VERSION) {
      for (const name of COLLECTIONS) localStorage.removeItem(LS(name))
      localStorage.setItem(k, DEMO_VERSION)
    }
  } catch {
    // storage unavailable — everything falls back to in-memory seeds
  }
}
ensureDemoVersion()

const db = {
  tattoos: readLS('tattoos', tattoosSeed, Array.isArray),
  artists: readLS('artists', artistsSeed, (v) => Array.isArray(v) && v.every((a) => a && typeof a === 'object' && a.id && a.name)),
  reviews: readLS('reviews', reviewsSeed, Array.isArray),
  enquiries: readLS('enquiries', enquiriesSeed, Array.isArray),
  categories: readLS('categories', categoriesSeed, Array.isArray),
  offers: readLS(
    'offers',
    [
      {
        id: 'offer-01',
        title: 'Student Tattoo Night',
        description: 'Every Thursday, students get 15% off fine line and single-needle work. Bring a valid ID.',
        image: '/tattoos/tattoo-11/01.svg',
        ctaLabel: 'Claim the discount',
        ctaUrl: '/contact',
        startDate: null,
        endDate: null,
        published: true,
        createdAt: '2030-01-01T10:00:00.000Z',
      },
      {
        id: 'offer-02',
        title: 'Cover-Up Consults Free',
        description: 'Book a cover-up consultation and the design session is on us — only pay if you go ahead.',
        image: '/tattoos/tattoo-07/01.svg',
        ctaLabel: 'Book a consult',
        ctaUrl: '/contact',
        startDate: null,
        endDate: null,
        published: false,
        createdAt: '2030-01-02T10:00:00.000Z',
      },
    ],
    Array.isArray,
  ),
  settings: readLS('settings', DEFAULT_SETTINGS, (v) => v && typeof v === 'object'),
}

function persist() {
  writeLS('tattoos', db.tattoos)
  writeLS('artists', db.artists)
  writeLS('reviews', db.reviews)
  writeLS('enquiries', db.enquiries)
  writeLS('categories', db.categories)
  writeLS('offers', db.offers)
  writeLS('settings', db.settings)
}

function categoryId(label) {
  const c = db.categories.find((x) => x.label.toLowerCase() === String(label).toLowerCase())
  return c ? c.id : ''
}

function categoryLabel(id) {
  return db.categories.find((c) => c.id === id)?.label || ''
}

function artistName(id) {
  return db.artists.find((a) => a.id === id)?.name || 'Oddaka'
}

function nowIso() {
  return new Date().toISOString()
}

// ----------------------------------------------------------------------------
// PUBLIC READS
// ----------------------------------------------------------------------------

export async function getTattoos({ onlyPublished = true } = {}) {
  await delay()
  let rows = clone(db.tattoos)
  if (onlyPublished) rows = rows.filter((t) => t.published)
  return rows
}

export async function getTattooById(id) {
  await delay(40)
  const row = db.tattoos.find((t) => t.id === id)
  return row ? clone(row) : null
}

export async function getFeaturedTattoos() {
  await delay()
  return clone(db.tattoos.filter((t) => t.featured && t.published))
}

export async function getTattoosByArtist(artistId, { onlyPublished = true } = {}) {
  await delay(50)
  let rows = db.tattoos.filter((t) => t.artistId === artistId)
  if (onlyPublished) rows = rows.filter((t) => t.published)
  return clone(rows)
}

export async function getTattoosByCategory(category, { onlyPublished = true } = {}) {
  await delay()
  let rows = db.tattoos.filter((t) => t.category === category)
  if (onlyPublished) rows = rows.filter((t) => t.published)
  return clone(rows)
}

export async function getRelatedTattoos(id, limit = 3) {
  await delay(50)
  const current = db.tattoos.find((t) => t.id === id)
  if (!current) return []
  const sameArtist = db.tattoos.filter((t) => t.artistId === current.artistId && t.id !== id)
  const sameCategory = db.tattoos.filter((t) => t.category === current.category && t.id !== id)
  const rest = db.tattoos.filter(
    (t) => t.id !== id && t.artistId !== current.artistId && t.category !== current.category,
  )
  return clone([...sameArtist, ...sameCategory, ...rest].slice(0, limit))
}

export async function getArtists(_opts = {}) {
  await delay()
  return clone([...db.artists].sort((a, b) => a.order - b.order))
}

export async function getArtistById(id) {
  await delay(40)
  const row = db.artists.find((a) => a.id === id)
  return row ? clone(row) : null
}

export async function getCategories(_opts = {}) {
  await delay(30)
  return clone([...db.categories].sort((a, b) => a.order - b.order))
}

export async function getReviews(_opts = {}) {
  await delay(50)
  return clone(db.reviews)
}

export async function getOffers() {
  await delay(40)
  const today = new Date().toISOString().slice(0, 10)
  return clone(
    db.offers.filter((o) => {
      if (!o.published) return false
      if (o.startDate && o.startDate > today) return false
      if (o.endDate && o.endDate < today) return false
      return true
    }),
  )
}

export async function getSettings() {
  await delay(30)
  return deepMerge(clone(DEFAULT_SETTINGS), clone(db.settings))
}

// ----------------------------------------------------------------------------
// ENQUIRIES
// ----------------------------------------------------------------------------

export async function createEnquiry(payload) {
  await delay(450)
  let referenceImage = payload.referenceImageFile
  if (referenceImage && payload.referenceImageFile) {
    referenceImage = await fileToDataUrl(payload.referenceImageFile)
  }
  const created = {
    id: `enq-${hex()}`,
    customer: payload.name || payload.customer || '',
    phone: payload.phone || '',
    email: payload.email || '',
    idea: payload.idea || '',
    style: payload.style || 'Not sure yet',
    placement: payload.placement || '',
    size: payload.size || '',
    preferredDate: payload.preferredDate || null,
    budget: payload.budget || '',
    artist: payload.artist || null,
    message: payload.message || '',
    referenceImage: referenceImage && payload.referenceImageFile ? referenceImage : null,
    status: 'NEW',
    createdAt: nowIso().slice(0, 10),
  }
  db.enquiries = [created, ...db.enquiries]
  persist()
  const out = clone(created)
  delete out.referenceImageFile
  return out
}

export async function getEnquiries() {
  await delay()
  return clone([...db.enquiries].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)))
}

export async function updateEnquiry(id, patch) {
  await delay(120)
  db.enquiries = db.enquiries.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: nowIso() } : e))
  persist()
  return clone(db.enquiries.find((e) => e.id === id))
}

export async function deleteEnquiry(id) {
  await delay(120)
  db.enquiries = db.enquiries.filter((e) => e.id !== id)
  persist()
  return true
}

// ----------------------------------------------------------------------------
// TATTOOS (admin)
// ----------------------------------------------------------------------------

export async function createTattoo(payload) {
  await delay()
  const id = payload.id || `tattoo-${hex(6)}`
  const row = {
    id,
    title: payload.title,
    style: payload.style || categoryLabel(payload.category),
    category: payload.category || (payload.style ? categoryId(payload.style) : 'custom'),
    artistId: payload.artistId || null,
    placement: payload.placement || '',
    size: payload.size || '',
    price: payload.price ?? null,
    description: payload.description || '',
    designNotes: payload.designNotes || '',
    featured: Boolean(payload.featured),
    published: Boolean(payload.published),
    sessions: payload.sessions ?? null,
    duration: payload.duration || '',
    year: payload.year ?? new Date().getFullYear(),
    shape: payload.shape || '0.85:1',
    cover: payload.cover || payload.photos?.[0] || null,
    photos: payload.photos || [],
    video: payload.video || null,
    videoPoster: payload.videoPoster || null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
  db.tattoos = [row, ...db.tattoos]
  persist()
  return clone(row)
}

export async function updateTattoo(id, patch) {
  await delay()
  const existing = db.tattoos.find((t) => t.id === id)
  if (!existing) throw new Error('That tattoo could not be found.')
  const next = {
    ...existing,
    ...patch,
    updatedAt: nowIso(),
  }
  if (patch.photos?.length) next.cover = patch.cover || patch.photos[0]
  db.tattoos = db.tattoos.map((t) => (t.id === id ? next : t))
  persist()
  return clone(next)
}

export async function deleteTattoo(id) {
  await delay()
  db.tattoos = db.tattoos.filter((t) => t.id !== id)
  persist()
  return true
}

export async function toggleTattooPublish(id) {
  const t = db.tattoos.find((x) => x.id === id)
  if (!t) return
  await updateTattoo(id, { published: !t.published })
  return clone(db.tattoos.find((x) => x.id === id))
}

export async function toggleTattooFeatured(id) {
  const t = db.tattoos.find((x) => x.id === id)
  if (!t) return
  await updateTattoo(id, { featured: !t.featured })
  return clone(db.tattoos.find((x) => x.id === id))
}

export async function saveTattooMedia(id, plan = {}) {
  await delay(120)
  const t = db.tattoos.find((x) => x.id === id)
  if (!t) throw new Error('That tattoo could not be found.')

  const photos = []
  for (const entry of plan.images || []) {
    if (entry.kind === 'file') {
      photos.push(await fileToDataUrl(entry.file))
    } else if (entry.url) {
      photos.push(entry.url)
    }
  }
  const cover = photos[(plan.coverImageIndex ?? 0)] || photos[0] || t.cover

  const videos = []
  for (const entry of plan.videos || []) {
    if (entry.kind === 'file') {
      videos.push(await fileToDataUrl(entry.file))
    } else if (entry.videoUrl) {
      videos.push(entry.videoUrl)
    }
  }

  const next = {
    ...t,
    photos,
    cover,
    video: videos[0] || null,
    videoPoster: plan.videoPoster || cover || t.videoPoster,
    updatedAt: nowIso(),
  }
  db.tattoos = db.tattoos.map((x) => (x.id === id ? next : x))
  persist()
  return clone(next)
}

// ----------------------------------------------------------------------------
// ARTISTS (admin)
// ----------------------------------------------------------------------------

export async function createArtist(payload) {
  await delay()
  const id = payload.id || `artist-${hex(6)}`
  const row = {
    id,
    name: payload.name,
    role: payload.role || '',
    specialties: payload.specialties || [],
    portrait: payload.portrait || null,
    experienceYears: payload.experienceYears ?? null,
    shortBio: payload.shortBio || '',
    bio: payload.bio || '',
    instagram: payload.instagram || '',
    featured: Boolean(payload.featured),
    order: payload.order ?? db.artists.length + 1,
    isActive: payload.isActive !== false,
  }
  db.artists = [...db.artists, row]
  persist()
  return clone(row)
}

export async function updateArtist(id, patch) {
  await delay()
  db.artists = db.artists.map((a) => (a.id === id ? { ...a, ...patch } : a))
  persist()
  return clone(db.artists.find((a) => a.id === id))
}

export async function deleteArtist(id) {
  await delay()
  const used = db.tattoos.some((t) => t.artistId === id)
  if (used) throw new Error('This artist still has tattoo pieces assigned. Move the pieces first.')
  db.artists = db.artists.filter((a) => a.id !== id)
  persist()
  return true
}

// ----------------------------------------------------------------------------
// CATEGORIES (admin)
// ----------------------------------------------------------------------------

export async function createCategory(payload) {
  await delay()
  const id = payload.id || payload.slug || `cat-${hex(4)}`
  const row = {
    id,
    label: payload.label || payload.name,
    description: payload.description || '',
    image: payload.image || null,
    order: payload.order ?? db.categories.length,
    isActive: payload.isActive !== false,
  }
  db.categories = [...db.categories, row]
  persist()
  return clone(row)
}

export async function updateCategory(id, patch) {
  await delay()
  db.categories = db.categories.map((c) => (c.id === id ? { ...c, ...patch } : c))
  persist()
  return clone(db.categories.find((c) => c.id === id))
}

export async function deleteCategory(id) {
  await delay()
  const used = db.tattoos.some((t) => t.category === id)
  if (used) throw new Error('Tattoos still use this category. Move them to another style first.')
  db.categories = db.categories.filter((c) => c.id !== id)
  persist()
  return true
}

export async function reorderCategory(id, direction) {
  await delay(80)
  const sorted = [...db.categories].sort((a, b) => a.order - b.order)
  const index = sorted.findIndex((c) => c.id === id)
  const swap = index + direction
  if (index < 0 || swap < 0 || swap >= sorted.length) return clone(sorted)
  const a = sorted[index]
  const b = sorted[swap]
  const temp = a.order
  a.order = b.order
  b.order = temp
  db.categories = sorted
  persist()
  return clone(sorted)
}

// ----------------------------------------------------------------------------
// REVIEWS (admin)
// ----------------------------------------------------------------------------

export async function createReview(payload) {
  await delay()
  const row = {
    id: `rev-${hex(6)}`,
    client: payload.client,
    review: payload.review,
    style: payload.style || '',
    tattooId: payload.tattooId || null,
    rating: payload.rating ?? 5,
    photo: payload.photo || null,
    published: payload.published !== false,
    featured: Boolean(payload.featured),
    createdAt: nowIso().slice(0, 10),
  }
  db.reviews = [row, ...db.reviews]
  persist()
  return clone(row)
}

export async function updateReview(id, patch) {
  await delay()
  db.reviews = db.reviews.map((r) => (r.id === id ? { ...r, ...patch } : r))
  persist()
  return clone(db.reviews.find((r) => r.id === id))
}

export async function deleteReview(id) {
  await delay()
  db.reviews = db.reviews.filter((r) => r.id !== id)
  persist()
  return true
}

// ----------------------------------------------------------------------------
// OFFERS (admin)
// ----------------------------------------------------------------------------

export async function createOffer(payload) {
  await delay()
  const row = {
    id: `offer-${hex(6)}`,
    title: payload.title,
    description: payload.description || '',
    image: payload.image || null,
    ctaLabel: payload.ctaLabel || 'Enquire now',
    ctaUrl: payload.ctaUrl || '/contact',
    startDate: payload.startDate || null,
    endDate: payload.endDate || null,
    published: Boolean(payload.published),
    createdAt: nowIso(),
  }
  db.offers = [row, ...db.offers]
  persist()
  return clone(row)
}

export async function updateOffer(id, patch) {
  await delay()
  db.offers = db.offers.map((o) => (o.id === id ? { ...o, ...patch } : o))
  persist()
  return clone(db.offers.find((o) => o.id === id))
}

export async function deleteOffer(id) {
  await delay()
  db.offers = db.offers.filter((o) => o.id !== id)
  persist()
  return true
}

export async function getAllOffers() {
  await delay(40)
  return clone([...db.offers].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)))
}

// ----------------------------------------------------------------------------
// FILE UPLOAD HELPERS (local demo stores files as data URLs)
// ----------------------------------------------------------------------------

export async function uploadArtistPortrait(artistId, file) {
  const url = await fileToDataUrl(file)
  return updateArtist(artistId, { portrait: url })
}

export async function uploadReviewPhoto(reviewId, file) {
  const url = await fileToDataUrl(file)
  return updateReview(reviewId, { photo: url })
}

export async function uploadWebsiteImage(file) {
  return fileToDataUrl(file)
}

// ----------------------------------------------------------------------------
// SETTINGS (admin)
// ----------------------------------------------------------------------------

export async function saveSettings(patch) {
  await delay()
  db.settings = deepMerge(clone(db.settings), clone(patch))
  persist()
  return deepMerge(clone(DEFAULT_SETTINGS), clone(db.settings))
}

// ----------------------------------------------------------------------------
// UTILITIES USED BY ADMIN UI
// ----------------------------------------------------------------------------

export function localHelpers() {
  return { artistName, categoryLabel, categoryId }
}

export const localModeLabel = 'Local demo mode (no Supabase connected)'