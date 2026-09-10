import { AnimatePresence } from 'framer-motion'
import { CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import ConfirmModal from '../../components/admin/ConfirmModal'
import EmptyState from '../../components/admin/EmptyState'
import FormField, { inputCls } from '../../components/admin/FormField'
import Toggle from '../../components/admin/Toggle'
import UploadDropzone from '../../components/admin/UploadDropzone'
import { useToast } from '../../components/admin/Toast'
import Modal from '../../components/common/Modal'
import { useAdminData } from '../../context/AdminDataContext'
import { cn } from '../../utils/cn'
import { uploadWebsiteImage } from '../../data/dataService'

const EMPTY = { title: '', description: '', ctaLabel: 'Enquire now', ctaUrl: '/contact', startDate: '', endDate: '' }

function AdminOffers() {
  const { offers, addOffer, updateOffer, deleteOffer } = useAdminData()
  const { toast } = useToast()
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState(EMPTY)
  const [image, setImage] = useState(null)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const today = new Date().toISOString().slice(0, 10)

  function isActive(o) {
    if (!o.published) return false
    if (o.startDate && o.startDate > today) return false
    if (o.endDate && o.endDate < today) return false
    return true
  }

  function openNew() {
    setDraft(EMPTY)
    setImage(null)
    setErrors({})
    setEditing('new')
  }

  function openEdit(o) {
    setDraft({
      title: o.title,
      description: o.description || '',
      ctaLabel: o.ctaLabel || 'Enquire now',
      ctaUrl: o.ctaUrl || '/contact',
      startDate: o.startDate || '',
      endDate: o.endDate || '',
    })
    setImage(o.image ? { url: o.image, kind: 'existing' } : null)
    setErrors({})
    setEditing({ ...o, _showPublished: o.published !== false })
  }

  async function handleSave() {
    const e = {}
    if (!draft.title.trim()) e.title = 'Give the offer a title'
    setErrors(e)
    if (Object.keys(e).length) {
      toast('error', 'Give the offer a title.')
      return
    }
    setBusy(true)
    const payload = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      ctaLabel: draft.ctaLabel.trim() || 'Enquire now',
      ctaUrl: draft.ctaUrl.trim() || '/contact',
      startDate: draft.startDate || null,
      endDate: draft.endDate || null,
      published: editing?._showPublished ?? true,
      image: image?.kind === 'existing' ? image.url : null,
    }
    if (image?.kind === 'file') payload.newImage = image.file
    try {
      if (payload.newImage) {
        payload.image = await uploadWebsiteImage(payload.newImage)
        delete payload.newImage
      }
      if (editing === 'new') {
        await addOffer(payload)
        toast('success', 'Offer published.')
      } else {
        await updateOffer(editing.id, payload)
        toast('success', 'Offer saved.')
      }
      setEditing(null)
    } catch (err) {
      toast('error', err.message || 'We couldn’t save the offer.')
    } finally {
      setBusy(false)
    }
  }

  async function handleNewImage(value) {
    if (!value) {
      setImage(null)
      return
    }
    try {
      const url = await uploadWebsiteImage(value.file)
      setImage({ url, kind: 'existing' })
    } catch (err) {
      toast('error', err.message || 'We couldn’t upload that image.')
    }
  }

  async function togglePublish(o) {
    try {
      await updateOffer(o.id, { published: o.published === false })
      toast('success', o.published === false ? 'Offer is now live.' : 'Offer moved to drafts.')
    } catch (err) {
      toast('error', err.message || 'We couldn’t update the offer.')
    }
  }

  async function handleDelete() {
    if (!toDelete) return
    try {
      await deleteOffer(toDelete.id)
      toast('success', 'Offer deleted.')
      setToDelete(null)
    } catch (err) {
      toast('error', err.message || 'We couldn’t delete the offer.')
      setToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-neutral-900">Offers</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Discounts and promos. Only live offers with valid dates show on the public site.
          </p>
        </div>
        <button type="button" onClick={openNew} className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-neutral-100 transition-colors hover:bg-neutral-800">
          <Plus size={15} /> Add offer
        </button>
      </div>

      {offers.length === 0 ? (
        <EmptyState
          title="No offers yet"
          message="Create an offer and it will appear on the homepage when its dates are active."
          action={
            <button type="button" onClick={openNew} className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-neutral-100 transition-colors hover:bg-neutral-800">
              Create your first offer
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {offers.map((o) => {
            const active = isActive(o)
            return (
              <article key={o.id} className={cn('rounded-lg border bg-white p-5 shadow-sm', !active && 'border-neutral-200 opacity-70')}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    {o.image && (
                      <img src={o.image} alt="" className="h-14 w-20 rounded-md object-cover ring-1 ring-neutral-100" />
                    )}
                    <div>
                      <p className="font-semibold text-neutral-900">{o.title}</p>
                      <p className="flex items-center gap-1.5 text-xs text-neutral-400">
                        <CalendarDays size={11} />
                        {o.startDate || 'Immediately'} → {o.endDate || 'No end date'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={cn('rounded-full px-2.5 py-1 font-semibold', active ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500')}>
                      {active ? 'Live' : o.published === false ? 'Draft' : 'Expired / upcoming'}
                    </span>
                  </div>
                </div>
                {o.description && <p className="mt-3 text-sm leading-relaxed text-neutral-600">{o.description}</p>}
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
                  <div className="flex items-center gap-2">
                    <Toggle on={o.published !== false} onChange={() => togglePublish(o)} label={`Toggle published for ${o.title}`} />
                    <span className="text-xs text-neutral-500">{o.published === false ? 'Hidden' : 'Published'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => openEdit(o)} aria-label="Edit offer" className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900">
                      <Pencil size={15} />
                    </button>
                    <button type="button" onClick={() => setToDelete(o)} aria-label="Delete offer" className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="Delete offer?"
        message={toDelete ? `"${toDelete.title}" will be removed from the site.` : ''}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
      />

      <AnimatePresence>
        <Modal open={editing !== null} onClose={() => !busy && setEditing(null)} title={editing === 'new' ? 'Add an offer' : `Edit ${editing?.title}`} width="max-w-xl">
          <div className="space-y-5">
            <FormField label="Title *" error={errors.title}>
              <input className={cn(inputCls, errors.title && 'border-red-400')} value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="e.g. 20% off cover-ups this month" />
            </FormField>
            <FormField label="Description">
              <textarea className={cn(inputCls, 'min-h-[90px] resize-y')} value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Button label">
                <input className={inputCls} value={draft.ctaLabel} onChange={(e) => setDraft((d) => ({ ...d, ctaLabel: e.target.value }))} placeholder="Enquire now" />
              </FormField>
              <FormField label="Button link">
                <input className={inputCls} value={draft.ctaUrl} onChange={(e) => setDraft((d) => ({ ...d, ctaUrl: e.target.value }))} placeholder="/contact" />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Starts on">
                <input type="date" className={inputCls} value={draft.startDate} onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))} />
              </FormField>
              <FormField label="Ends on">
                <input type="date" className={inputCls} value={draft.endDate} onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))} />
              </FormField>
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-neutral-700">Banner image</span>
              <UploadDropzone value={image} onChange={handleNewImage} label="Choose an image" previewClass="aspect-video max-w-xs" />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <Toggle on={editing?._showPublished ?? true} onChange={(on) => setEditing((prev) => ({ ...prev, _showPublished: on }))} label="Toggle published" />
                <span>Publish to the site</span>
              </div>
              <div className="flex gap-2">
                <button type="button" disabled={busy} onClick={() => setEditing(null)} className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
                  Cancel
                </button>
                <button type="button" disabled={busy} onClick={handleSave} className="rounded-md bg-neutral-900 px-5 py-2 text-sm font-semibold text-neutral-100 hover:bg-neutral-800 disabled:opacity-60">
                  {busy ? 'Saving…' : 'Save offer'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </AnimatePresence>
    </div>
  )
}

export default AdminOffers