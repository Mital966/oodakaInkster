import { Compass, Droplet, Gauge, Inbox, LogOut, Users } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: Gauge },
  { to: '/admin/tattoos', label: 'Tattoos', icon: Droplet },
  { to: '/admin/artists', label: 'Artists', icon: Users },
  { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox },
]

function AdminSidebar({ onNavigate }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

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

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Admin">
        {NAV.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
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
            </NavLink>
          )
        })}
      </nav>

      <div className="space-y-1 border-t border-neutral-800 px-3 py-4">
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