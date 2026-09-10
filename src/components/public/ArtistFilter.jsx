import { cn } from '../../utils/cn'

// Horizontal, scrollable artist rail styled to match the studio identity.
function ArtistFilter({ artists, active, onChange, className }) {
  const pills = [{ id: 'all', label: 'All Artists' }, ...artists]
  return (
    <div
      className={cn(
        'no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0',
        className,
      )}
      role="group"
      aria-label="Filter by artist"
    >
      {pills.map((a) => {
        const selected = active === a.id
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onChange(a.id)}
            aria-pressed={selected}
            className={cn(
              'group relative inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-wide2 transition-all duration-300',
              selected
                ? 'border-bone bg-bone text-ink-950'
                : 'border-ink-600 text-ink-300 hover:border-ink-400 hover:text-bone',
            )}
          >
            {a.label}
          </button>
        )
      })}
    </div>
  )
}

export default ArtistFilter