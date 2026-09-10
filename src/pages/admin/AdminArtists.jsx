import { AnimatePresence } from 'framer-motion'
import { Pencil, Plus, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import ConfirmModal from '../../components/admin/ConfirmModal'
import FormField, { inputCls } from '../../components/admin/FormField'
import Toggle from '../../components/admin/Toggle'
import UploadDropzone from '../../components/admin/UploadDropzone'
import { useToast } from '../../components/admin/Toast'
import Modal from '../../components/common/Modal'
import { useAdminData } from '../../context/AdminDataContext'
import { cn } from '../../utils/cn'
import { uploadArtistPortrait } from '../../data/dataService'

const EMPTY = { name: '', role: '', specialties: '', experienceYears: '', shortBio: '', instagram: '' }

function AdminArtists() {
  const { artists, tattoos, addArtist, updateArtist, deleteArtist } = useAdminData()
  const { toast } = useToast()
  const [editing, setEditing] = useState(null) // null (hidden) | 'new' | artist object
  const [draft, setDraft] = useState(EMPTY)
  const [portrait, setPortrait] = useState(null) // {url, kind, file?}
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const worksFor = (id) => tattoos.filter((t) => t.artistId === id).length

  function openNew() {
    setDraft(EMPTY)
    setPortrait(null)
    setErrors({})
    setEditing('new')
  }

  function openEdit(artist) {
    setDraft({
      name: artist.name,
      role: artist.role,
      specialties: artist.specialties?.join(', ') || '',
      experienceYears: artist.experienceYears == null ? '' : String(artist.experienceYears),
      shortBio: artist.shortBio,
      instagram: artist.instagram || '',
    })
    setPortrait(artist.portrait ? { url: artist.portrait, kind: 'existing' } : null)
    setErrors({})
    setEditing({ ...artist, _showActive: artist.isActive !== false })
  }

  function set(key) {
    return (e) => setDraft((d) => ({ ...d, [key]: e.target.value }))
  }

  async function handleSave() {
    const e = {}
    if (!draft.name.trim()) e.name = 'Name is required'
    if (!draft.specialties.trim()) e.specialties = 'Add at least one specialty'
    setErrors(e)
    if (Object.keys(e).length) {
      toast('error', 'A couple of details are missing for this artist.')
      return
    }

    setBusy(true)
    const isNew = editing === 'new'
    const payload = {
      name: draft.name.trim(),
      role: draft.role.trim(),
      specialties: draft.specialties.split(',').map((s) => s.trim()).filter(Boolean),
      experienceYears: String(draft.experienceYears ?? '').trim() || null,
      shortBio: draft.shortBio.trim(),
      instagram: draft.instagram.trim() || '',
      isActive: editing?._showActive ?? true,
    }
    if (portrait?.kind === 'existing') payload.portrait = portrait.url
    else if (portrait?.kind === 'file') payload.newPortrait = portrait.file

    try {
      let saved = null
      if (isNew) {
        saved = await addArtist(payload)
      } else {
        saved = await updateArtist(editing.id, payload)
      }
      if (payload.newPortrait) {
        saved = await uploadArtistPortrait(saved.id, payload.newPortrait)
      }
      toast('success', isNew ? `${saved.name} was added to the studio.` : `Changes to ${saved.name} were saved.`)
      setEditing(null)
    } catch (err) {
      toast('error', err.message || 'We couldn’t save the artist. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function toggleActive(artist) {
    try {
      await updateArtist(artist.id, { isActive: artist.isActive !== false ? false : true })
      toast('success', artist.isActive !== false ? `${artist.name} is hidden from the public site.` : `${artist.name} is back on the public site.`)
    } catch (err) {
      toast('error', err.message || 'There was a problem updating this artist.')
    }
  }

  async function handleDelete() {
    if (!toDelete) return
    try {
      await deleteArtist(toDelete.id)
      toast('success', `${toDelete.name} was removed from the studio.`)
      setToDelete(null)
    } catch (err) {
      toast('error', err.message || 'We couldn’t remove that artist.')
      setToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-neutral-900">Artists</h1>
          <p className="mt-1 text-sm text-neutral-500">{artists.length} artists on the studio floor</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-neutral-100 transition-colors hover:bg-neutral-800"
        >
          <Plus size={15} /> Add artist
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {artists.map((a) => (
          <div key={a.id} className={cn('overflow-hidden rounded-lg border bg-white shadow-sm', a.isActive === false ? 'border-dashed border-neutral-300 opacity-70' : 'border-neutral-200')}>
            <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
              {a.portrait ? (
                <img src={a.portrait} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-300">
                  <Users size={28} />
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-extrabold tracking-tight text-neutral-900">{a.name}</h2>
                  <p className="text-sm text-neutral-500">{a.role}</p>
                </div>
                <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">
                  {worksFor(a.id)} works
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.specialties?.map((s) => (
                  <span key={s} className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs text-neutral-600">{s}</span>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between gap-2 border-t border-neutral-100 pt-4">
                <div className="flex gap-2">
                  <button type="button" onClick={() => openEdit(a)} className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50">
                    <Pencil size={12} /> Edit
                  </button>
                  {!worksFor(a.id) && (
                    <button type="button" onClick={() => setToDelete(a)} className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50">
                      <Trash2 size={12} /> Remove
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Toggle on={a.isActive !== false} onChange={() => toggleActive(a)} label={`Toggle visibility for ${a.name}`} />
                  <span className={cn('font-semibold', a.isActive === false ? 'text-neutral-400' : 'text-emerald-600')}>
                    {a.isActive === false ? 'Hidden' : 'Visible'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        <Modal
          open={editing !== null}
          onClose={() => !busy && setEditing(null)}
          title={editing === 'new' ? 'Add artist' : `Edit ${editing?.name}`}
          width="max-w-xl"
        >
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-[8rem_1fr]">
              <UploadDropzone
                value={portrait}
                onChange={setPortrait}
                label="Add a portrait"
                previewClass="aspect-square"
              />
              <div className="grid gap-4">
                <FormField label="Full name *" error={errors.name}>
                  <input className={cn(inputCls, errors.name && 'border-red-400')} value={draft.name} onChange={set('name')} />
                </FormField>
                <FormField label="Role">
                  <input className={inputCls} value={draft.role} onChange={set('role')} placeholder="Founder & lead artist" />
                </FormField>
              </div>
            </div>

            <FormField label="Specialties * (comma separated)" error={errors.specialties} hint="e.g. Blackwork, Dotwork, Neo-tribal">
              <input className={cn(inputCls, errors.specialties && 'border-red-400')} value={draft.specialties} onChange={set('specialties')} />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Experience (years)">
                <input className={inputCls} value={draft.experienceYears} onChange={set('experienceYears')} placeholder="10" />
              </FormField>
              <FormField label="Instagram handle">
                <input className={inputCls} value={draft.instagram} onChange={set('instagram')} placeholder="@handle" />
              </FormField>
            </div>

            <FormField label="Short bio">
              <textarea className={cn(inputCls, 'min-h-[90px] resize-y')} value={draft.shortBio} onChange={set('shortBio')} placeholder="A line clients see on the artist page." />
            </FormField>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" disabled={busy} onClick={() => setEditing(null)} className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
                Cancel
              </button>
              <button type="button" disabled={busy} onClick={handleSave} className="rounded-md bg-neutral-900 px-5 py-2 text-sm font-semibold text-neutral-100 hover:bg-neutral-800 disabled:opacity-60">
                {busy ? 'Saving…' : editing === 'new' ? 'Add artist' : 'Save changes'}
              </button>
            </div>
          </div>
        </Modal>
      </AnimatePresence>

      <ConfirmModal
        open={!!toDelete}
        title="Remove artist?"
        message={toDelete ? `${toDelete.name} will be removed from the studio. Only artists without tattoo pieces can be removed.` : ''}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default AdminArtists