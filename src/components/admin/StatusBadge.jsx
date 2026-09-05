import { cn } from '../../utils/cn'

const STYLES = {
  NEW: 'bg-amber-50 text-amber-700 ring-amber-200',
  CONTACTED: 'bg-blue-50 text-blue-700 ring-blue-200',
  CONSULTATION: 'bg-violet-50 text-violet-700 ring-violet-200',
  BOOKED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  COMPLETED: 'bg-neutral-100 text-neutral-600 ring-neutral-200',
}

function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset',
        STYLES[status] || STYLES.NEW,
      )}
    >
      {status || 'NEW'}
    </span>
  )
}

export default StatusBadge