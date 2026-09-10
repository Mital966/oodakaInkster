import { AnimatePresence } from 'framer-motion'
import { Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import ConfirmModal from '../../components/admin/ConfirmModal'
import EmptyState from '../../components/admin/EmptyState'
import FormField, { inputCls } from '../../components/admin/FormField'
import Toggle from '../../components/admin/Toggle'
import { useToast } from '../../components/admin/Toast'
import Modal from '../../components/common/Modal'
import { useAdminData } from '../../context/AdminDataContext'
import { cn } from '../../utils/cn'
import { formatDate } from '../../utils/format'

const EMPTY = { client: '', review: '', style: '', rating: 5, tattooId: '' }

function AdminReviews() {
  const { reviews, tattoos, addReview, updateReview, deleteReview, artistName } = useAdminData()
  const { toast } = useToast()
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const tattooLabel = (id) => tattoos.find((t) => t.id === id)?.title

  function openNew() {
    setDraft(EMPTY)
    setErrors({})
    setEditing('new')
  }

  function openEdit(r) {
    setDraft({
      client: r.client,
      review: r.review,
      style: r.style || '',
      rating: r.rating ?? 5,
      tattooId: r.tattooId || '',
    })
    setErrors({})
    setEditing({ ...r, _showFeatured: r.featured, _showPublished: r.published !== false })
  }

  function setRating(rating) {
    setDraft((d) => ({ ...d, rating }))
  }

  async function handleSave() {
    const e = {}
    if (!draft.client.trim()) e.client = 'Client name is required'
    if (draft.review.trim().length < 40) e.review = 'Write at least a couple of sentences (40+ characters)'
    setErrors(e)
    if (Object.keys(e).length) {
      toast('error', 'Add the client name and a proper review.')
      return
    }
    setBusy(true)
    const payload = {
      client: draft.client.trim(),
      review: draft.review.trim(),
      style: draft.style.trim(),
      rating: draft.rating,
      tattooId: draft.tattooId || null,
      featured: editing?._showFeatured ?? false,
      published: editing?._showPublished ?? true,
    }
    try {
      if (editing === 'new') {
        await addReview(payload)
        toast('success', 'Review added.')
      } else {
        await updateReview(editing.id, payload)
        toast('success', 'Review saved.')
      }
      setEditing(null)
    } catch (err) {
      toast('error', err.message || 'We couldn’t save the review.')
    } finally {
      setBusy(false)
    }
  }

  async function toggleReview(r, key, okMsg) {
    try {
      await updateReview(r.id, { [key]: !r[key] })
      toast('success', okMsg)
    } catch (err) {
      toast('error', err.message || 'We couldn’t update that review.')
    }
  }

  async function handleDelete() {
    if (!toDelete) return
    try {
      await deleteReview(toDelete.id)
      toast('success', 'Review deleted.')
      setToDelete(null)
    } catch (err) {
      toast('error', err.message || 'We couldn’t delete the review.')
      setToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-neutral-900">Reviews</h1>
          <p className="mt-1 text-sm text-neutral-500">Client stories shown on the homepage. Drafts are hidden from the public site.</p>
        </div>
        <button type="button" onClick={openNew} className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-neutral-100 transition-colors hover:bg-neutral-800">
          <Plus size={15} /> Add review
        </button>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          message="Add your first client review — it will show up on the homepage as soon as you publish it."
          action={
            <button type="button" onClick={openNew} className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-neutral-100 transition-colors hover:bg-neutral-800">
              Add your first review
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <article key={r.id} className={cn('rounded-lg border bg-white p-5 shadow-sm', r.published === false && 'border-dashed border-neutral-300 opacity-70')}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className={i < r.rating ? 'fill-amber-400' : 'text-neutral-200'} />
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{r.client}</p>
                    <p className="text-xs text-neutral-400">
                      {r.style || 'General'} · {r.tattooId ? (tattooLabel(r.tattooId) || 'Related piece') : formatDate(r.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Toggle on={r.published !== false} onChange={() => toggleReview(r, 'published', r.published === false ? 'Review is now public.' : 'Review moved to drafts.')} label="Toggle published" />
                    <span className={cn('font-semibold', r.published === false ? 'text-neutral-400' : 'text-emerald-600')}>{r.published === false ? 'Draft' : 'Live'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Toggle on={r.featured} onChange={() => toggleReview(r, 'featured', r.featured ? 'Removed from featured.' : 'Featured on the homepage.')} label="Toggle featured" />
                    <Star size={12} className={r.featured ? 'fill-amber-400 text-amber-500' : 'text-neutral-300'} />
                  </div>
                  <button type="button" onClick={() => openEdit(r)} aria-label="Edit review" className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900">
                    <Pencil size={15} />
                  </button>
                  <button type="button" onClick={() => setToDelete(r)} aria-label="Delete review" className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-600">“{r.review}”</p>
            </article>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="Delete review?"
        message={toDelete ? `The review from ${toDelete.client} will be removed from the site.` : ''}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
      />

      <AnimatePresence>
        <Modal open={editing !== null} onClose={() => !busy && setEditing(null)} title={editing === 'new' ? 'Add a review' : `Edit review from ${editing?.client}`} width="max-w-xl">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Client name *" error={errors.client}>
                <input className={cn(inputCls, errors.client && 'border-red-400')} value={draft.client} onChange={(e) => setDraft((d) => ({ ...d, client: e.target.value }))} />
              </FormField>
              <FormField label="Style">
                <input className={inputCls} value={draft.style} onChange={(e) => setDraft((d) => ({ ...d, style: e.target.value }))} placeholder="e.g. Blackwork" />
              </FormField>
            </div>
            <FormField label="Tattoo to link">
              <select className={cn(inputCls, 'cursor-pointer')} value={draft.tattooId} onChange={(e) => setDraft((d) => ({ ...d, tattooId: e.target.value }))}>
                <option value="">No link</option>
                {tattoos.map((t) => (
                  <option key={t.id} value={t.id}>{t.title} · {artistName(t.artistId)}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Review *" error={errors.review}>
              <textarea className={cn(inputCls, 'min-h-[110px] resize-y', errors.review && 'border-red-400')} value={draft.review} onChange={(e) => setDraft((d) => ({ ...d, review: e.target.value }))} placeholder="What did the client say about the process and the piece?" />
            </FormField>
            <FormField label="Rating">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} type="button" onClick={() => setRating(i + 1)} aria-label={`${i + 1} stars`} className="p-0.5">
                    <Star size={20} className={i < draft.rating ? 'fill-amber-400 text-amber-500' : 'text-neutral-300'} />
                  </button>
                ))}
              </div>
            </FormField>
            <div className="flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
              <div className="flex items-center gap-4 text-xs text-neutral-500">
                <div className="flex items-center gap-2">
                  <Toggle on={editing?._showPublished ?? true} onChange={(on) => setEditing((prev) => ({ ...prev, _showPublished: on }))} label="Toggle published" />
                  <span>Show on site</span>
                </div>
                <div className="flex items-center gap-2">
                  <Toggle on={editing?._showFeatured ?? false} onChange={(on) => setEditing((prev) => ({ ...prev, _showFeatured: on }))} label="Toggle featured" />
                  <span>Featured</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" disabled={busy} onClick={() => setEditing(null)} className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
                  Cancel
                </button>
                <button type="button" disabled={busy} onClick={handleSave} className="rounded-md bg-neutral-900 px-5 py-2 text-sm font-semibold text-neutral-100 hover:bg-neutral-800 disabled:opacity-60">
                  {busy ? 'Saving…' : 'Save review'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </AnimatePresence>
    </div>
  )
}

export default AdminReviews