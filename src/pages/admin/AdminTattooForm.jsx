import { Check, ChevronLeft, ChevronsLeft, ChevronsRight, ImagePlus, Play, Star, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import FormField, { inputCls } from '../../components/admin/FormField'
import Toggle from '../../components/admin/Toggle'
import { useToast } from '../../components/admin/Toast'
import { useAdminData } from '../../context/AdminDataContext'
import { cn } from '../../utils/cn'

const EMPTY = {
  title: '',
  artistId: '',
  style: '',
  category: '',
  placement: '',
  size: '',
  price: '',
  sessions: '',
  duration: '',
  year: '',
  description: '',
  designNotes: '',
}

let keySeq = 0
const nextKey = (prefix) => `${prefix}-${++keySeq}-${Date.now().toString(36)}`

function AdminTattooForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const { tattoos, artists, categories, addTattoo, updateTattoo, saveTattooMedia } = useAdminData()
  const { toast } = useToast()

  const existing = useMemo(() => (isEdit ? tattoos.find((t) => t.id === id) : null), [isEdit, id, tattoos])

  const [fields, setFields] = useState(() => ({
    ...EMPTY,
    ...(existing
      ? {
          title: existing.title || '',
          artistId: existing.artistId || '',
          style: existing.style || '',
          category: existing.category || '',
          placement: existing.placement || '',
          size: existing.size || '',
          price: existing.price ?? '',
          sessions: existing.sessions ?? '',
          duration: existing.duration || '',
          year: existing.year ?? '',
          description: existing.description || '',
          designNotes: existing.designNotes || '',
        }
      : {}),
  }))
  const [published, setPublished] = useState(existing ? existing.published : true)
  const [featured, setFeatured] = useState(existing ? existing.featured : false)
  const [photos, setPhotos] = useState(() =>
    existing ? (existing.photos?.length ? existing.photos.map((url) => ({ key: nextKey('u'), kind: 'url', url })) : existing.cover ? [{ key: nextKey('u'), kind: 'url', url: existing.cover }] : []) : [],
  )
  const [coverIndex, setCoverIndex] = useState(0)
  const [videos, setVideos] = useState(() => {
    if (!existing?.video) return []
    return [{ key: nextKey('v'), kind: 'url', videoUrl: existing.video, name: 'Existing video', poster: existing.videoPoster || null }]
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const photoInputRef = useRef(null)
  const videoInputRef = useRef(null)

  const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }))

  function onPickPhotos(e) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setPhotos((prev) => [
      ...prev,
      ...files.map((file) => ({ key: nextKey('n'), kind: 'file', url: URL.createObjectURL(file), name: file.name, file })),
    ])
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  function onPickVideos(e) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setVideos((prev) => [
      ...prev,
      ...files.map((file) => ({ key: nextKey('n'), kind: 'file', url: URL.createObjectURL(file), name: file.name, file })),
    ])
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  function removePhoto(key) {
    setPhotos((prev) => {
      const next = prev.filter((p) => p.key !== key)
      if (coverIndex >= next.length) setCoverIndex(Math.max(0, next.length - 1))
      return next
    })
  }

  function movePhoto(key, dir) {
    setPhotos((prev) => {
      const idx = prev.findIndex((p) => p.key === key)
      const swap = idx + dir
      if (idx < 0 || swap < 0 || swap >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      if (coverIndex === idx) setCoverIndex(swap)
      else if (coverIndex === swap) setCoverIndex(idx)
      return next
    })
  }

  function removeVideo(key) {
    setVideos((prev) => prev.filter((v) => v.key !== key))
  }

  function validate() {
    const e = {}
    if (!fields.title.trim()) e.title = 'Give the piece a title'
    if (!fields.artistId) e.artistId = 'Choose the artist who made it'
    if (!fields.style.trim()) e.style = 'Add the tattoo style'
    if (photos.length === 0) e.photos = 'Add at least one photo'
    setErrors(e)
    if (Object.keys(e).length) {
      toast('error', 'A few details are still missing — check the highlighted fields.')
      return false
    }
    return true
  }

  function buildPlan() {
    const plan = {
      images: photos.map((p) => (p.kind === 'file' ? { kind: 'file', file: p.file } : { kind: 'url', url: p.url })),
      coverImageIndex: coverIndex,
      videos: videos.map((v) =>
        v.kind === 'file'
          ? { kind: 'file', file: v.file }
          : { kind: 'url', videoUrl: v.videoUrl, thumbnailUrl: v.poster || null },
      ),
      removedImageUrls: [],
      removedVideoUrls: [],
      videoPoster: photos[coverIndex]?.url || null,
    }
    return plan
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const payload = {
      ...fields,
      title: fields.title.trim(),
      style: fields.style.trim(),
      placement: fields.placement.trim() || '',
      size: fields.size.trim() || '',
      duration: fields.duration.trim() || '',
      description: fields.description.trim(),
      designNotes: fields.designNotes.trim(),
      price: fields.price === '' ? null : Number(fields.price),
      sessions: fields.sessions === '' ? null : Number(fields.sessions),
      year: fields.year === '' ? null : Number(fields.year),
      published,
      featured,
    }
    try {
      if (isEdit) {
        await updateTattoo(id, payload)
        await saveTattooMedia(id, buildPlan())
        toast('success', 'Tattoo saved and published to the site.')
        navigate('/admin/tattoos')
      } else {
        const created = await addTattoo(payload)
        await saveTattooMedia(created.id, buildPlan())
        toast('success', `${created.title} is now part of the studio library.`)
        navigate(`/admin/tattoos/${created.id}/edit`)
      }
    } catch (err) {
      toast('error', err.message || 'We couldn’t save the tattoo. Please try again.')
      setSaving(false)
    }
  }

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

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm font-bold text-neutral-900">Piece details</h2>
              <p className="mt-0.5 text-xs text-neutral-400">The basics clients will see on the gallery page.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <Toggle on={published} onChange={setPublished} label="Toggle published" />
                <span className={cn('font-semibold', published ? 'text-emerald-600' : 'text-neutral-500')}>
                  {published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <Toggle on={featured} onChange={setFeatured} label="Toggle featured" />
                <span className={cn('font-semibold', featured ? 'text-amber-500' : 'text-neutral-500')}>
                  {featured ? 'Featured' : 'Homepage'}
                </span>
              </div>
            </div>
          </div>

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
                <option value="">Not categorised</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Placement">
              <input className={inputCls} value={fields.placement} onChange={set('placement')} placeholder="e.g. Upper arm" />
            </FormField>
            <FormField label="Size">
              <input className={inputCls} value={fields.size} onChange={set('size')} placeholder="e.g. 20cm" />
            </FormField>
            <FormField label="Price (₹)">
              <input type="number" min="0" className={inputCls} value={fields.price} onChange={set('price')} placeholder="e.g. 35000" />
            </FormField>
            <FormField label="Sessions">
              <input type="number" min="0" className={inputCls} value={fields.sessions} onChange={set('sessions')} placeholder="e.g. 2" />
            </FormField>
            <FormField label="Approx. duration">
              <input className={inputCls} value={fields.duration} onChange={set('duration')} placeholder="e.g. 5 hours" />
            </FormField>
            <FormField label="Year">
              <input type="number" min="2000" max="2100" className={inputCls} value={fields.year} onChange={set('year')} placeholder="e.g. 2025" />
            </FormField>
            <FormField label="Description" className="sm:col-span-2">
              <textarea className={cn(inputCls, 'min-h-[90px] resize-y')} value={fields.description} onChange={set('description')} placeholder="A line or two about the piece for the gallery page." />
            </FormField>
            <FormField label="Design notes" hint="Internal notes shown only in this admin." className="sm:col-span-2">
              <textarea className={cn(inputCls, 'min-h-[70px] resize-y')} value={fields.designNotes} onChange={set('designNotes')} placeholder="Anything worth remembering about this piece." />
            </FormField>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm font-bold text-neutral-900">Studio photos</h2>
              <p className="mt-0.5 text-xs text-neutral-400">
                Add a few shots. Tap the corner of a photo to set it as the cover — the cover shows on the gallery and homepage.
              </p>
            </div>
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <ImagePlus size={13} /> Add photos
            </button>
            <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={onPickPhotos} />
          </div>
          {errors.photos && <p className="mt-2 text-xs text-red-600">{errors.photos}</p>}
          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {photos.map((p, i) => (
              <div key={p.key} className={cn('group relative aspect-square overflow-hidden rounded-md bg-neutral-50 ring-1 ring-neutral-200', i === coverIndex && 'ring-2 ring-neutral-900')}>
                <img src={p.url} alt="" className="h-full w-full object-cover" />
                {i === coverIndex && (
                  <span className="absolute bottom-1 left-1 rounded bg-neutral-900 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
                    Cover
                  </span>
                )}
                <span className="absolute left-1 top-1 flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => movePhoto(p.key, -1)}
                    disabled={i === 0}
                    aria-label="Move photo left"
                    className="rounded bg-neutral-900/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-0"
                  >
                    <ChevronsLeft size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => movePhoto(p.key, 1)}
                    disabled={i === photos.length - 1}
                    aria-label="Move photo right"
                    className="rounded bg-neutral-900/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-0"
                  >
                    <ChevronsRight size={11} />
                  </button>
                </span>
                <button
                  type="button"
                  onClick={() => removePhoto(p.key)}
                  aria-label="Remove photo"
                  className="absolute right-1 top-1 rounded-full bg-neutral-900/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X size={11} />
                </button>
                <button
                  type="button"
                  onClick={() => setCoverIndex(i)}
                  aria-label={`Set as cover`}
                  className={cn(
                    'absolute bottom-1 right-1 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100',
                    i === coverIndex ? 'text-white' : 'bg-neutral-900/60 text-white',
                  )}
                >
                  <Star size={11} className={i === coverIndex ? 'fill-amber-400 text-amber-400' : ''} />
                </button>
              </div>
            ))}
          </div>
          {photos.length === 0 && (
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-neutral-300 px-4 py-8 text-sm text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700"
            >
              <ImagePlus size={16} /> Choose the first photos
            </button>
          )}
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm font-bold text-neutral-900">Videos</h2>
              <p className="mt-0.5 text-xs text-neutral-400">Session clips or healed videos. The poster uses your tattoo cover.</p>
            </div>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <Play size={12} /> Add video
            </button>
            <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" multiple className="hidden" onChange={onPickVideos} />
          </div>

          <div className="mt-5 space-y-3">
            {videos.map((v) => (
              <div key={v.key} className="flex items-center gap-4 rounded-md border border-neutral-200 p-3">
                <video src={v.url} className="h-16 w-24 rounded-md bg-neutral-900 object-contain" muted playsInline />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-800">{v.name || 'Existing video'}</p>
                  <p className="text-xs text-neutral-400">{v.kind === 'file' ? 'New — uploads on save' : 'Saved on the studio'}</p>
                </div>
                <button type="button" onClick={() => removeVideo(v.key)} aria-label="Remove video" className="rounded p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600">
                  <X size={14} />
                </button>
              </div>
            ))}
            {videos.length === 0 && (
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-neutral-300 px-4 py-6 text-sm text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700"
              >
                <Play size={15} /> Add a healing video (optional)
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link to="/admin/tattoos" className="rounded-md border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-neutral-100 transition-colors hover:bg-neutral-800 disabled:opacity-60">
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add piece'} <Check size={15} />
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminTattooForm