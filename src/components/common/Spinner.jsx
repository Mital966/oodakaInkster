import { cn } from '../../utils/cn'

function Spinner({ label = 'Loading', className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-24', className)} role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink-600 border-t-bone" aria-hidden="true" />
      <span className="font-mono text-[10px] uppercase tracking-wide3 text-ink-300">{label}</span>
    </div>
  )
}

export default Spinner