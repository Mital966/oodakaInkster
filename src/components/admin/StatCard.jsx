import { ArrowLeftRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

function StatCard({ label, value, sub, icon: Icon, accent = 'bg-neutral-900 text-neutral-100' }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">{label}</p>
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-md', accent)}>
          <Icon size={15} />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-extrabold tracking-tight text-neutral-900">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-neutral-500">{sub}</p>}
    </div>
  )
}

export default StatCard