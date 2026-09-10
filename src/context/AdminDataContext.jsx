import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  getTattoos,
  getArtists,
  getCategories,
  getReviews,
  getEnquiries,
  getAllOffers,
  getSettings,
  createTattoo,
  updateTattoo as updateTattooSvc,
  deleteTattoo as deleteTattooSvc,
  toggleTattooPublish,
  toggleTattooFeatured,
  saveTattooMedia as saveTattooMediaSvc,
  createArtist,
  updateArtist as updateArtistSvc,
  deleteArtist as deleteArtistSvc,
  createCategory,
  updateCategory as updateCategorySvc,
  deleteCategory as deleteCategorySvc,
  reorderCategory,
  createReview,
  updateReview as updateReviewSvc,
  deleteReview as deleteReviewSvc,
  createOffer,
  updateOffer as updateOfferSvc,
  deleteOffer as deleteOfferSvc,
  updateEnquiry,
  deleteEnquiry as deleteEnquirySvc,
  saveSettings,
  backendMode,
  backendLabel,
} from '../services'

// Single source of truth for the admin UI. Every load goes through the
// service layer (Supabase, or the local demo backend), and every mutation
// calls its service then refreshes the affected collection so the UI always
// reflects what is actually persisted.

const [_, AdminDataProvider, useAdminData] = (() => {
  const Ctx = createContext(null)
  const Provider = ({ children }) => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [state, setState] = useState({
      tattoos: [],
      artists: [],
      categories: [],
      reviews: [],
      enquiries: [],
      offers: [],
      settings: null,
    })

    const refresh = useCallback(async () => {
      setLoading(true)
      try {
        const [tattoos, artists, categories, reviews, enquiries, offers, settings] = await Promise.all([
          getTattoos({ onlyPublished: false }),
          getArtists({ includeInactive: true }),
          getCategories({ includeInactive: true }),
          getReviews({ includeUnpublished: true }),
          getEnquiries(),
          getAllOffers?.(),
          getSettings(),
        ])
        setState({ tattoos, artists, categories, reviews, enquiries, offers: offers || [], settings })
        setError(null)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }, [])

    useEffect(() => {
      refresh()
    }, [refresh])

    const artistName = useCallback(
      (id) => state.artists.find((a) => a.id === id)?.name || 'Unassigned',
      [state.artists],
    )
    const categoryLabel = useCallback(
      (id) => state.categories.find((c) => c.id === id)?.label || 'Style',
      [state.categories],
    )

    // --- tattoos ---------------------------------------------------------
    const addTattoo = async (payload) => {
      const created = await createTattoo(payload)
      await refresh()
      return created
    }
    const updateTattoo = async (id, patch) => {
      const updated = await updateTattooSvc(id, patch)
      await refresh()
      return updated
    }
    const deleteTattoo = async (id) => {
      await deleteTattooSvc(id)
      await refresh()
    }
    const togglePublish = async (id) => {
      const updated = await toggleTattooPublish(id)
      await refresh()
      return updated
    }
    const toggleFeatured = async (id) => {
      const updated = await toggleTattooFeatured(id)
      await refresh()
      return updated
    }
    const saveTattooMedia = async (id, plan) => {
      const updated = await saveTattooMediaSvc(id, plan)
      await refresh()
      return updated
    }

    // --- artists ---------------------------------------------------------
    const addArtist = async (payload) => {
      const created = await createArtist(payload)
      await refresh()
      return created
    }
    const updateArtist = async (id, patch) => {
      const updated = await updateArtistSvc(id, patch)
      await refresh()
      return updated
    }
    const deleteArtist = async (id) => {
      await deleteArtistSvc(id)
      await refresh()
    }

    // --- categories ------------------------------------------------------
    const addCategory = async (payload) => {
      const created = await createCategory(payload)
      await refresh()
      return created
    }
    const updateCategory = async (id, patch) => {
      const updated = await updateCategorySvc(id, patch)
      await refresh()
      return updated
    }
    const deleteCategory = async (id) => {
      await deleteCategorySvc(id)
      await refresh()
    }
    const moveCategory = async (id, direction) => {
      const categories = await reorderCategory(id, direction)
      await refresh()
      return categories
    }

    // --- reviews ---------------------------------------------------------
    const addReview = async (payload) => {
      const created = await createReview(payload)
      await refresh()
      return created
    }
    const updateReview = async (id, patch) => {
      const updated = await updateReviewSvc(id, patch)
      await refresh()
      return updated
    }
    const deleteReview = async (id) => {
      await deleteReviewSvc(id)
      await refresh()
    }

    // --- offers ----------------------------------------------------------
    const addOffer = async (payload) => {
      const created = await createOffer(payload)
      await refresh()
      return created
    }
    const updateOffer = async (id, patch) => {
      const updated = await updateOfferSvc(id, patch)
      await refresh()
      return updated
    }
    const deleteOffer = async (id) => {
      await deleteOfferSvc(id)
      await refresh()
    }

    // --- enquiries -------------------------------------------------------
    const updateEnquiryStatus = async (id, status) => {
      await updateEnquiry(id, { status })
      await refresh()
    }
    const deleteEnquiry = async (id) => {
      await deleteEnquirySvc(id)
      await refresh()
    }

    // --- settings --------------------------------------------------------
    const updateSettings = async (patch) => {
      const next = await saveSettings(patch)
      setState((prev) => ({ ...prev, settings: next }))
      return next
    }

    const value = {
      ...state,
      loading,
      error,
      refresh,
      backendMode: backendMode(),
      backendLabel: backendLabel(),
      artistName,
      categoryLabel,
      addTattoo,
      updateTattoo,
      deleteTattoo,
      togglePublish,
      toggleFeatured,
      saveTattooMedia,
      addArtist,
      updateArtist,
      deleteArtist,
      addCategory,
      updateCategory,
      deleteCategory,
      moveCategory,
      addReview,
      updateReview,
      deleteReview,
      addOffer,
      updateOffer,
      deleteOffer,
      updateEnquiryStatus,
      deleteEnquiry,
      updateSettings,
    }

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>
  }
  const useData = () => useContext(Ctx)
  return [Ctx, Provider, useData]
})()

export { AdminDataProvider, useAdminData }