import { AnimatePresence } from 'framer-motion'
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react'
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

const EMPTY = { label: '', description: '' }

function AdminCategories() {
  const { categories, tattoos, addCategory, updateCategory, deleteCategory, moveCategory } = useAdminData()
  const { toast } = useToast()
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState(EMPTY)
  const [image, setImage] = useState(null)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const usage = (id) => tattoos.filter((t) => t.category === id).length

  function openNew() {
    setDraft(EMPTY)
    setImage(null)
    setErrors({})
    setEditing('new')
  }

  function openEdit(c) {
    setDraft({ label: c.label, description: c.description || '' })
    setImage(c.image ? { url: c.image, kind: 'existing' } : null)
    setErrors({})
    setEditing({ ...c, _showActive: c.isActive !== false })
  }

  async function handleSave() {
    const e = {}
    if (!draft.label.trim()) e.label = 'Name is required'
    setErrors(e)
    if (Object.keys(e).length) {
      toast('error', 'Give the style a name.')
      return
    }
    setBusy(true)
    const payload = {
      label: draft.label.trim(),
      description: draft.description.trim(),
      isActive: editing?._showActive ?? true,
      image: image?.kind === 'existing' ? image.url : null,
    }
    if (image?.kind === 'file') payload.newImage = image.file
    try {
      if (payload.newImage) {
        payload.image = await uploadWebsiteImage(payload.newImage)
        delete payload.newImage
      }
      if (editing === 'new') {
        await addCategory(payload)
        toast('success', 'Style added to the gallery filter.')
      } else {
        await updateCategory(editing.id, payload)
        toast('success', 'Style updated.')
      }
      setEditing(null)
    } catch (err) {
      toast('error', err.message || 'We couldn’t save that style.')
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

  async function handleReorder(id, dir) {
    try {
      await moveCategory(id, dir)
      toast('success', 'Order updated.')
    } catch (err) {
      toast('error', err.message || 'We couldn’t reorder the styles.')
    }
  }

  async function handleDelete() {
    if (!toDelete) return
    try {
      await deleteCategory(toDelete.id)
      toast('success', `${toDelete.label} was removed.`)
      setToDelete(null)
    } catch (err) {
      toast('error', err.message || 'We couldn’t delete that style.')
      setToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-neutral-900">Tattoo styles</h1>
          <p className="mt-1 text-sm text-neutral-500">
            These are the categories clients filter the gallery by. Drag-free ordering: use the up and down arrows.
          </p>
        </div>
        <button type="button" onClick={openNew} className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-neutral-100 transition-colors hover:bg-neutral-800">
          <Plus size={15} /> Add style
        </button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          title="No styles yet"
          message="Add the styles your artists specialise in — they become the gallery filters."
          action={
            <button type="button" onClick={openNew} className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-neutral-100 transition-colors hover:bg-neutral-800">
              Add your first style
            </button>
          }
        />
      ) : (
        <div className="divide-y divide-neutral-100 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          {categories.map((c, i) => (
            <div
              key={c.id}
              className={cn('flex flex-wrap items-center gap-4 px-5 py-4', c.isActive === false && 'opacity-60')}
            >
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => handleReorder(c.id, -1)}
                  disabled={i === 0}
                  aria-label={`Move ${c.label} up`}
                  className="rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30"
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(c.id, 1)}
                  disabled={i === categories.length - 1}
                  aria-label={`Move ${c.label} down`}
                  className="rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30"
                >
                  <ArrowDown size={13} />
                </button>
              </div>
              <div className="h-10 w-10 overflow-hidden rounded-md bg-neutral-50 ring-1 ring-neutral-200">
                {c.image ? (
                  <img src={c.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-display text-sm font-bold text-neutral-300">
                    {c.label.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-neutral-900">{c.label}</p>
                <p className="truncate text-xs text-neutral-500">
                  {c.description || 'No description'} · {usage(c.id)} pieces
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Toggle on={c.isActive !== false} onChange={() => updateCategory(c.id, { isActive: c.isActive === false })} label={`Toggle visibility for ${c.label}`} />
                <span className={cn('text-xs font-semibold', c.isActive === false ? 'text-neutral-400' : 'text-emerald-600')}>
                  {c.isActive === false ? 'Hidden' : 'Visible'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => openEdit(c)} aria-label={`Edit ${c.label}`} className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900">
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setToDelete(c)}
                  aria-label={`Delete ${c.label}`}
                  disabled={usage(c.id) > 0}
                  className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        <Modal open={editing !== null} onClose={() => !busy && setEditing(null)} title={editing === 'new' ? 'Add a style' : `Edit ${editing?.label}`} width="max-w-lg">
          <div className="space-y-5">
            <FormField label="Name *" error={errors.label}>
              <input className={cn(inputCls, errors.label && 'border-red-400')} value={draft.label} onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))} placeholder="e.g. Fine line" />
            </FormField>
            <FormField label="Description" hint="One line clients see when browsing the style.">
              <textarea className={cn(inputCls, 'min-h-[80px] resize-y')} value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
            </FormField>
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-neutral-700">Tile image</span>
              <UploadDropzone value={image} onChange={handleNewImage} label="Choose an image" previewClass="aspect-video max-w-xs" />
            </div>
            <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
              <div className="flex items-center gap-3 text-xs text-neutral-500">
                <Toggle on={editing?._showActive ?? true} onChange={(on) => setEditing((prev) => ({ ...prev, _showActive: on }))} label="Toggle visibility" />
                <span>Visible to clients</span>
              </div>
              <div className="flex gap-2">
                <button type="button" disabled={busy} onClick={() => setEditing(null)} className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
                  Cancel
                </button>
                <button type="button" disabled={busy} onClick={handleSave} className="rounded-md bg-neutral-900 px-5 py-2 text-sm font-semibold text-neutral-100 hover:bg-neutral-800 disabled:opacity-60">
                  {busy ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </AnimatePresence>

      <ConfirmModal
        open={!!toDelete}
        title="Delete style?"
        message={toDelete ? `${toDelete.label} will be removed from the gallery filter.` : ''}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default AdminCategories