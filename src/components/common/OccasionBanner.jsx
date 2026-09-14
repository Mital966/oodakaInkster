import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Button from './Button'
import Reveal from './Reveal'

function hexToRgba(hex, alpha = 1) {
  if (!hex || !hex.startsWith('#')) return `rgba(30,30,30,${alpha})`
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export default function OccasionBanner({ occasion }) {
  if (!occasion?.enabled) return null

  const today = new Date().toISOString().slice(0, 10)
  if (occasion.startDate && occasion.startDate > today) return null
  if (occasion.endDate && occasion.endDate < today) return null

  const accent = occasion.accentColor || '#e07a3f'
  const title = occasion.title || 'Special Occasion'
  const subtitle = occasion.subtitle || ''
  const desktopImage = occasion.imageDesktop || occasion.image
  const mobileImage = occasion.imageMobile || desktopImage

  return (
    <section className="relative overflow-hidden">
      {desktopImage && (
        <img
          src={desktopImage}
          alt={title}
          className="absolute inset-0 hidden h-full w-full object-cover md:block"
          aria-hidden="true"
        />
      )}
      {mobileImage && (
        <img
          src={mobileImage}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover md:hidden"
          aria-hidden="true"
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${hexToRgba(accent, 0.85)} 0%, ${hexToRgba(accent, 0.5)} 40%, rgba(15,15,15,0.9) 100%)`,
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center justify-center gap-6 py-20 text-center lg:py-28">
        <Reveal>
          <motion.p
            className="font-mono text-[10px] uppercase tracking-[0.35em]"
            style={{ color: accent }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Special Occasion
          </motion.p>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="font-display text-4xl font-black uppercase tracking-tight text-bone sm:text-5xl lg:text-6xl">
            {title}
          </h2>
        </Reveal>

        {subtitle && (
          <Reveal delay={0.2}>
            <p className="max-w-lg text-[15px] leading-relaxed text-ink-200">
              {subtitle}
            </p>
          </Reveal>
        )}

        {occasion.ctaLabel && (
          <Reveal delay={0.3}>
            <Button size="lg" to={occasion.ctaUrl || '/contact'} className="mt-2">
              {occasion.ctaLabel} <ArrowRight size={15} />
            </Button>
          </Reveal>
        )}
      </div>
    </section>
  )
}
