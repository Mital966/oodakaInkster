import { Check, ChevronLeft, ImagePlus, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import FormField, { inputCls } from '../../components/admin/FormField'
import { useAdminData } from '../../context/AdminDataContext'
import { getCategories } from '../../data/dataService'
import { useDataQuery } from '../../hooks/useDataQuery'
import { cn } from '../../utils/cn'

const EMPTY = {
  title: '',
  artistId: '',
  style: '',
  category: '',
  placement: '',
  description: '',
}

function AdminTattooForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const { tattoos, artists, addTattoo, updateTattoo } = useAdminData()

  const existing = useMemo(() => (isEdit ? tattoos.find((t) => t.id === id) : null), [isEdit, id, tattoos])
  const [fields, setFields] = useState(() => ({
    ...EMPTY,
    ...(existing
      ? {
          title: existing.title,
          artistId: existing.artistId,
          style: existing.style,
          category: existing.category,
          placement: existing.placement,
          description: existing.description,
        }
      : {}),
  }))
  const [published, setPublished] = useState(existing ? existing.published : true)
  const [featured, setFeatured] = useState(existing ? existing.featured : false)
  const [photos, setPhotos] = useState(() =>
    existing?.photos?.map((url) => ({ url, kind: 'existing' })) ?? [],
  )
  const [video, setVideo] = useState(() =>
    existing?.video ? { url: existing.video, poster: existing.videoPoster, kind: 'existing' } : null,
  )
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const photoRef = useRef(null)
  const videoRef = useRef(null)

  const { data: categories } = useDataQuery(getCategories, [])

  const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }))

  function onPickPhotos(e) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setPhotos((prev) => [
      ...prev,
      ...files.map((file) => ({ url: URL.createObjectURL(file), kind: 'file', name: file.name })),
    ])
  }

  function onPickVideo(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setVideo({ url: URL.createObjectURL(file), kind: 'file', name: file.name })
  }

  function removePhoto(i) {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i))
  }

  function validate() {
    const e = {}
    if (!fields.title.trim()) e.title = 'Title is required'
    if (!fields.artistId) e.artistId = 'Choose an artist'
    if (!fields.style.trim()) e.style = 'Style is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const payload = {
      ...fields,
      title: fields.title.trim(),
      style: fields.style.trim(),
      category: fields.category || 'custom',
      placement: fields.placement.trim() || null,
      description: fields.description.trim(),
      published,
      featured,
      photos: photos.map((p) => p.url),
      cover: photos[0]?.url,
      video: video?.url || null,
      videoPoster: video?.poster || null,
    }
    if (isEdit) {
      await updateTattoo(id, payload)
      navigate('/admin/tattoos')
    } else {
      const created = await addTattoo(payload)
      navigate(`/admin/tattoos/${created.id}/edit`)
    }
    setSaving(false)
  }

  const pubToggler = ({ on, setter, label }) => (
    <button
      type="button"
      onClick={() => setter(!on)}
      className={cn(
        'relative h-5 transition-colors',
        on ? 'w-9 bg-emerald-500' : 'w-9 bg-neutral-300',
      )}
      aria-pressed={on}
      aria-label={label}
    >
      <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', on ? 'left-[18px]' : 'left-0.5')} />
    </button>
  )

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to="/admin/tattoos" className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900">
          <ChevronLeft size={14} /> Back to tattoos
        </Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-neutral-900">
          {isEdit ? `Edit "${existing?.title}"` : 'Add a new tattoo'}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {isEdit ? 'Update the piece and save changes.' : 'Upload a piece and it joins the studio library.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-sm font-bold text-neutral-900">Piece details</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <FormField label="Title *" error={errors.title} className="sm:col-span-2">
              <input className={cn(inputCls, errors.title && 'border-red-400')} value={fields.title} onChange={set('title')} placeholder="e.g. Tiger Sleeve" />
            </FormField>
            <FormField label="Artist *" error={errors.artistId}>
              <select className={cn(inputCls, 'cursor-pointer', errors.artistId && 'border-red-400')} value={fields.artistId} onChange={set('artistId')}>
                <option value="">Select artist…</option>
                {artists.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Style *" error={errors.style}>
              <input className={cn(inputCls, errors.style && 'border-red-400')} value={fields.style} onChange={set('style')} placeholder="e.g. Neotraditional" />
            </FormField>
            <FormField label="Category">
              <select className={cn(inputCls, 'cursor-pointer')} value={fields.category} onChange={set('category')}>
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Placement">
              <input className={inputCls} value={fields.placement} onChange={set('placement')} placeholder="e.g. Upper arm" />
            </FormField>
            <FormField label="Description" className="sm:col-span-2">
              <textarea className={cn(inputCls, 'min-h-[110px] resize-y')} value={fields.description} onChange={set('description')} placeholder="A line or two about the piece for the gallery page." />
            </FormField>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-sm font-bold text-neutral-900">Studio photos</h2>
          <p className="mt-1 text-xs text-neutral-400">Upload up to a few shots of the piece. The first one becomes the cover.</p>
          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {photos.map((p, i) => (
              <div key={`${p.url}-${i}`} className="group relative aspect-square overflow-hidden rounded-md bg-neutral-50 ring-1 ring-neutral-200">
                <img src={p.url} alt="" className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 rounded bg-neutral-900/80 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  aria-label="Remove photo"
                  className="absolute right-1 top-1 rounded-full bg-neutral-900/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-md border border-dashed border-neutral-300 text-neutral-400 transition-colors hover:border-neutral-400 hover:text-neutral-600"
              aria-label="Add photo"
            >
              <ImagePlus size={18} />
            </button>
            <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" onChange={onPickPhotos} />
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm font-bold text-neutral-900">Healing video</h2>
              <p className="mt-1 text-xs text-neutral-400">Shot during or right after the session.</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                {pubToggler({ on: published, setter: setPublished, label: 'Toggle published' })}
                <span className={cn('font-semibold', published ? 'text-emerald-600' : 'text-neutral-500')}>{published ? 'Published' : 'Draft'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                {pubToggler({ on: featured, setter: setFeatured, label: 'Toggle featured' })}
                <span className={cn('font-semibold', featured ? 'text-amber-500' : 'text-neutral-500')}>{featured ? 'Featured' : 'Not featured'}</span>
              </div>
            </div>
          </div>

          <div className="mt-5">
            {video ? (
              <div className="flex items-center gap-4 rounded-md border border-neutral-200 p-3">
                <video src={video.url} className="h-16 w-24 rounded-md bg-neutral-900 object-contain" muted playsInline />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-800">{video.name || 'Existing video'}</p>
                  <p className="text-xs text-neutral-400">✓ Ready for save</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => videoRef.current?.click()} className="rounded-md px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50">
                    Replace
                  </button>
                  <button type="button" onClick={() => setVideo(null)} className="rounded-md p-1.5 text-neutral-400 hover:text-red-600">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-neutral-300 px-4 py-6 text-sm text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700"
              >
                <ImagePlus size={16} /> Add a video
              </button>
            )}
            <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={onPickVideo} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link to="/admin/tattoos" className="rounded-md border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-neutral-100 transition-colors hover:bg-neutral-800 disabled:opacity-60">
            {saving ? 'Saving…' : 'Save piece'} <Check size={15} />
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminTattooForm