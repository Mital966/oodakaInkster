import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ConfirmModal from '../../components/admin/ConfirmModal'
import { inputCls } from '../../components/admin/FormField'
import { useAdminData } from '../../context/AdminDataContext'
import { cn } from '../../utils/cn'

function AdminTattoos() {
  const { tattoos, artists, artistName, togglePublish, toggleFeatured, deleteTattoo } = useAdminData()
  const [query, setQuery] = useState('')
  const [toDelete, setToDelete] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tattoos
    return tattoos.filter(
      (t) => t.title.toLowerCase().includes(q) || artistName(t.artistId)?.toLowerCase().includes(q) || t.style.toLowerCase().includes(q),
    )
  }, [tattoos, query, artistName])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-neutral-900">Tattoos</h1>
          <p className="mt-1 text-sm text-neutral-500">{tattoos.length} pieces in the studio library</p>
        </div>
        <Link
          to="/admin/tattoos/new"
          className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-neutral-100 transition-colors hover:bg-neutral-800"
        >
          <Plus size={15} /> Add tattoo
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, artist or style…"
          className={cn(inputCls, 'pl-9')}
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-[11px] uppercase tracking-wider text-neutral-400">
                <th className="px-5 py-3 font-semibold">Piece</th>
                <th className="px-5 py-3 font-semibold">Artist</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">Style</th>
                <th className="px-5 py-3 text-center font-semibold">Published</th>
                <th className="px-5 py-3 text-center font-semibold">Featured</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-neutral-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={t.cover || t.photos?.[0]} alt="" className="h-11 w-11 rounded-md object-cover ring-1 ring-neutral-100" />
                      <div className="min-w-0">
                        <Link to={`/gallery/${t.id}`} className="block truncate font-medium text-neutral-900 hover:text-neutral-600">
                          {t.title}
                        </Link>
                        <span className="block text-xs text-neutral-400">{t.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-neutral-600">{artistName(t.artistId)}</td>
                  <td className="hidden px-5 py-3 text-neutral-600 sm:table-cell">{t.style}</td>
                  <td className="px-5 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => togglePublish(t.id)}
                      aria-label={`Toggle published for ${t.title}`}
                      className={cn(
                        'relative h-5 rounded-full transition-colors',
                        t.published ? 'w-9 bg-emerald-500' : 'w-9 bg-neutral-300',
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
                          t.published ? 'left-[18px]' : 'left-0.5',
                        )}
                      />
                    </button>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggleFeatured(t.id)}
                      aria-label={`Toggle featured for ${t.title}`}
                      className={cn(
                        'rounded-md p-1.5 transition-colors',
                        t.featured ? 'text-amber-500 hover:bg-amber-50' : 'text-neutral-300 hover:bg-neutral-100 hover:text-neutral-500',
                      )}
                    >
                      <Star size={16} className={t.featured ? 'fill-amber-400' : ''} />
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/admin/tattoos/${t.id}/edit`}
                        aria-label={`Edit ${t.title}`}
                        className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                      >
                        <Pencil size={15} />
                      </Link>
                      <a
                        href={`/gallery/${t.id}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`View ${t.title} on public site`}
                        className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                      >
                        <ExternalLink size={15} />
                      </a>
                      <button
                        type="button"
                        onClick={() => setToDelete(t)}
                        aria-label={`Delete ${t.title}`}
                        className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-neutral-400">
                    No tattoos match "{query}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        open={!!toDelete}
        title="Delete tattoo?"
        message={toDelete ? `"${toDelete.title}" will be removed from the admin library. This can't be undone.` : ''}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          deleteTattoo(toDelete.id)
          setToDelete(null)
        }}
      />
    </div>
  )
}

export default AdminTattoos