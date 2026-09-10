import { MessageCircle, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import ConfirmModal from '../../components/admin/ConfirmModal'
import EmptyState from '../../components/admin/EmptyState'
import StatusBadge from '../../components/admin/StatusBadge'
import { useToast } from '../../components/admin/Toast'
import Modal from '../../components/common/Modal'
import { ENQUIRY_STATUSES } from '../../config/site'
import { useAdminData } from '../../context/AdminDataContext'
import { cn } from '../../utils/cn'
import { formatDate } from '../../utils/format'
import { buildWhatsAppLink } from '../../utils/wa'

const FIELD_LABELS = {
  style: 'Style',
  placement: 'Placement',
  size: 'Size',
  budget: 'Budget',
  preferredDate: 'Preferred date',
}

function AdminEnquiries() {
  const { enquiries, updateEnquiryStatus, artistName, deleteEnquiry } = useAdminData()
  const { toast } = useToast()
  const [filter, setFilter] = useState('ALL')
  const [toDelete, setToDelete] = useState(null)
  const [viewingRef, setViewingRef] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const counts = useMemo(() => {
    const c = { ALL: enquiries.length }
    for (const s of ENQUIRY_STATUSES) c[s] = 0
    for (const e of enquiries) c[e.status] = (c[e.status] || 0) + 1
    return c
  }, [enquiries])

  const filtered = filter === 'ALL' ? enquiries : enquiries.filter((e) => e.status === filter)
  const ordered = [...filtered].reverse()

  async function handleStatus(id, status) {
    if (busyId) return
    setBusyId(id)
    try {
      await updateEnquiryStatus(id, status)
      toast('success', `Marked as ${status}.`)
    } catch (err) {
      toast('error', err.message || 'We couldn’t update that enquiry.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete() {
    if (!toDelete) return
    try {
      await deleteEnquiry(toDelete.id)
      toast('success', 'Enquiry deleted.')
      setToDelete(null)
    } catch (err) {
      toast('error', err.message || 'We couldn’t delete that enquiry.')
      setToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-neutral-900">Enquiries</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Consultation requests submitted from the public site.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['ALL', ...ENQUIRY_STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
              filter === s
                ? 'border-neutral-900 bg-neutral-900 text-neutral-100'
                : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:text-neutral-900',
            )}
          >
            {s} <span className={cn('ml-1', filter === s ? 'text-neutral-400' : 'text-neutral-400')}>{counts[s]}</span>
          </button>
        ))}
      </div>

      {ordered.length === 0 ? (
        <EmptyState
          title={filter === 'ALL' ? 'No enquiries yet' : `No ${filter.toLowerCase()} enquiries`}
          message="When someone sends an enquiry from the public contact page, it lands here."
        />
      ) : (
        <div className="space-y-4">
          {ordered.map((e) => {
            const extra = [
              ['style', e.style],
              ['placement', e.placement],
              ['size', e.size],
              ['budget', e.budget],
              ['preferredDate', e.preferredDate],
            ].filter(([, v]) => v && v !== 'Not sure yet' && v !== 'Not decided' && v !== 'Flexible')
            return (
              <article key={e.id} className={cn('rounded-lg border border-neutral-200 bg-white shadow-sm', busyId === e.id && 'opacity-60')}>
                <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold text-neutral-600">
                      {e.customer.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                    </span>
                    <div>
                      <p className="font-semibold text-neutral-900">{e.customer}</p>
                      <p className="text-xs text-neutral-500">
                        {formatDate(e.createdAt)}
                        {e.artist && ` · Prefers ${artistName(e.artist)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={e.status} />
                    {e.referenceUrl && (
                      <button
                        type="button"
                        onClick={() => setViewingRef(e)}
                        aria-label={`View reference image for ${e.customer}`}
                        className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wide">Ref</span>
                      </button>
                    )}
                    <a
                      href={buildWhatsAppLink(`Hi, I'm ${e.customer}. I sent a tattoo enquiry to Oddaka Inksters (${e.id}).`)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`WhatsApp ${e.customer}`}
                      className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <MessageCircle size={15} />
                    </a>
                    <button
                      type="button"
                      onClick={() => setToDelete(e)}
                      aria-label="Delete enquiry"
                      className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="border-t border-neutral-100 px-5 py-4">
                  <p className="text-sm leading-relaxed text-neutral-700">{e.idea}</p>
                  {e.message && <p className="mt-2 text-sm leading-relaxed text-neutral-500">{e.message}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                    {extra.map(([k, v]) => (
                      <span key={k} className="rounded-full bg-neutral-50 px-2.5 py-1 text-neutral-600 ring-1 ring-inset ring-neutral-200">
                        {FIELD_LABELS[k]}: <span className="font-medium text-neutral-800">{v}</span>
                      </span>
                    ))}
                  </div>
                  {e.referenceUrl && (
                    <div className="mt-3 flex items-center gap-2">
                      <img src={e.referenceUrl} alt="" className="h-14 w-14 rounded-md object-cover ring-1 ring-neutral-200" />
                      <button type="button" onClick={() => setViewingRef(e)} className="text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-900">
                        View reference image
                      </button>
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <a href={`tel:${e.phone}`} className="text-xs font-semibold text-neutral-500 hover:text-neutral-900">{e.phone}</a>
                    {e.email && <a href={`mailto:${e.email}`} className="text-xs font-semibold text-neutral-500 hover:text-neutral-900">{e.email}</a>}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 px-5 py-3.5">
                  <span className="text-xs text-neutral-400">Update status</span>
                  <div className="flex flex-wrap gap-1.5">
                    {ENQUIRY_STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleStatus(e.id, s)}
                        disabled={busyId === e.id}
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                          e.status === s
                            ? 'bg-neutral-900 text-neutral-100'
                            : 'border border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-900',
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Modal open={!!viewingRef} onClose={() => setViewingRef(null)} title={viewingRef ? `Reference from ${viewingRef.customer}` : ''} width="max-w-2xl">
        {viewingRef?.referenceUrl && (
          <img src={viewingRef.referenceUrl} alt="" className="mx-auto max-h-[70vh] w-auto rounded-md" />
        )}
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        title="Delete enquiry?"
        message={toDelete ? `The enquiry from ${toDelete.customer} will be permanently removed.` : ''}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default AdminEnquiries