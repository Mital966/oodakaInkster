import { supabase, isSupabaseConfigured } from './client'
import { DEFAULT_SETTINGS, deepMerge } from './defaults'

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

const today = () => new Date().toISOString().slice(0, 10)

function publicUrl(bucket, path) {
  const { data, error } = supabase.storage.from(bucket).getPublicUrl(path)
  if (error) throw error
  return data.publicUrl
}

function safeName(name = '') {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase().slice(-80)
  return base || 'file'
}

export function validateImageFile(file) {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('Please upload a JPG, PNG or WEBP image.')
  if (file.size > MAX_IMAGE_BYTES) throw new Error('That image is too large. Please choose a file under 8 MB.')
}

export function validateVideoFile(file) {
  if (!VIDEO_TYPES.includes(file.type)) throw new Error('Please upload an MP4, WEBM or MOV video.')
  if (file.size > MAX_VIDEO_BYTES) throw new Error('That video is too large. Please choose a file under 200 MB.')
}

export function isBucketPath(url) {
  return Boolean(url && url.startsWith('tattoos/tattoos/') || (url && url.includes('/tattoos/tattoos/')))
}

async function uploadTo(bucket, folder, file) {
  const path = `${folder}/${crypto.randomUUID()}-${safeName(file.name)}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '31536000', upsert: false })
  if (error) throw new Error('Your file couldn’t be uploaded. Please check the format and try again.')
  return publicUrl(bucket, path)
}

function mapTattoo(row, images = [], videos = []) {
  const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order)
  const sortedVideos = [...videos].sort((a, b) => a.display_order - b.display_order)
  const cover = sortedImages.find((i) => i.is_cover)?.image_url || sortedImages[0]?.image_url || null
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    designNotes: row.design_notes || '',
    artistId: row.artist_id || null,
    category: row.category_id || '',
    style: row.style || '',
    placement: row.placement || '',
    size: row.size || '',
    price: row.price ?? null,
    sessions: row.sessions ?? null,
    duration: row.duration || '',
    year: row.year ?? null,
    shape: row.shape || '0.85:1',
    featured: row.featured,
    published: row.published,
    cover,
    photos: sortedImages.map((i) => i.image_url),
    video: sortedVideos[0]?.video_url || null,
    videoPoster: sortedVideos[0]?.thumbnail_url || cover,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function fetchMedia(tattooIds) {
  if (!tattooIds.length) return { images: [], videos: [] }
  const [imgs, vids] = await Promise.all([
    supabase.from('tattoo_images').select('tattoo_id, image_url, is_cover, display_order').in('tattoo_id', tattooIds),
    supabase.from('tattoo_videos').select('tattoo_id, video_url, thumbnail_url, display_order').in('tattoo_id', tattooIds),
  ])
  if (imgs.error) throw imgs.error
  if (vids.error) throw vids.error
  return { images: imgs.data || [], videos: vids.data || [] }
}

function groupMedia(records, key) {
  return records.reduce((acc, r) => {
    if (!acc[r[key]]) acc[r[key]] = []
    acc[r[key]].push(r)
    return acc
  }, {})
}

async function upsertSettingsFrom(supabaseClient, groups) {
  for (const [key, value] of Object.entries(groups || {})) {
    const { error } = await supabaseClient
      .from('site_settings')
      .upsert({ key, value }, { onConflict: 'key' })
    if (error) {
      throw new Error('We couldn’t save your website settings. Please try again.')
    }
  }
}

// ----------------------------------------------------------------------------
// PUBLIC READS
// ----------------------------------------------------------------------------

export async function getTattoos({ onlyPublished = true } = {}) {
  let query = supabase.from('tattoos').select('*').order('created_at', { ascending: false })
  if (onlyPublished) query = query.eq('published', true)
  const { data, error } = await query
  if (error) throw error
  const rows = data || []
  const { images, videos } = await fetchMedia(rows.map((r) => r.id))
  const byImage = groupMedia(images, 'tattoo_id')
  const byVideo = groupMedia(videos, 'tattoo_id')
  return rows.map((row) => mapTattoo(row, byImage[row.id] || [], byVideo[row.id] || []))
}

export async function getTattooById(id) {
  const { data, error } = await supabase.from('tattoos').select('*').eq('id', id).maybeSingle()
  if (error || !data) return null
  if (!data.published) return null
  const { images, videos } = await fetchMedia([data.id])
  return mapTattoo(data, images, videos)
}

export async function getFeaturedTattoos() {
  const { data, error } = await supabase
    .from('tattoos')
    .select('*')
    .eq('featured', true)
    .eq('published', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  const rows = data || []
  const { images, videos } = await fetchMedia(rows.map((r) => r.id))
  const byImage = groupMedia(images, 'tattoo_id')
  const byVideo = groupMedia(videos, 'tattoo_id')
  return rows.map((row) => mapTattoo(row, byImage[row.id] || [], byVideo[row.id] || []))
}

export async function getTattoosByArtist(artistId, { onlyPublished = true } = {}) {
  let query = supabase.from('tattoos').select('*').eq('artist_id', artistId)
  if (onlyPublished) query = query.eq('published', true)
  query = query.order('created_at', { ascending: false })
  const { data, error } = await query
  if (error) throw error
  const rows = data || []
  const { images, videos } = await fetchMedia(rows.map((r) => r.id))
  const byImage = groupMedia(images, 'tattoo_id')
  const byVideo = groupMedia(videos, 'tattoo_id')
  return rows.map((row) => mapTattoo(row, byImage[row.id] || [], byVideo[row.id] || []))
}

export async function getTattoosByCategory(category, { onlyPublished = true } = {}) {
  let query = supabase.from('tattoos').select('*').eq('category_id', category)
  if (onlyPublished) query = query.eq('published', true)
  query = query.order('created_at', { ascending: false })
  const { data, error } = await query
  if (error) throw error
  const rows = data || []
  const { images, videos } = await fetchMedia(rows.map((r) => r.id))
  const byImage = groupMedia(images, 'tattoo_id')
  const byVideo = groupMedia(videos, 'tattoo_id')
  return rows.map((row) => mapTattoo(row, byImage[row.id] || [], byVideo[row.id] || []))
}

export async function getRelatedTattoos(id, limit = 3) {
  const { data, error } = await supabase.from('tattoos').select('*').eq('published', true)
  if (error) throw error
  const rows = (data || []).filter((r) => r.id !== id)
  const currentRow = (data || []).find((r) => r.id === id)
  if (!currentRow) return []
  const sameArtist = rows.filter((r) => r.artist_id === currentRow.artist_id)
  const sameCategory = rows.filter((r) => r.category_id === currentRow.category_id)
  const rest = rows.filter(
    (r) => r.artist_id !== currentRow.artist_id && r.category_id !== currentRow.category_id,
  )
  const pool = [...sameArtist, ...sameCategory, ...rest]
    .filter((r, i, arr) => arr.findIndex((x) => x.id === r.id) === i)
    .slice(0, limit)
  const { images, videos } = await fetchMedia(pool.map((r) => r.id))
  const byImage = groupMedia(images, 'tattoo_id')
  const byVideo = groupMedia(videos, 'tattoo_id')
  return pool.map((row) => mapTattoo(row, byImage[row.id] || [], byVideo[row.id] || []))
}

export async function getArtists({ includeInactive = false } = {}) {
  let query = supabase.from('artists').select('*').order('display_order', { ascending: true })
  if (!includeInactive) query = query.eq('is_active', true)
  const { data, error } = await query
  if (error) throw error
  return (data || []).map((a) => ({
    id: a.id,
    name: a.name,
    role: a.role || '',
    specialties: a.specialties || [],
    portrait: a.profile_image || null,
    experienceYears: a.experience_years ?? null,
    shortBio: a.short_bio || '',
    bio: a.bio || '',
    instagram: a.instagram_url || '',
    featured: a.featured,
    order: a.display_order,
    isActive: a.is_active,
  }))
}

export async function getArtistById(id) {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle()
  if (error || !data) return null
  return {
    id: data.id,
    name: data.name,
    role: data.role || '',
    specialties: data.specialties || [],
    portrait: data.profile_image || null,
    experienceYears: data.experience_years ?? null,
    shortBio: data.short_bio || '',
    bio: data.bio || '',
    instagram: data.instagram_url || '',
    featured: data.featured,
    order: data.display_order,
    isActive: data.is_active,
  }
}

export async function getCategories({ includeInactive = false } = {}) {
  let query = supabase.from('categories').select('*').order('display_order', { ascending: true })
  if (!includeInactive) query = query.eq('is_active', true)
  const { data, error } = await query
  if (error) throw error
  return (data || []).map((c) => ({
    id: c.id,
    label: c.name,
    description: c.description || '',
    image: c.image || null,
    order: c.display_order,
    isActive: c.is_active,
  }))
}

export async function getReviews({ includeUnpublished = false } = {}) {
  let query = supabase.from('reviews').select('*').order('created_at', { ascending: false })
  if (!includeUnpublished) query = query.eq('published', true)
  const { data, error } = await query
  if (error) throw error
  return (data || []).map((r) => ({
    id: r.id,
    client: r.client_name,
    review: r.review,
    style: r.style || '',
    tattooId: r.tattoo_id || null,
    rating: r.rating ?? 5,
    photo: r.photo || null,
    published: r.published,
    featured: r.featured,
    createdAt: r.created_at,
  }))
}

export async function getOffers() {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || [])
    .filter((o) => {
      if (o.start_date && o.start_date > today()) return false
      if (o.end_date && o.end_date < today()) return false
      return true
    })
    .map((o) => ({
      id: o.id,
      title: o.title,
      description: o.description || '',
      image: o.image || null,
      ctaLabel: o.cta_label || 'Enquire now',
      ctaUrl: o.cta_url || '/contact',
      startDate: o.start_date,
      endDate: o.end_date,
      published: o.published,
      createdAt: o.created_at,
    }))
}

export async function getSettings() {
  const { data, error } = await supabase.from('site_settings').select('key, value')
  if (error) throw error
  const groups = {}
  for (const row of data || []) groups[row.key] = row.value
  return deepMerge(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)), groups)
}

// ----------------------------------------------------------------------------
// ENQUIRIES
// ----------------------------------------------------------------------------

async function uploadReference(file) {
  const path = `enquiries/${crypto.randomUUID()}-${safeName(file.name)}`
  const { error } = await supabase.storage.from('enquiries').upload(path, file, { upsert: false })
  if (error) throw new Error('Your reference image couldn’t be uploaded. Please try again.')
  return path
}

export async function createEnquiry(payload) {
  let reference = null
  if (payload.referenceImageFile) {
    reference = await uploadReference(payload.referenceImageFile)
  }
  const { data, error } = await supabase
    .from('enquiries')
    .insert({
      customer_name: payload.name || payload.customer || '',
      phone: payload.phone || '',
      email: payload.email || '',
      idea: payload.idea || '',
      style: payload.style || 'Not sure yet',
      placement: payload.placement || '',
      size: payload.size || '',
      preferred_date: payload.preferredDate || null,
      budget: payload.budget || '',
      artist_id: payload.artist || null,
      reference_image: reference,
      message: payload.message || '',
      status: 'NEW',
    })
    .select()
    .single()
  if (error) throw new Error('We couldn’t send your enquiry. Please check the form and try again.')
  return {
    id: data.id,
    customer: data.customer_name,
    phone: data.phone,
    email: data.email,
    idea: data.idea,
    style: data.style,
    placement: data.placement,
    size: data.size,
    preferredDate: data.preferred_date,
    budget: data.budget,
    artist: data.artist_id,
    message: data.message,
    status: data.status,
    referenceUrl: null,
    createdAt: data.created_at,
  }
}

export async function getEnquiries() {
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  const rows = data || []
  const paths = rows.map((r) => r.reference_image).filter((p) => p && p.startsWith('enquiries/'))
  let signed = []
  if (paths.length) {
    const { data: urls, error: err } = await supabase.storage.from('enquiries').createSignedUrls(paths, 60 * 60 * 24)
    if (!err) signed = urls || []
  }
  const urlByPath = signed.reduce((acc, s) => {
    if (s) acc[s.path] = s.signedUrl
    return acc
  }, {})
  return rows.map((r) => ({
    id: r.id,
    customer: r.customer_name,
    phone: r.phone,
    email: r.email,
    idea: r.idea,
    style: r.style,
    placement: r.placement,
    size: r.size,
    preferredDate: r.preferred_date,
    budget: r.budget,
    artist: r.artist_id,
    message: r.message,
    status: r.status,
    referenceUrl: r.reference_image?.startsWith('enquiries/') ? (urlByPath[r.reference_image] || null) : r.reference_image,
    createdAt: r.created_at?.slice?.(0, 10) || r.created_at,
  }))
}

export async function updateEnquiry(id, patch) {
  const { data, error } = await supabase
    .from('enquiries')
    .update({
      status: patch.status,
      preferred_date: patch.preferredDate,
      message: patch.message,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error('We couldn’t update that enquiry. Please try again.')
  return { id: data.id, status: data.status }
}

export async function deleteEnquiry(id) {
  const { data, error } = await supabase.from('enquiries').select('reference_image').eq('id', id).maybeSingle()
  if (error) throw error
  if (data?.reference_image?.startsWith('enquiries/')) {
    await supabase.storage.from('enquiries').remove([data.reference_image])
  }
  const { error: delErr } = await supabase.from('enquiries').delete().eq('id', id)
  if (delErr) throw new Error('We couldn’t delete that enquiry. Please try again.')
  return true
}

// ----------------------------------------------------------------------------
// TATTOOS (admin)
// ----------------------------------------------------------------------------

export async function createTattoo(payload) {
  const { data, error } = await supabase
    .from('tattoos')
    .insert({
      title: payload.title,
      slug: payload.slug || `${payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'piece'}-${Date.now().toString(36)}`,
      description: payload.description || '',
      design_notes: payload.designNotes || '',
      artist_id: payload.artistId || null,
      category_id: payload.category || null,
      style: payload.style || '',
      placement: payload.placement || '',
      size: payload.size || '',
      price: payload.price ?? null,
      sessions: payload.sessions ?? null,
      duration: payload.duration || '',
      year: payload.year ?? null,
      shape: payload.shape || '0.85:1',
      featured: Boolean(payload.featured),
      published: Boolean(payload.published),
    })
    .select()
    .single()
  if (error) throw new Error('We couldn’t save this tattoo. Please check the details and try again.')
  data.slug = data.id
  return mapTattoo(data)
}

export async function updateTattoo(id, patch) {
  const { data, error } = await supabase
    .from('tattoos')
    .update({
      title: patch.title,
      description: patch.description || '',
      design_notes: patch.designNotes ?? '',
      artist_id: patch.artistId || null,
      category_id: patch.category || null,
      style: patch.style ?? '',
      placement: patch.placement || '',
      size: patch.size || '',
      price: patch.price ?? null,
      sessions: patch.sessions ?? null,
      duration: patch.duration || '',
      year: patch.year ?? null,
      shape: patch.shape || '0.85:1',
      featured: Boolean(patch.featured),
      published: Boolean(patch.published),
    })
    .eq('id', id)
    .select()
    .maybeSingle()
  if (error) throw error
  if (!data) throw new Error('That tattoo could not be found.')
  const { images, videos } = await fetchMedia([data.id])
  return mapTattoo(data, images, videos)
}

export async function deleteTattoo(id) {
  const { data, error } = await supabase
    .from('tattoos')
    .select('id')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) throw new Error('That tattoo could not be found.')
  const { images, videos } = await fetchMedia([id])
  const urls = [...images.map((i) => i.image_url), ...videos.map((v) => v.video_url)]
  const { error: delErr } = await supabase.from('tattoos').delete().eq('id', id)
  if (delErr) throw new Error('We couldn’t delete that tattoo. Please try again.')
  await cleanupStoredFiles('tattoos', urls)
  return true
}

export async function toggleTattooPublish(id) {
  const { data, error } = await supabase.from('tattoos').select('published').eq('id', id).maybeSingle()
  if (error || !data) throw new Error('That tattoo could not be found.')
  return updateTattoo(id, { published: !data.published })
}

export async function toggleTattooFeatured(id) {
  const { data, error } = await supabase.from('tattoos').select('featured').eq('id', id).maybeSingle()
  if (error || !data) throw new Error('That tattoo could not be found.')
  return updateTattoo(id, { featured: !data.featured })
}

// plan shape:
//   {
//     images: [{ kind: 'file', file }, { kind: 'url', url }],   // final order
//     coverImageIndex: number,                                   // index into images
//     videos: [{ kind: 'file', file }, { kind: 'url', videoUrl, thumbnailUrl }],
//     removedImageUrls: [string],
//     removedVideoUrls: [string],
//     videoPoster: string | null,
//   }
export async function saveTattooMedia(id, plan = {}) {
  const { data: existing, error: exErr } = await supabase.from('tattoos').select('id').eq('id', id).maybeSingle()
  if (exErr || !existing) throw new Error('That tattoo could not be found.')

  // 1. Upload new files, preserving positional order
  const uploadedImageUrls = []
  const uploadedVideo = []
  const images = []
  for (const entry of plan.images || []) {
    if (entry.kind === 'file') {
      validateImageFile(entry.file)
      const url = await uploadTo('tattoos', `tattoos/${id}`, entry.file)
      uploadedImageUrls.push(url)
      images.push(url)
    } else {
      images.push(entry.url)
    }
  }
  for (const entry of plan.videos || []) {
    if (entry.kind === 'file') {
      validateVideoFile(entry.file)
      const videoUrl = await uploadTo('tattoos', `tattoos/${id}`, entry.file)
      uploadedVideo.push(videoUrl)
    } else {
      uploadedVideo.push(entry.videoUrl)
    }
  }

  // 2. Clean up storage objects removed from the set (best effort)
  const removePaths = [...(plan.removedImageUrls || []), ...(plan.removedVideoUrls || [])]
  await cleanupStoredFiles('tattoos', removePaths)

  // 3. Delete existing media rows, then re-insert in final order
  const { error: delImg } = await supabase.from('tattoo_images').delete().eq('tattoo_id', id)
  if (delImg) throw new Error('We couldn’t update the photos. Please try again.')
  const { error: delVid } = await supabase.from('tattoo_videos').delete().eq('tattoo_id', id)
  if (delVid) throw new Error('We couldn’t update the videos. Please try again.')

  const coverUrl =
    images[(plan.coverImageIndex ?? 0)] ?? images[0] ?? ''

  if (images.length) {
    const rows = images.map((url, i) => ({
      tattoo_id: id,
      image_url: url,
      alt_text: '',
      display_order: i,
      is_cover: url === coverUrl,
    }))
    const { error } = await supabase.from('tattoo_images').insert(rows)
    if (error) throw new Error('We couldn’t save the photos. Please try again.')
  }

  if (uploadedVideo.length) {
    const rows = uploadedVideo.map((videoUrl, i) => ({
      tattoo_id: id,
      video_url: videoUrl,
      thumbnail_url: (plan.videos?.[i]?.kind === 'url' ? plan.videos[i].thumbnailUrl : null) || plan.videoPoster || coverUrl,
      display_order: i,
    }))
    const { error } = await supabase.from('tattoo_videos').insert(rows)
    if (error) throw new Error('We couldn’t save the videos. Please try again.')
  }

  const { data, error } = await supabase.from('tattoos').select('*').eq('id', id).maybeSingle()
  if (error || !data) throw new Error('That tattoo could not be found.')
  const { images: imgs, videos: vids } = await fetchMedia([id])
  return mapTattoo(data, imgs, vids)
}

async function cleanupStoredFiles(bucket, urls) {
  const paths = (urls || [])
    .map((raw) => {
      try {
        const u = new URL(raw)
        const fold = `/${bucket}/`
        const idx = u.pathname.indexOf(fold)
        return idx >= 0 ? u.pathname.slice(idx + 1) : null
      } catch {
        return null
      }
    })
    .filter(Boolean)
  if (!paths.length) return
  const { error } = await supabase.storage.from(bucket).remove(paths)
  if (error) {
    // Non-fatal: storage cleanup issues shouldn't block the rest of the flow.
    console.warn('storage cleanup', error.message)
  }
}

// ----------------------------------------------------------------------------
// ARTISTS (admin)
// ----------------------------------------------------------------------------

export async function createArtist(payload) {
  const { data, error } = await supabase
    .from('artists')
    .insert({
      name: payload.name,
      slug: payload.slug || payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `artist-${Date.now().toString(36)}`,
      role: payload.role || '',
      specialties: payload.specialties || [],
      profile_image: payload.portrait || null,
      bio: payload.bio || '',
      short_bio: payload.shortBio || '',
      experience_years: payload.experienceYears ?? null,
      instagram_url: payload.instagram || null,
      featured: Boolean(payload.featured),
      display_order: payload.order ?? 0,
      is_active: payload.isActive !== false,
    })
    .select()
    .single()
  if (error) throw new Error('We couldn’t add the artist. Please check the details and try again.')
  return getArtistById(data.id)
}

export async function updateArtist(id, patch) {
  const { error } = await supabase
    .from('artists')
    .update({
      name: patch.name,
      role: patch.role ?? '',
      specialties: patch.specialties ?? [],
      profile_image: patch.portrait ?? null,
      bio: patch.bio ?? '',
      short_bio: patch.shortBio ?? '',
      experience_years: patch.experienceYears ?? null,
      instagram_url: patch.instagram ?? null,
      featured: Boolean(patch.featured),
      display_order: patch.order ?? 0,
      is_active: patch.isActive ?? true,
    })
    .eq('id', id)
  if (error) throw new Error('We couldn’t save the artist. Please try again.')
  return getArtistById(id)
}

export async function deleteArtist(id) {
  const { count, error: cErr } = await supabase.from('tattoos').select('id', { count: 'exact', head: true }).eq('artist_id', id)
  if (cErr) throw cErr
  if ((count || 0) > 0) throw new Error('This artist still has tattoo pieces assigned. Move the pieces first.')
  const { data, error } = await supabase.from('artists').select('profile_image').eq('id', id).maybeSingle()
  if (error) throw error
  const { error: delErr } = await supabase.from('artists').delete().eq('id', id)
  if (delErr) throw new Error('We couldn’t remove that artist. Please try again.')
  if (data?.profile_image) await cleanupStoredFiles('artists', [data.profile_image])
  return true
}

export async function uploadArtistPortrait(artistId, file) {
  validateImageFile(file)
  const url = await uploadTo('artists', `artists/${artistId}`, file)
  return updateArtist(artistId, { portrait: url })
}

// ----------------------------------------------------------------------------
// CATEGORIES (admin)
// ----------------------------------------------------------------------------

export async function createCategory(payload) {
  const slug = payload.slug || payload.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `cat-${Date.now().toString(36)}`
  const { data, error } = await supabase
    .from('categories')
    .insert({
      id: slug,
      name: payload.label || payload.name,
      slug,
      description: payload.description || '',
      image: payload.image || null,
      display_order: payload.order ?? 0,
      is_active: payload.isActive !== false,
    })
    .select()
    .single()
  if (error) throw new Error('We couldn’t add that category. Maybe it already exists.')
  return {
    id: data.id,
    label: data.name,
    description: data.description || '',
    image: data.image || null,
    order: data.display_order,
    isActive: data.is_active,
  }
}

export async function updateCategory(id, patch) {
  const { error } = await supabase
    .from('categories')
    .update({
      name: patch.label ?? patch.name,
      description: patch.description ?? '',
      image: patch.image ?? null,
      display_order: patch.order ?? 0,
      is_active: patch.isActive ?? true,
    })
    .eq('id', id)
  if (error) throw new Error('We couldn’t save that category. Please try again.')
  const categories = await getCategories()
  return categories.find((c) => c.id === id)
}

export async function deleteCategory(id) {
  const { count, error: cErr } = await supabase
    .from('tattoos')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)
  if (cErr) throw cErr
  if ((count || 0) > 0) throw new Error('Tattoos still use this category. Move them to another style first.')
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw new Error('We couldn’t delete that category. Please try again.')
  return true
}

export async function reorderCategory(id, direction) {
  const categories = await getCategories()
  const index = categories.findIndex((c) => c.id === id)
  const swap = index + direction
  if (index < 0 || swap < 0 || swap >= categories.length) return categories
  const a = categories[index]
  const b = categories[swap]
  await supabase.from('categories').update({ display_order: b.order }).eq('id', a.id)
  await supabase.from('categories').update({ display_order: a.order }).eq('id', b.id)
  return getCategories()
}

// ----------------------------------------------------------------------------
// REVIEWS (admin)
// ----------------------------------------------------------------------------

export async function createReview(payload) {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      client_name: payload.client,
      review: payload.review,
      style: payload.style || '',
      tattoo_id: payload.tattooId || null,
      photo: payload.photo || null,
      rating: payload.rating ?? 5,
      published: payload.published !== false,
      featured: Boolean(payload.featured),
    })
    .select()
    .single()
  if (error) throw new Error('We couldn’t add the review. Please check the details and try again.')
  return getReviews().then((r) => r.find((x) => x.id === data.id))
}

export async function updateReview(id, patch) {
  const { error } = await supabase
    .from('reviews')
    .update({
      client_name: patch.client,
      review: patch.review,
      style: patch.style ?? '',
      tattoo_id: patch.tattooId || null,
      photo: patch.photo ?? null,
      rating: patch.rating ?? 5,
      published: patch.published ?? true,
      featured: Boolean(patch.featured),
    })
    .eq('id', id)
  if (error) throw new Error('We couldn’t save the review. Please try again.')
  const reviews = await getReviews()
  return reviews.find((r) => r.id === id)
}

export async function deleteReview(id) {
  const { data, error } = await supabase.from('reviews').select('photo').eq('id', id).maybeSingle()
  if (error) throw error
  const { error: delErr } = await supabase.from('reviews').delete().eq('id', id)
  if (delErr) throw new Error('We couldn’t delete the review. Please try again.')
  if (data?.photo) await cleanupStoredFiles('reviews', [data.photo])
  return true
}

export async function uploadReviewPhoto(reviewId, file) {
  validateImageFile(file)
  const url = await uploadTo('reviews', `reviews/${reviewId}`, file)
  return updateReview(reviewId, { photo: url })
}

// ----------------------------------------------------------------------------
// OFFERS (admin)
// ----------------------------------------------------------------------------

export async function createOffer(payload) {
  const { data, error } = await supabase
    .from('offers')
    .insert({
      title: payload.title,
      description: payload.description || '',
      image: payload.image || null,
      cta_label: payload.ctaLabel || 'Enquire now',
      cta_url: payload.ctaUrl || '/contact',
      start_date: payload.startDate || null,
      end_date: payload.endDate || null,
      published: Boolean(payload.published),
    })
    .select()
    .single()
  if (error) throw new Error('We couldn’t save the offer. Please try again.')
  return getAllOffers().then((o) => o.find((x) => x.id === data.id))
}

export async function updateOffer(id, patch) {
  const { error } = await supabase
    .from('offers')
    .update({
      title: patch.title,
      description: patch.description ?? '',
      image: patch.image ?? null,
      cta_label: patch.ctaLabel ?? 'Enquire now',
      cta_url: patch.ctaUrl ?? '/contact',
      start_date: patch.startDate || null,
      end_date: patch.endDate || null,
      published: Boolean(patch.published),
    })
    .eq('id', id)
  if (error) throw new Error('We couldn’t save the offer. Please try again.')
  return getAllOffers().then((o) => o.find((x) => x.id === id))
}

export async function deleteOffer(id) {
  const { data, error } = await supabase.from('offers').select('image').eq('id', id).maybeSingle()
  if (error) throw error
  const { error: delErr } = await supabase.from('offers').delete().eq('id', id)
  if (delErr) throw new Error('We couldn’t delete the offer. Please try again.')
  if (data?.image) await cleanupStoredFiles('website', [data.image])
  return true
}

async function getAllOffers() {
  const { data, error } = await supabase.from('offers').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map((o) => ({
    id: o.id,
    title: o.title,
    description: o.description || '',
    image: o.image || null,
    ctaLabel: o.cta_label || 'Enquire now',
    ctaUrl: o.cta_url || '/contact',
    startDate: o.start_date,
    endDate: o.end_date,
    published: o.published,
    createdAt: o.created_at,
  }))
}

export { getAllOffers }

// ----------------------------------------------------------------------------
// SETTINGS (admin)
// ----------------------------------------------------------------------------

export async function saveSettings(patch) {
  await upsertSettingsFrom(supabase, patch)
  return getSettings()
}

export async function uploadWebsiteImage(file) {
  validateImageFile(file)
  return uploadTo('website', `website/${Date.now()}`, file)
}

export function assertConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to run against a real database.')
  }
}