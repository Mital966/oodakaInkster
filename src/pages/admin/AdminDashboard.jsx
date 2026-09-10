import { ArrowUpRight, Cloud, Droplet, Inbox, Plus, Star, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatCard from '../../components/admin/StatCard'
import StatusBadge from '../../components/admin/StatusBadge'
import { useAdminData } from '../../context/AdminDataContext'
import { formatDate } from '../../utils/format'

function AdminDashboard() {
  const { tattoos, artists, enquiries, settings, backendLabel, backendMode } = useAdminData()
  const featured = tattoos.filter((t) => t.featured).length
  const recent = enquiries.slice(0, 6)
  const brand = settings?.business?.name || 'Oddaka Inksters'

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-neutral-900">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {brand} — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link
          to="/admin/tattoos/new"
          className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-neutral-100 transition-colors hover:bg-neutral-800"
        >
          <Plus size={15} /> Add tattoo
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total tattoos" value={tattoos.length} icon={Droplet} sub={`${tattoos.filter((t) => t.published).length} published`} />
        <StatCard label="Total artists" value={artists.length} icon={Users} sub="on the studio floor" />
        <StatCard label="Total enquiries" value={enquiries.length} icon={Inbox} sub={`${enquiries.filter((e) => e.status === 'NEW').length} new`} />
        <StatCard label="Featured tattoos" value={featured} icon={Star} sub="shown on the homepage" accent="bg-amber-50 text-amber-700" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* recent enquiries */}
        <div className="rounded-lg border border-neutral-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <h2 className="font-display text-sm font-bold text-neutral-900">Recent enquiries</h2>
            <Link to="/admin/enquiries" className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900">
              View all <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-[11px] uppercase tracking-wider text-neutral-400">
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Tattoo style</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recent.map((e) => (
                  <tr key={e.id} className="transition-colors hover:bg-neutral-50">
                    <td className="px-5 py-3">
                      <span className="font-medium text-neutral-900">{e.customer}</span>
                      <span className="block text-xs text-neutral-400">{e.phone}</span>
                    </td>
                    <td className="px-5 py-3 text-neutral-600">{e.style}</td>
                    <td className="px-5 py-3 text-neutral-500">{formatDate(e.createdAt)}</td>
                    <td className="px-5 py-3"><StatusBadge status={e.status} /></td>
                  </tr>
                ))}
                {recent.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-5 py-10 text-center text-neutral-400">No enquiries yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* side: content status */}
        <div className="space-y-4">
          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="font-display text-sm font-bold text-neutral-900">Content status</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                ['Unpublished', tattoos.filter((t) => !t.published).length],
                ['Featured', featured],
                ['Cover-ups', tattoos.filter((t) => t.category === 'cover-up').length],
                ['With video', tattoos.filter((t) => t.video).length],
              ].map(([label, n]) => (
                <li key={label} className="flex items-center justify-between">
                  <span className="text-neutral-500">{label}</span>
                  <span className="font-semibold text-neutral-900">{n}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="font-display text-sm font-bold text-neutral-900">Data source</h2>
            <div className="mt-3 flex items-start gap-2.5 rounded-md bg-neutral-50 p-3">
              <Cloud size={14} className="mt-0.5 shrink-0 text-neutral-400" />
              <p className="text-xs leading-relaxed text-neutral-500">
                <span className="font-semibold text-neutral-700">{backendLabel}</span>
                {backendMode === 'remote' ? ' — changes here publish straight to the live site.' : ' — your work is saved in this browser and won’t go live until Supabase is connected.'}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="font-display text-sm font-bold text-neutral-900">Quick actions</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                ['Add tattoo', '/admin/tattoos/new'],
                ['Add artist', '/admin/artists'],
                ['View enquiries', '/admin/enquiries'],
                ['Edit offers', '/admin/offers'],
                ['Website settings', '/admin/website'],
                ['Homepage content', '/admin/website/homepage'],
                ['Open public site', '/'],
              ].map(([label, to]) => (
                <Link key={to} to={to} className="rounded-md border border-neutral-200 px-3 py-2 text-center text-xs font-semibold text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* artist snapshot */}
      <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-5 py-4">
          <h2 className="font-display text-sm font-bold text-neutral-900">Artists & their workload</h2>
        </div>
        <div className="grid gap-px bg-neutral-100 sm:grid-cols-2 lg:grid-cols-4">
          {artists.map((a) => {
            const count = tattoos.filter((t) => t.artistId === a.id).length
            return (
              <div key={a.id} className="flex items-center gap-3 bg-white p-4">
                <img src={a.portrait} alt="" className="h-12 w-12 rounded-md object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-neutral-900">{a.name}</p>
                  <p className="truncate text-xs text-neutral-500">{a.specialties?.join(' / ')}</p>
                  <p className="mt-1 text-xs font-medium text-neutral-700">{count} pieces on record</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard