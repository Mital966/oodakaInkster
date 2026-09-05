import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

const ASPECTS = {
  tall: 'aspect-[3/4]',
  square: 'aspect-square',
  wide: 'aspect-[4/3]',
}

// Tattoo card used across the gallery, featured work and related work grids.
// aspect can be 'tall' | 'square' | 'wide' for editorial rhythm in masonry-type grids.
function TattooCard({ tattoo, artist, aspect = 'tall', eager = false, className }) {
  if (!tattoo) return null
  return (
    <motion.article
      className={cn('group relative overflow-hidden bg-ink-800/40', ASPECTS[aspect], className)}
      whileHover="hover"
      initial="rest"
      animate="rest"
      variants={{ rest: {}, hover: {} }}
    >
      <Link to={`/gallery/${tattoo.id}`} className="absolute inset-0" aria-label={`${tattoo.title} — ${tattoo.style} tattoo`}>
        <motion.img
          src={tattoo.cover}
          alt={`${tattoo.title}, ${tattoo.style} tattoo by ${artist?.name || 'Oddaka Inksters'}`}
          loading={eager ? 'eager' : 'lazy'}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wide3 text-ink-300">
                {tattoo.style}
              </p>
              <h3 className="mt-1.5 font-display text-lg font-bold tracking-tight text-bone">
                {tattoo.title}
              </h3>
              <p className="mt-1 text-[13px] text-ink-300">{artist?.name || 'Oddaka Inksters'}</p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-bone/25 text-bone opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 -translate-x-2">
              <ArrowUpRight size={15} />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

export default TattooCard