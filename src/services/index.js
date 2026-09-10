import { isSupabaseConfigured } from './client'
import * as local from './local'
import * as remote from './remote'

const impl = isSupabaseConfigured ? remote : local

export const remoteConfigured = isSupabaseConfigured

export const backendMode = () => (isSupabaseConfigured ? 'remote' : 'local')
export const backendLabel = () =>
  isSupabaseConfigured
    ? 'Connected to Supabase'
    : 'Local demo mode — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to go live'

export const MAX_IMAGE_BYTES = remote.MAX_IMAGE_BYTES || 8 * 1024 * 1024
export const MAX_VIDEO_BYTES = remote.MAX_VIDEO_BYTES || 200 * 1024 * 1024

// --- reads ---
export const getTattoos = impl.getTattoos.bind(impl)
export const getTattooById = impl.getTattooById.bind(impl)
export const getFeaturedTattoos = impl.getFeaturedTattoos.bind(impl)
export const getTattoosByArtist = impl.getTattoosByArtist.bind(impl)
export const getTattoosByCategory = impl.getTattoosByCategory.bind(impl)
export const getRelatedTattoos = impl.getRelatedTattoos.bind(impl)
export const getArtists = impl.getArtists.bind(impl)
export const getArtistById = impl.getArtistById.bind(impl)
export const getCategories = impl.getCategories.bind(impl)
export const getReviews = impl.getReviews.bind(impl)
export const getOffers = impl.getOffers.bind(impl)
export const getSettings = impl.getSettings.bind(impl)

// --- enquiries ---
export const createEnquiry = impl.createEnquiry.bind(impl)
export const getEnquiries = impl.getEnquiries.bind(impl)
export const updateEnquiry = impl.updateEnquiry.bind(impl)
export const deleteEnquiry = impl.deleteEnquiry.bind(impl)

// --- tattoos ---
export const createTattoo = impl.createTattoo.bind(impl)
export const updateTattoo = impl.updateTattoo.bind(impl)
export const deleteTattoo = impl.deleteTattoo.bind(impl)
export const toggleTattooPublish = impl.toggleTattooPublish.bind(impl)
export const toggleTattooFeatured = impl.toggleTattooFeatured.bind(impl)
export const saveTattooMedia = impl.saveTattooMedia.bind(impl)

// --- artists ---
export const createArtist = impl.createArtist.bind(impl)
export const updateArtist = impl.updateArtist.bind(impl)
export const deleteArtist = impl.deleteArtist.bind(impl)
export const uploadArtistPortrait = impl.uploadArtistPortrait?.bind(impl)

// --- categories ---
export const createCategory = impl.createCategory.bind(impl)
export const updateCategory = impl.updateCategory.bind(impl)
export const deleteCategory = impl.deleteCategory.bind(impl)
export const reorderCategory = impl.reorderCategory.bind(impl)

// --- reviews ---
export const createReview = impl.createReview.bind(impl)
export const updateReview = impl.updateReview.bind(impl)
export const deleteReview = impl.deleteReview.bind(impl)
export const uploadReviewPhoto = impl.uploadReviewPhoto?.bind(impl)

// --- offers ---
export const createOffer = impl.createOffer.bind(impl)
export const updateOffer = impl.updateOffer.bind(impl)
export const deleteOffer = impl.deleteOffer.bind(impl)
export const getAllOffers = impl.getAllOffers?.bind(impl)

// --- settings / website images ---
export const saveSettings = impl.saveSettings.bind(impl)
export const uploadWebsiteImage = impl.uploadWebsiteImage?.bind(impl)

// --- local-mode helpers used by admin UI ---
export const localHelpers = impl.localHelpers
export const localModeLabel = impl.localModeLabel