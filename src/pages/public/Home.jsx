import { motion } from 'framer-motion'
import { ArrowDown, ArrowRight, Eye } from 'lucide-react'
import InstagramIcon from '../../components/common/InstagramIcon'
import Button from '../../components/common/Button'
import Reveal from '../../components/common/Reveal'
import SectionHeading from '../../components/common/SectionHeading'
import ArtistCard from '../../components/public/ArtistCard'
import CTASection from '../../components/public/CTASection'
import Page from '../../components/public/Page'
import TattooCard from '../../components/public/TattooCard'
import TestimonialCard from '../../components/public/TestimonialCard'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getArtists, getCategories, getFeaturedTattoos, getReviews, getTattoos } from '../../data/dataService'
import { useDataQuery } from '../../hooks/useDataQuery'
import { cn } from '../../utils/cn'
import { SITE } from '../../config/site'

const CONTAINER = 'mx-auto max-w-8xl px-6 lg:px-10'

function useHomeData() {
  return useDataQuery(
    () =>
      Promise.all([getFeaturedTattoos(), getArtists(), getReviews(), getCategories(), getTattoos()]).then(
        ([featured, artists, reviews, categories, tattoos]) => ({ featured, artists, reviews, categories, tattoos }),
      ),
    [],
  )
}

const heroLine = {
  hidden: { opacity: 0, y: 28 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 + i * 0.14, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  }),
}

function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-end overflow-hidden">
      <img
        src="/hero.svg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-ink-950/50"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-ink-950/60 via-transparent to-transparent"
        aria-hidden="true"
      />

      <motion.div
        className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[11rem] font-black uppercase leading-none tracking-tighter text-outline opacity-[0.10] lg:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 0.7, duration: 1.4 }}
        aria-hidden="true"
      >
        INK
      </motion.div>

      <div className={cn('relative z-10 w-full pb-24 pt-40', CONTAINER)}>
        <motion.p
          className="font-mono text-[11px] uppercase tracking-wide3 text-ink-200"
          variants={heroLine}
          initial="hidden"
          animate="show"
          custom={0}
        >
          Oddaka Inksters — Custom Tattoo Studio
        </motion.p>

        <h1 className="mt-6 font-display text-[2.9rem] font-black uppercase leading-[0.95] tracking-tight text-bone sm:text-7xl lg:text-[5.4rem]">
          <motion.span variants={heroLine} initial="hidden" animate="show" custom={1} className="block">
            Your story.
          </motion.span>
          <motion.span
            variants={heroLine}
            initial="hidden"
            animate="show"
            custom={2}
            className="block text-outline-strong"
          >
            Permanently inked.
          </motion.span>
        </h1>

        <motion.p
          className="mt-7 max-w-md text-[15px] leading-relaxed text-ink-200"
          variants={heroLine}
          initial="hidden"
          animate="show"
          custom={3}
        >
          Custom tattoos · Fine line · Realism · Blackwork · Cover-ups. Designed around you, drawn
          by hand, made to last.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center gap-4"
          variants={heroLine}
          initial="hidden"
          animate="show"
          custom={4}
        >
          <Button size="lg" to="/contact">
            Book a Consultation <ArrowRight size={15} />
          </Button>
          <Button size="lg" variant="outline" to="/gallery">
            Explore Our Work
          </Button>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 right-0 hidden flex-col items-center gap-2 pr-10 lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        aria-hidden="true"
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-ink-400 [writing-mode:vertical-rl]">
          Fine line · Realism · Blackwork
        </span>
        <span className="h-16 w-px bg-ink-500/60" />
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-6 z-10 flex items-center gap-3 font-mono text-[10px] uppercase tracking-wide3 text-ink-300 lg:left-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <ArrowDown size={13} className="animate-bounce" /> Scroll
      </motion.div>
    </section>
  )
}

function Marquee() {
  const items = ['Fine Line', 'Realism', 'Blackwork', 'Traditional', 'Color', 'Minimal', 'Cover-Up', 'Custom']
  const row = [...items, ...items]
  return (
    <div className="relative overflow-hidden border-y border-ink-700/50 bg-ink-900/40 py-5" aria-hidden="true">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {row.map((s, i) => (
          <span key={i} className="flex items-center gap-10 font-mono text-[11px] uppercase tracking-wide3 text-ink-400">
            {s}<span className="text-[#b3541e]">.</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function FeaturedWork({ featured, artistName }) {
  const shown = featured.slice(0, 8)
  return (
    <section className={cn('py-24 lg:py-32', CONTAINER)}>
      <SectionHeading
        eyebrow="Featured Work"
        title={<>Drawn to live on skin.</>}
        description="A selection of recent pieces from the studio — every one drawn for a specific person, placement and story."
        align="between"
        action={
          <Button to="/gallery" variant="ghost" size="sm" className="hidden shrink-0 items-center gap-2 lg:flex">
            Explore Our Work <ArrowRight size={15} />
          </Button>
        }
      />
      <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {shown.map((t, i) => (
          <Reveal key={t.id} delay={(i % 4) * 0.06} y={18}>
            <TattooCard tattoo={t} artist={{ name: artistName(t.artistId) }} aspect={i % 4 === 1 ? 'square' : 'tall'} />
          </Reveal>
        ))}
      </div>
      <div className="mt-8 lg:hidden">
        <Button to="/gallery" variant="outline" className="w-full">
          Explore Our Work
        </Button>
      </div>
    </section>
  )
}

function StylesSection({ categories, tattooCounts }) {
  return (
    <section className="border-t border-ink-700/50 bg-ink-900/30">
      <div className={cn('py-24 lg:py-32', CONTAINER)}>
        <SectionHeading
          eyebrow="Tattoo Styles"
          title={<>Every style has a<em className="not-italic text-ink-300"> reason.</em></>}
          description="Find the language your tattoo should speak in. Every category here is a style our artists work in daily."
        />
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <Reveal key={cat.id} delay={(i % 4) * 0.05} y={16}>
              <Link
                to={`/gallery?category=${cat.id}`}
                className="group flex items-center justify-between gap-3 border border-ink-700/60 bg-ink-950/40 px-5 py-5 transition-all duration-300 hover:border-ink-400 sm:px-6 sm:py-7"
              >
                <div>
                  <span className="block font-display text-2xl font-bold tracking-tight text-bone transition-colors group-hover:text-ink-200 sm:text-3xl">
                    {cat.label}
                  </span>
                  <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-wide3 text-ink-500">
                    {String(i + 1).padStart(2, '0')} — {tattooCounts[cat.id] || 0} pieces
                  </span>
                </div>
                <span className="text-ink-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-bone">
                  <ArrowRight size={18} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function ArtistsSection({ artists, featuredByArtist }) {
  return (
    <section className={cn('py-24 lg:py-32', CONTAINER)}>
      <SectionHeading
        eyebrow="Our Artists"
        title={<>The hands behind the ink.</>}
        description="Four artists, four voices. Book directly with the person whose work speaks to you."
        align="between"
        action={
          <Button to="/artists" variant="ghost" size="sm" className="hidden shrink-0 items-center gap-2 lg:flex">
            Meet the Artists <ArrowRight size={15} />
          </Button>
        }
      />
      <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {artists.map((artist, i) => (
          <Reveal key={artist.id} delay={(i % 4) * 0.06} y={18}>
            <ArtistCard artist={artist} worksCount={featuredByArtist[artist.id] || 0} />
          </Reveal>
        ))}
      </div>
      <div className="mt-8 lg:hidden">
        <Button to="/artists" variant="outline" className="w-full">
          Meet the Artists
        </Button>
      </div>
    </section>
  )
}

function CoverSlider() {
  const [pos, setPos] = useState(50)
  const ref = useRef(null)
  const dragging = useRef(false)

  const setFromX = (clientX) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.min(94, Math.max(6, pct)))
  }

  return (
    <section className="border-t border-ink-700/50 bg-ink-900/30">
      <div className={cn('py-24 lg:py-32', CONTAINER)}>
        <SectionHeading
          eyebrow="Cover-Up Transformation"
          title={<>Old ink,</>}
          description="An unwanted tattoo retired under a layered ornamental mandala. Drag the handle to see what Rhea built over it."
        />
        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div
              ref={ref}
              className="relative aspect-[16/11] touch-none select-none overflow-hidden rounded-sm border border-ink-700/60"
              style={{ cursor: 'ew-resize' }}
              onPointerDown={(e) => {
                dragging.current = true
                e.currentTarget.setPointerCapture(e.pointerId)
                setFromX(e.clientX)
              }}
              onPointerMove={(e) => dragging.current && setFromX(e.clientX)}
              onPointerUp={() => (dragging.current = false)}
            >
              <img
                src="/tattoos/tattoo-07/01-before.svg"
                alt="Old tattoo before the cover-up"
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
              />
              <div
                className="absolute inset-0"
                style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
              >
                <img
                  src="/tattoos/tattoo-07/01.svg"
                  alt="Cover-up tattoo after"
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </div>
              <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
                <div className="h-full w-px bg-bone/80" />
                <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-bone bg-ink-950/80 backdrop-blur-sm">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M6 2 2 8l4 6M10 2l4 6-4 6" stroke="#f2efe9" strokeWidth="1.5" />
                  </svg>
                </span>
              </div>
              <span className="pointer-events-none absolute left-4 top-4 border border-ink-500/60 bg-ink-950/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wide3 text-ink-300 backdrop-blur-sm">
                Old tattoo
              </span>
              <span className="pointer-events-none absolute right-4 top-4 border border-bone/50 bg-ink-950/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wide3 text-bone backdrop-blur-sm">
                New tattoo
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-8">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wide3 text-[#b3541e]">
                  Ember Veil — Full cover-up
                </p>
                <h3 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-bone">
                  Not covered. Transformed.
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-ink-300">
                  Cover-ups aren't about hiding — they're about rebuilding. This piece used the old
                  ink's darkest areas as foundations and layered a three-ring ornamental mandala
                  over them in three sessions.
                </p>
              </div>
              <dl className="grid grid-cols-3 gap-px overflow-hidden border border-ink-700/60 bg-ink-700/60">
                {[
                  ['Sessions', '3'],
                  ['Hours', '12'],
                  ['Style', 'Ornamental'],
                ].map(([k, v]) => (
                  <div key={k} className="bg-ink-950/80 px-4 py-5 text-center">
                    <dt className="font-mono text-[9px] uppercase tracking-wide3 text-ink-500">{k}</dt>
                    <dd className="mt-2 font-display text-lg font-bold text-bone">{v}</dd>
                  </div>
                ))}
              </dl>
              <Button to="/gallery/7" variant="outline">
                <Eye size={15} /> See the full project
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function ProcessSection() {
  const steps = [
    ['01', 'Consultation', 'We talk through your idea — placement, size, meaning, style. No pressure, honest answers.'],
    ['02', 'Design', 'Your artist draws a custom design around your brief and refines it with you before anything touches skin.'],
    ['03', 'Tattoo', 'A clean, focused session. Single-use equipment, premium ink, and a pace that respects your skin.'],
    ['04', 'Aftercare', 'Detailed care instructions plus a real follow-up from the studio until you’re fully healed.'],
  ]
  return (
    <section className={cn('py-24 lg:py-32', CONTAINER)}>
      <SectionHeading
        eyebrow="The Process"
        title={<>From idea to ink.</>}
        description="Four steps. We handle the craft, you bring the story."
      />
      <div className="mt-14 grid gap-px overflow-hidden border border-ink-700/60 bg-ink-700/60 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([num, name, desc], i) => (
          <Reveal key={num} delay={i * 0.07} className="h-full">
            <div className="group h-full bg-ink-900/60 p-7 transition-colors duration-300 hover:bg-ink-800/60">
              <span className="font-display text-5xl font-black leading-none text-outline transition-colors duration-300 group-hover:text-[#b3541e]" style={{ WebkitTextStroke: '1px rgba(179,84,30,0.55)' }}>
                {num}
              </span>
              <h3 className="mt-6 font-display text-xl font-bold uppercase tracking-tight text-bone">
                {name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-300">{desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function WhySection() {
  const points = [
    ['Craft first', 'Years of daily drawing before machines. Tattoos are the last step, not the first skill.'],
    ['Custom only', 'No flash off the wall. Every piece is drawn for you, on paper, before it is inked on skin.'],
    ['Sterile sessions', 'Hospital-grade hygiene: single-use tubes and needles, sealed inks, every station cleaned between clients.'],
    ['Built to last', 'Procedures and placement chosen for how ink settles over decades, not how it photographs today.'],
    ['Aftercare that continues', 'A direct line to your artist after you leave — because healing is part of the tattoo.'],
  ]
  return (
    <section className="border-t border-ink-700/50 bg-ink-900/30">
      <div className={cn('py-24 lg:py-32', CONTAINER)}>
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="Why Oddaka"
              title={<>Precision, not promises.</>}
              description="Any studio can claim experience. These are the standards we hold every session to — no exceptions."
            />
          </div>
          <div className="lg:col-span-8">
            <ul className="divide-y divide-ink-700/60 border-y border-ink-700/60">
              {points.map(([title, desc], i) => (
                <Reveal key={title}>
                  <li key={title} className="group flex items-start gap-6 py-7">
                    <span className="font-mono text-sm text-[#b3541e]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-bold uppercase tracking-tight text-bone">
                        {title}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-300">{desc}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function StoriesSection({ reviews }) {
  return (
    <section className={cn('py-24 lg:py-32', CONTAINER)}>
      <SectionHeading
        eyebrow="Client Stories"
        title={<>Inked once,</>}
        description="The work is the loudest review. Here’s what clients say about the process."
      />
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r, i) => (
          <Reveal key={r.id} delay={(i % 3) * 0.06} y={18}>
            <TestimonialCard review={r} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function InstaGrid({ featured }) {
  const tiles = featured.slice(0, 6).map((t) => ({ src: t.cover, id: t.id }))
  return (
    <section className="border-t border-ink-700/50 bg-ink-900/30">
      <div className={cn('py-24 lg:py-32', CONTAINER)}>
        <SectionHeading
          eyebrow="On Instagram"
          title={<>Fresh off the machine.</>}
          align="between"
          description="Daily studio life, healed pieces and work-in-progress. The feed is the honest portfolio."
          action={
            <Button href={SITE.instagramUrl} variant="ghost" size="sm" className="hidden shrink-0 items-center gap-2 lg:inline-flex">
<InstagramIcon size={14} /> Follow @{SITE.instagram}
            </Button>
          }
        />
        <div className="mt-12 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.04} y={12}>
              <Link
                to={`/gallery/${t.id}`}
                className="group relative block aspect-square overflow-hidden"
                aria-label={`View ${t.id} on Instagram`}
              >
                <img
                  src={t.src}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-ink-950/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <InstagramIcon size={18} className="text-bone" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 lg:hidden">
          <Button href={SITE.instagramUrl} variant="outline" className="w-full">
            <InstagramIcon size={14} /> Follow @{SITE.instagram}
          </Button>
        </div>
      </div>
    </section>
  )
}

function Home() {
  const { data, loading, error } = useHomeData()
  if (loading || !data) {
    return (
      <Page title="Oddaka Inksters | Premium Tattoo Studio">
        <div className="flex min-h-screen items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink-600 border-t-bone" />
        </div>
      </Page>
    )
  }
  if (error) {
    return (
      <Page title="Oddaka Inksters | Premium Tattoo Studio">
        <div className="flex min-h-screen items-center justify-center px-6 text-center">
          <p className="text-sm text-ink-300">Something went wrong loading the studio.</p>
        </div>
      </Page>
    )
  }

  const { featured, artists, reviews, categories, tattoos } = data
  const artistName = (id) => artists.find((a) => a.id === id)?.name || 'Oddaka'
  const featuredByArtist = featured.reduce((acc, t) => {
    acc[t.artistId] = (acc[t.artistId] || 0) + 1
    return acc
  }, {})
  const tattooCounts = categories.reduce((acc, c) => {
    acc[c.id] = tattoos.filter((t) => t.category === c.id).length
    return acc
  }, {})

  return (
    <Page title="Oddaka Inksters | Premium Tattoo Studio" className="overflow-x-clip">
      <Hero />
      <Marquee />
      <FeaturedWork featured={featured} artistName={artistName} />
      <StylesSection categories={categories} tattooCounts={tattooCounts} />
      <ArtistsSection artists={artists} featuredByArtist={featuredByArtist} />
      <CoverSlider />
      <ProcessSection />
      <WhySection />
      <StoriesSection reviews={reviews.slice(0, 6)} />
      <InstaGrid featured={featured} />
      <CTASection
        title="Ready to get inked?"
        text="Tell us your idea. We'll help turn it into something permanent."
      />
    </Page>
  )
}

export default Home