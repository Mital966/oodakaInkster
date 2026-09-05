import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Button from '../common/Button'
import Reveal from '../common/Reveal'

// Large final conversion section. The giant background word is a purely
// decorative text outline for a cinematic, print-style finish.
function CTASection({ title, text, buttonLabel = 'Start Your Tattoo', to = '/contact', note }) {
  return (
    <section className="relative overflow-hidden border-t border-ink-700/50">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_110%,rgba(179,84,30,0.14),transparent_70%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-center font-display text-[18vw] font-black uppercase leading-none tracking-tighter text-outline opacity-[0.06] lg:text-[15vw]"
      >
        Oddaka Inksters
      </span>
      <div className="relative mx-auto max-w-8xl px-6 py-24 text-center lg:px-10 lg:py-32">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-wide3 text-ink-300">
            Start your tattoo
          </p>
          <h2 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-black uppercase leading-[1.02] tracking-tight text-bone sm:text-6xl lg:text-7xl">
            {title}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-ink-300">
            {text}
          </p>
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            <Button size="lg" to={to}>
              {buttonLabel} <ArrowRight size={15} />
            </Button>
          </motion.div>
          {note && (
            <p className="mt-5 font-mono text-[10px] uppercase tracking-wide3 text-ink-500">{note}</p>
          )}
        </Reveal>
      </div>
    </section>
  )
}

export default CTASection