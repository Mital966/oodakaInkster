import { ArrowUpRight, Clock, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import InstagramIcon from '../../components/common/InstagramIcon'
import { SITE } from '../../config/site'
import { buildWhatsAppLink } from '../../utils/wa'

const NAV = [
  { label: 'Gallery', to: '/gallery' },
  { label: 'Artists', to: '/artists' },
  { label: 'About', to: '/about' },
  { label: 'Aftercare', to: '/aftercare' },
  { label: 'Contact', to: '/contact' },
]

function Footer() {
  return (
    <footer className="border-t border-ink-700/60 bg-ink-900/40">
      <div className="mx-auto max-w-8xl px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex flex-col leading-none">
              <span className="font-display text-2xl font-extrabold tracking-tight text-bone">
                ODDAKA
              </span>
              <span className="mt-1 font-mono text-[10px] uppercase tracking-wide3 text-ink-400">
                Inksters<span className="text-[#b3541e]">.</span>
              </span>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink-300">
              A premium tattoo studio for people who want their skin to say something
              permanent. Custom work, honest craft, zero compromise.
            </p>
            <div className="mt-7 flex items-center gap-4">
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Oddaka Inksters on Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-600 text-ink-200 transition-colors hover:border-bone hover:text-bone"
              >
                <InstagramIcon size={16} />
              </a>
              <a
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noreferrer"
                aria-label="Chat with Oddaka Inksters on WhatsApp"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-600 text-ink-200 transition-colors hover:border-bone hover:text-bone"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <p className="font-mono text-[11px] uppercase tracking-wide3 text-ink-400">Explore</p>
            <ul className="mt-5 space-y-3">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    className="group inline-flex items-center gap-1 text-sm text-ink-200 transition-colors hover:text-bone"
                  >
                    {n.label}
                    <ArrowUpRight
                      size={12}
                      className="-translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="font-mono text-[11px] uppercase tracking-wide3 text-ink-400">Studio</p>
            <ul className="mt-5 space-y-4 text-sm text-ink-200">
              <li className="flex items-start gap-3">
                <MapPin size={14} className="mt-0.5 shrink-0 text-ink-400" />
                <span>{SITE.location}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={14} className="mt-0.5 shrink-0 text-ink-400" />
                <ul className="space-y-1">
                  {SITE.hours.map((h) => (
                    <li key={h.days}>
                      <span className="text-ink-400">{h.days}</span> — {h.time}
                    </li>
                  ))}
                </ul>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={14} className="mt-0.5 shrink-0 text-ink-400" />
                <a
                  href={`tel:${SITE.phone.replace(/\s/g, '')}`}
                  className="transition-colors hover:text-bone"
                >
                  {SITE.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-ink-700/50 pt-8 sm:flex-row">
          <p className="font-mono text-[10px] uppercase tracking-wide3 text-ink-500">
            © {new Date().getFullYear()} Oddaka Inksters. All rights reserved.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wide3 text-ink-500">
            Custom tattoos · Fine line · Realism · Blackwork · Cover-ups
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer