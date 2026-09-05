import { AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, Clock, Layers, Maximize2, Ruler } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../../components/common/Button'
import Reveal from '../../components/common/Reveal'
import Spinner from '../../components/common/Spinner'
import CTASection from '../../components/public/CTASection'
import GalleryGrid from '../../components/public/GalleryGrid'
import Lightbox from '../../components/public/Lightbox'
import Page from '../../components/public/Page'
import VideoCard from '../../components/public/VideoCard'
import { getArtists, getRelatedTattoos, getTattooById } from '../../data/dataService'
import { useDataQuery } from '../../hooks/useDataQuery'
import { cn } from '../../utils/cn'

function TattooDetail() {
  const { id } = useParams()
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const { data, loading } = useDataQuery(
    () =>
      Promise.all([getTattooById(id), getArtists(), getRelatedTattoos(id, 4)]).then(
        ([tattoo, artists, related]) => ({ tattoo, artists, related }),
      ),
    [id],
  )

  if (loading || !data) {
    return (
      <Page title="Oddaka Inksters | Tattoo">
        <div className="pt-36">
          <Spinner label="Opening project" />
        </div>
      </Page>
    )
  }

  const { tattoo, artists, related } = data
  if (!tattoo) {
    return (
      <Page title="Not Found | Oddaka Inksters">
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
          <h1 className="font-display text-5xl font-black uppercase text-bone">Tattoo not found</h1>
          <p className="max-w-md text-sm text-ink-300">This piece isn't in the portfolio (yet).</p>
          <Button to="/gallery" variant="outline">Back to gallery</Button>
        </div>
      </Page>
    )
  }

  const artist = artists.find((a) => a.id === tattoo.artistId)
  const artistName = (aid) => artists.find((a) => a.id === aid)?.name || 'Oddaka'

  return (
    <Page title={`${tattoo.title} | Oddaka Inksters Gallery`}>
      {/* breadcrumb */}
      <div className="mx-auto max-w-8xl px-6 pt-36 lg:px-10 lg:pt-40">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide3 text-ink-400">
          <Link to="/" className="hover:text-bone">Home</Link>
          <span>/</span>
          <Link to="/gallery" className="hover:text-bone">Gallery</Link>
          <span>/</span>
          <span className="text-ink-200">{tattoo.title}</span>
        </nav>
      </div>

      <section className="mx-auto max-w-8xl px-6 pb-24 pt-10 lg:px-10 lg:pt-14">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* media */}
          <div className="lg:col-span-8">
            <div className="group relative overflow-hidden bg-ink-800/40">
              <button
                type="button"
                onClick={() => setLightboxIndex(0)}
                className="block w-full cursor-zoom-in"
                aria-label={`Open ${tattoo.title} in fullscreen viewer`}
              >
                <img
                  src={tattoo.cover}
                  alt={`${tattoo.title}, ${tattoo.style} by ${artist?.name}`}
                  className="aspect-[3/4] w-full object-cover"
                />
                <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 border border-ink-500/50 bg-ink-950/60 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-wide3 text-ink-200 backdrop-blur-sm">
                  <Maximize2 size={11} /> Zoom
                </span>
              </button>
            </div>

            {tattoo.photos?.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {tattoo.photos.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    aria-label={`View image ${i + 1}`}
                    className={cn(
                      'overflow-hidden border transition-all duration-300',
                      i === (lightboxIndex ?? 0)
                        ? 'border-bone'
                        : 'border-ink-700/60 opacity-70 hover:opacity-100',
                    )}
                  >
                    <img src={src} alt="" loading="lazy" className="aspect-[3/4] w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {tattoo.video && (
              <div className="mt-10">
                <Reveal>
                  <div className="mb-5 flex items-center gap-4">
                    <span className="font-mono text-[11px] uppercase tracking-wide3 text-ink-400">
                      Watch the process
                    </span>
                    <span className="h-px flex-1 bg-ink-700/60" />
                  </div>
                  <VideoCard src={tattoo.video} poster={tattoo.videoPoster || tattoo.cover} title={`${tattoo.title} process video`} />
                </Reveal>
              </div>
            )}
          </div>

          {/* info */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <p className="font-mono text-[11px] uppercase tracking-wide3 text-[#b3541e]">
                {tattoo.style}
              </p>
              <h1 className="mt-3 font-display text-4xl font-black uppercase tracking-tight text-bone lg:text-5xl">
                {tattoo.title}
              </h1>
              {artist && (
                <Link
                  to={`/artists/${artist.id}`}
                  className="group mt-4 inline-flex items-center gap-2 text-sm text-ink-200 hover:text-bone"
                >
                  by <span className="font-display font-bold text-bone underline-offset-4 group-hover:underline">{artist.name}</span>
                </Link>
              )}

              <dl className="mt-8 divide-y divide-ink-700/50 border-y border-ink-700/50">
                {[
                  ['Style', tattoo.style],
                  ['Placement', tattoo.placement],
                  ['Sessions', String(tattoo.sessions ?? 1)],
                  ['Duration', tattoo.duration],
                  ['Year', String(tattoo.year || '—')],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-3.5">
                    <dt className="font-mono text-[10px] uppercase tracking-wide3 text-ink-500">{k}</dt>
                    <dd className="text-sm font-medium text-bone">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8 space-y-4">
                <p className="text-[15px] leading-relaxed text-ink-200">{tattoo.description}</p>
                {tattoo.designNotes && (
                  <div className="border-l-2 border-ink-700/60 pl-4">
                    <p className="font-mono text-[9px] uppercase tracking-wide3 text-ink-500">Design notes</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-300">{tattoo.designNotes}</p>
                  </div>
                )}
              </div>

              <div className="mt-10 flex flex-col gap-3">
                <Button to="/contact" size="lg">
                  Start Your Tattoo <ArrowRight size={15} />
                </Button>
                <Button to={artist ? `/artists/${artist.id}` : '/artists'} variant="outline">
                  <Layers size={15} /> More from {artist?.name || 'the studio'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* related */}
      {related.length > 0 && (
        <section className="border-t border-ink-700/50 bg-ink-900/30">
          <div className="mx-auto max-w-8xl px-6 py-24 lg:px-10">
            <Reveal>
              <div className="flex items-end justify-between gap-6">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wide3 text-ink-400">Keep looking</p>
                  <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-bone">
                    Similar work
                  </h2>
                </div>
                <Link to="/gallery" className="group flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide3 text-ink-300 hover:text-bone">
                  Full gallery <ChevronLeft size={13} className="rotate-180" />
                </Link>
              </div>
            </Reveal>
            <div className="mt-10">
              <GalleryGrid tattoos={related} artistName={artistName} />
            </div>
          </div>
        </section>
      )}

      <CTASection
        title="Like this style?"
        text="Tell us what you're picturing. We'll turn it into a design that belongs to you."
        buttonLabel="Start Your Tattoo"
      />

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={tattoo.photos}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        )}
      </AnimatePresence>
    </Page>
  )
}

export default TattooDetail