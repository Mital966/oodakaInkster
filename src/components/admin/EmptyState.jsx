import { FolderOpen } from 'lucide-react'
import { cn } from '../../utils/cn'

// Friendly empty state for admin lists.
function EmptyState({ title = 'Nothing here yet', message, action, className }) {
  return (
    <div className={cn('rounded-lg border border-dashed border-neutral-200 bg-white px-6 py-14 text-center', className)}>
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50 text-neutral-300">
        <FolderOpen size={20} />
      </span>
      <h3 className="mt-4 font-display text-sm font-bold text-neutral-900">{title}</h3>
      {message && <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export default EmptyState