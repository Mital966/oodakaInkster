import { AnimatePresence } from 'framer-motion'
import { Pencil, Plus, Trash2, Users } from 'lucide-react'
import { useRef, useState } from 'react'
import ConfirmModal from '../../components/admin/ConfirmModal'
import FormField, { inputCls } from '../../components/admin/FormField'
import Modal from '../../components/common/Modal'
import { useAdminData } from '../../context/AdminDataContext'
import { cn } from '../../utils/cn'

const EMPTY = { name: '', role: '', specialties: '', experienceYears: '', shortBio: '' }

function AdminArtists() {
  const { artists, tattoos, addArtist, updateArtist, deleteArtist } = useAdminData()
  const [editing, setEditing] = useState(null) // null (hidden) | 'new' | artist object
  const [draft, setDraft] = useState(EMPTY)
  const [portrait, setPortrait] = useState(null) // {url, kind}
  const [errors, setErrors] = useState({})
  const [toDelete, setToDelete] = useState(null)
  const portraitRef = useRef(null)

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
      specialties: artist.specialties.join(', '),
      experienceYears: artist.experienceYears,
      shortBio: artist.shortBio,
    })
    setPortrait(artist.portrait ? { url: artist.portrait, kind: 'existing' } : null)
    setErrors({})
    setEditing(artist)
  }

  function set(key) {
    return (e) => setDraft((d) => ({ ...d, [key]: e.target.value }))
  }

  function onPickPortrait(e) {
    const f = e.target.files?.[0]
    if (f) setPortrait({ url: URL.createObjectURL(f), kind: 'file', name: f.name })
    if (portraitRef) portraitRef.value = ''
  }

  async function handleSave() {
    const e = {}
    if (!draft.name.trim()) e.name = 'Name is required'
    if (!draft.specialties.trim()) e.specialties = 'Add at least one specialty'
    setErrors(e)
    if (Object.keys(e).length) return

    const payload = {
      name: draft.name.trim(),
      role: draft.role.trim(),
      specialties: draft.specialties.split(',').map((s) => s.trim()).filter(Boolean),
      experienceYears: draft.experienceYears.trim(),
      shortBio: draft.shortBio.trim(),
      portrait: portrait?.url ?? null,
    }
    if (editing === 'new') addArtist(payload)
    else updateArtist(editing.id, payload)
    setEditing(null)
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
          <div key={a.id} className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
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
                {a.specialties.map((s) => (
                  <span key={s} className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs text-neutral-600">{s}</span>
                ))}
              </div>
              <div className="mt-5 flex gap-2 border-t border-neutral-100 pt-4">
                <button type="button" onClick={() => openEdit(a)} className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50">
                  <Pencil size={12} /> Edit
                </button>
                {!worksFor(a.id) && (
                  <button type="button" onClick={() => setToDelete(a)} className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50">
                    <Trash2 size={12} /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        <Modal
          open={editing !== null}
          onClose={() => setEditing(null)}
          title={editing === 'new' ? 'Add artist' : `Edit ${editing?.name}`}
          width="max-w-xl"
        >
          <div className="space-y-5">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => portraitRef?.click()}
                className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md bg-neutral-100 text-neutral-400 ring-1 ring-neutral-200 hover:ring-neutral-400"
              >
                {portrait ? (
                  <>
                    <img src={portrait.url} alt="" className="h-full w-full object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center bg-neutral-900/50 text-[10px] font-semibold text-white opacity-0 transition-opacity hover:opacity-100">
                      Change
                    </span>
                  </>
                ) : (
                  <Plus size={18} />
                )}
              </button>
              <div className="grid flex-1 gap-4">
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

            <FormField label="Experience (years)">
              <input className={inputCls} value={draft.experienceYears} onChange={set('experienceYears')} placeholder="10" />
            </FormField>

            <FormField label="Short bio">
              <textarea className={cn(inputCls, 'min-h-[90px] resize-y')} value={draft.shortBio} onChange={set('shortBio')} placeholder="A line clients see on the artist page." />
            </FormField>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
                Cancel
              </button>
              <button type="button" onClick={handleSave} className="rounded-md bg-neutral-900 px-5 py-2 text-sm font-semibold text-neutral-100 hover:bg-neutral-800">
                {editing === 'new' ? 'Add artist' : 'Save changes'}
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
        onConfirm={() => {
          deleteArtist(toDelete.id)
          setToDelete(null)
        }}
      />
    </div>
  )
}

export default AdminArtists