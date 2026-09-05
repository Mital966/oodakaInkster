import { ArrowRight } from 'lucide-react'
import InstagramIcon from '../../components/common/InstagramIcon'
import { useParams } from 'react-router-dom'
import Button from '../../components/common/Button'
import Reveal from '../../components/common/Reveal'
import Spinner from '../../components/common/Spinner'
import CTASection from '../../components/public/CTASection'
import GalleryGrid from '../../components/public/GalleryGrid'
import Page from '../../components/public/Page'
import { getArtistById, getArtists, getTattoosByArtist } from '../../data/dataService'
import { useDataQuery } from '../../hooks/useDataQuery'
import { cn } from '../../utils/cn'

function ArtistDetail() {
  const { id } = useParams()
  const { data, loading } = useDataQuery(
    () =>
      Promise.all([getArtistById(id), getArtists(), getTattoosByArtist(id)]).then(
        ([artist, allArtists, works]) => ({ artist, allArtists, works }),
      ),
    [id],
  )

  if (loading || !data) {
    return (
      <Page title="Oddaka Inksters | Artist">
        <div className="pt-36">
          <Spinner label="Loading artist" />
        </div>
      </Page>
    )
  }

  const { artist, allArtists, works } = data
  if (!artist) {
    return (
      <Page title="Not Found | Oddaka Inksters">
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
          <h1 className="font-display text-5xl font-black uppercase text-bone">Artist not found</h1>
          <Button to="/artists" variant="outline">Back to artists</Button>
        </div>
      </Page>
    )
  }

  const artistName = (aid) => allArtists.find((a) => a.id === aid)?.name || 'Oddaka'

  return (
    <Page title={`${artist.name} | Oddaka Inksters Artist`}>
      <section className="mx-auto max-w-8xl px-6 pb-24 pt-36 lg:px-10 lg:pt-44">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div className="relative overflow-hidden border border-ink-700/40">
              <img
                src={artist.portrait}
                alt={`${artist.name}, ${artist.role} at Oddaka Inksters`}
                className="aspect-[3/4] w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink-950/95 to-transparent px-5 pb-5 pt-16">
                <span className="font-mono text-[10px] uppercase tracking-wide3 text-ink-300">
                  {artist.experienceYears}+ years of practice
                </span>
                <a
                  href={artist.instagram !== '#' ? artist.instagram : 'https://instagram.com'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${artist.name} on Instagram (placeholder)`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-bone/40 text-bone hover:border-bone"
                >
                  <InstagramIcon size={15} />
                </a>
              </div>
            </div>
          </Reveal>

          <div className="lg:col-span-7">
            <Reveal delay={0.05}>
              <p className="font-mono text-[11px] uppercase tracking-wide3 text-[#b3541e]">
                {artist.role}
              </p>
              <h1 className="mt-3 font-display text-5xl font-black uppercase tracking-tight text-bone lg:text-7xl">
                {artist.name}
              </h1>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-wide2 text-ink-300">
                {artist.specialties.join(' / ')}
              </p>

              <p className="mt-8 max-w-2xl text-[16px] leading-relaxed text-ink-200">
                {artist.bio}
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {artist.specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-ink-600 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wide2 text-ink-200"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <Button href="#work" size="lg">
                  View Work <ArrowRight size={15} />
                </Button>
                <Button to={`/contact?artist=${artist.id}`} size="lg" variant="outline">
                  Book with {artist.name}
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="work" className="border-t border-ink-700/50 bg-ink-900/30 scroll-mt-24">
        <div className={cn('mx-auto max-w-8xl px-6 py-24 lg:px-10 lg:py-28')}>
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-wide3 text-ink-300">Selected Work</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-bone lg:text-4xl">
              {works.length} {works.length === 1 ? 'piece' : 'pieces'} by {artist.name}
            </h2>
          </Reveal>
          <div className="mt-10">
            <GalleryGrid tattoos={works} artistName={artistName} />
          </div>
        </div>
      </section>

      <CTASection
        title={`Book with ${artist.name}.`}
        text="Tell them what you're thinking — placement, size, references. The design conversation starts there."
        buttonLabel={`Book with ${artist.name}`}
        to={`/contact?artist=${artist.id}`}
        note="Consultations are free. Designs are always custom."
      />
    </Page>
  )
}

export default ArtistDetail