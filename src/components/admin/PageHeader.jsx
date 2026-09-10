import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

// Standard page header used on every admin page (title, subtitle, back link,
// right-aligned actions).
function PageHeader({ title, subtitle, backTo, backLabel = 'Back', children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {backTo && (
          <Link
            to={backTo}
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
          >
            <ChevronLeft size={14} /> {backLabel}
          </Link>
        )}
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-neutral-900">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  )
}

export default PageHeader