import { cn } from '../../utils/cn'

// Light, form-oriented field wrapper for the admin dashboard.
function FormField({ label, error, hint, children, className }) {
  return (
    <label className={cn('block', className)}>
      {label && (
        <span className="mb-1.5 block text-xs font-semibold text-neutral-700">{label}</span>
      )}
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-xs text-neutral-400">{hint}</span>
      )}
    </label>
  )
}

export const inputCls =
  'w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10'

export default FormField