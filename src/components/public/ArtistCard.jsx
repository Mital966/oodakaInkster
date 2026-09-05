import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function ArtistCard({ artist, worksCount = 0 }) {
  return (
    <motion.article className="group relative overflow-hidden bg-ink-800/40" whileHover="hover">
      <Link to={`/artists/${artist.id}`} className="absolute inset-0" aria-label={`${artist.name} — ${artist.role}`}>
        <motion.img
          src={artist.portrait}
          alt={`${artist.name}, ${artist.role} at Oddaka Inksters`}
          loading="lazy"
          className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-out"
          variants={{ rest: { scale: 1 }, hover: { scale: 1.04 } }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wide3 text-ink-300">
                {worksCount} featured works
              </p>
              <h3 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight text-bone">
                {artist.name}
              </h3>
              <p className="mt-1 text-[11px] uppercase tracking-wide2 text-ink-300">
                {artist.specialties.join(' / ')}
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-bone/25 text-bone opacity-0 -translate-x-2 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
              <ArrowUpRight size={16} />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

export default ArtistCard