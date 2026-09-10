import { Clock3, Compass, Droplet, FolderKanban, Gauge, Globe, HelpCircle, Inbox, LayoutTemplate, LogOut, Megaphone, Star, Users } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAdminData } from '../../context/AdminDataContext'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: Gauge },
  { to: '/admin/tattoos', label: 'Tattoos', icon: Droplet },
  { to: '/admin/artists', label: 'Artists', icon: Users },
  { to: '/admin/categories', label: 'Styles', icon: FolderKanban },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/offers', label: 'Offers', icon: Megaphone },
  { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox, badge: 'enquiries' },
]

const WEBSITE_NAV = [
  { to: '/admin/website', label: 'Website', icon: Globe },
  { to: '/admin/website/homepage', label: 'Homepage', icon: LayoutTemplate },
  { to: '/admin/help', label: 'Help & setup', icon: HelpCircle },
]

function NavLinkItem({ item, count, onNavigate }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
          isActive
            ? 'bg-neutral-100 font-semibold text-neutral-900'
            : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100',
        )
      }
    >
      <Icon size={16} />
      {item.label}
      {typeof count === 'number' && count > 0 && (
        <span className="ml-auto rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-900">
          {count}
        </span>
      )}
    </NavLink>
  )
}

function AdminSidebar({ onNavigate }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { enquiries, tattoos } = useAdminData()
  const envelopeCount = enquiries?.filter((e) => e.status === 'NEW')?.length ?? 0
  const draftCount = tattoos?.filter((t) => !t.published)?.length ?? 0

  function handleLogout() {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex h-full flex-col bg-neutral-900 text-neutral-100">
      <Link to="/admin/dashboard" onClick={onNavigate} className="flex items-center gap-3 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded bg-neutral-100 text-neutral-900">
          <Droplet size={16} />
        </span>
        <span className="leading-tight">
          <span className="block font-display text-sm font-extrabold tracking-tight">ODDAKA</span>
          <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-400">
            Studio admin
          </span>
        </span>
      </Link>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Admin">
        <div className="space-y-1">
          {NAV.map((item) => (
            <NavLinkItem
              key={item.to}
              item={item}
              onNavigate={onNavigate}
              count={
                item.badge === 'enquiries' ? envelopeCount : item.to === '/admin/tattoos' ? draftCount : undefined
              }
            />
          ))}
        </div>

        <div>
          <p className="px-3 pb-1.5 font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-600">Website</p>
          <div className="space-y-1">
            {WEBSITE_NAV.map((item) => (
              <NavLinkItem key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </nav>

      <div className="space-y-1 border-t border-neutral-800 px-3 py-4">
        <span className="flex items-center gap-2.5 px-3 py-1.5 text-[11px] text-neutral-500">
          <Clock3 size={12} />
          {enquiries?.length} enquiries received
        </span>
        <Link
          to="/"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
        >
          <Compass size={16} /> View public site
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  )
}

export default AdminSidebar