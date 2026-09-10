import { ImagePlus, X } from 'lucide-react'
import { useRef } from 'react'
import { cn } from '../../utils/cn'

// Single-image picker with preview, used for portraits, category tiles, review
// photos and offer banners. `value` is { url, kind, name } where kind is
// 'file' or 'existing'.
function UploadDropzone({ value, onChange, label = 'Choose an image', previewClass = 'aspect-video' }) {
  const ref = useRef(null)

  function onPick(e) {
    const f = e.target.files?.[0]
    if (!f) return
    onChange({ url: URL.createObjectURL(f), kind: 'file', name: f.name, file: f })
    if (ref.current) ref.current.value = ''
  }

  return (
    <div>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onPick} />
      {value ? (
        <div className="space-y-2">
          <div className={cn('group relative overflow-hidden rounded-md bg-neutral-50 ring-1 ring-neutral-200', previewClass)}>
            <img src={value.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => ref.current?.click()}
              className="absolute inset-x-0 bottom-0 bg-neutral-900/70 py-1.5 text-[11px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              Replace image
            </button>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs text-neutral-500">{value.name || 'Current image'}</p>
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Remove image"
              className="rounded p-1 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-neutral-300 bg-neutral-50 text-neutral-400 transition-colors hover:border-neutral-400 hover:text-neutral-600',
            previewClass,
          )}
        >
          <ImagePlus size={20} />
          <span className="text-xs font-medium">{label}</span>
        </button>
      )}
    </div>
  )
}

export default UploadDropzone