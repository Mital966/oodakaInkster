import { cn } from '../../utils/cn'

// Light labelled input used by the settings forms (website + homepage).
export function SettingField({ label, children, hint, className }) {
  return (
    <label className={cn('block', className)}>
      {label && <span className="mb-1.5 block text-xs font-semibold text-neutral-700">{label}</span>}
      {children}
      {hint && <span className="mt-1 block text-xs text-neutral-400">{hint}</span>}
    </label>
  )
}

export const settingInputCls =
  'w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10'

// Nested setter helper: returns a function that updates `obj[key][field]`.
export const setNested = (setObj, key) => (field) => (e) =>
  setObj((prev) => ({ ...prev, [key]: { ...prev[key], [field]: e.target.value } }))