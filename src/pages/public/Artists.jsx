import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import Button from '../../components/common/Button'
import Reveal from '../../components/common/Reveal'
import Spinner from '../../components/common/Spinner'
import ArtistCard from '../../components/public/ArtistCard'
import CTASection from '../../components/public/CTASection'
import Page from '../../components/public/Page'
import { getArtists, getTattoos } from '../../data/dataService'
import { useDataQuery } from '../../hooks/useDataQuery'

function Artists() {
  const { data, loading } = useDataQuery(
    () =>
      Promise.all([getArtists(), getTattoos()]).then(([artists, tattoos]) => ({
        artists,
        tattoos,
      })),
    [],
  )

  const counts = useMemo(() => {
    if (!data) return {}
    return data.tattoos.reduce((acc, t) => {
      acc[t.artistId] = (acc[t.artistId] || 0) + 1
      return acc
    }, {})
  }, [data])

  if (loading || !data) {
    return (
      <Page title="Oddaka Inksters | Tattoo Artists">
        <div className="pt-36">
          <Spinner label="Meeting the artists" />
        </div>
      </Page>
    )
  }

  return (
    <Page title="Oddaka Inksters | Tattoo Artists">
      <section className="mx-auto max-w-8xl px-6 pb-24 pt-36 lg:px-10 lg:pt-44">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-wide3 text-ink-300">Our Artists</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-black uppercase leading-[1.02] tracking-tight text-bone sm:text-6xl lg:text-7xl">
            Choose the hand you trust.
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-300">
            Each artist here runs their own line — different styles, different obsessions. Read
            their work, then book directly with the one that fits.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {data.artists.map((artist, i) => (
            <Reveal key={artist.id} delay={(i % 4) * 0.06} y={18}>
              <ArtistCard artist={artist} worksCount={counts[artist.id] || 0} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-16 border border-ink-700/50 bg-ink-900/30 p-8 lg:p-12">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <h2 className="font-display text-2xl font-extrabold tracking-tight text-bone lg:text-3xl">
                  Not sure who fits your idea?
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-300">
                  Tell us the concept and placement — we'll match you with the artist whose style
                  suits it. That's the advice part, and it's free.
                </p>
              </div>
              <Button to="/contact">
                Get matched <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      <CTASection
        title="Find your artist."
        text="View the portfolio, follow the style you love, and book a consultation with the artist behind it."
        buttonLabel="Book a Consultation"
      />
    </Page>
  )
}

export default Artists