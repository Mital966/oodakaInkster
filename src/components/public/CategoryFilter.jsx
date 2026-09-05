import { cn } from '../../utils/cn'

// Horizontal, scrollable filter rail styled to match the studio identity.
function CategoryFilter({ categories, active, onChange, counts, className }) {
  return (
    <div
      className={cn(
        'no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0',
        className,
      )}
      role="group"
      aria-label="Filter by category"
    >
      {categories.map((cat) => {
        const selected = active === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            aria-pressed={selected}
            className={cn(
              'group relative inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-wide2 transition-all duration-300',
              selected
                ? 'border-bone bg-bone text-ink-950'
                : 'border-ink-600 text-ink-300 hover:border-ink-400 hover:text-bone',
            )}
          >
            {cat.label}
            {counts && (
              <span
                className={cn(
                  'font-mono text-[9px]',
                  selected ? 'text-ink-500' : 'text-ink-500',
                )}
              >
                {counts[cat.id] ?? 0}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default CategoryFilter