import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import Button from '../../components/common/Button'
import Reveal from '../../components/common/Reveal'
import Spinner from '../../components/common/Spinner'
import CategoryFilter from '../../components/public/CategoryFilter'
import GalleryGrid from '../../components/public/GalleryGrid'
import Page from '../../components/public/Page'
import { getArtists, getCategories, getTattoos } from '../../data/dataService'
import { useDataQuery } from '../../hooks/useDataQuery'
import { cn } from '../../utils/cn'

function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || 'all'
  const artist = searchParams.get('artist') || 'all'

  const { data, loading } = useDataQuery(
    () =>
      Promise.all([getTattoos(), getArtists(), getCategories()]).then(
        ([tattoos, artists, categories]) => ({ tattoos, artists, categories }),
      ),
    [],
  )

  const pin = (next) => {
    const p = new URLSearchParams(searchParams)
    Object.entries(next).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)))
    setSearchParams(p, { replace: true })
  }

  const filtered = useMemo(() => {
    if (!data) return []
    return data.tattoos.filter((t) => {
      if (category !== 'all' && t.category !== category) return false
      if (artist !== 'all' && t.artistId !== artist) return false
      return true
    })
  }, [data, category, artist])

  if (loading || !data) {
    return (
      <Page title="Oddaka Inksters | Tattoo Gallery">
        <div className="pt-32">
          <Spinner label="Loading the work" />
        </div>
      </Page>
    )
  }

  const { artists, categories } = data
  const artistName = (id) => artists.find((a) => a.id === id)?.name || 'Oddaka'
  const counts = categories.reduce((acc, c) => {
    acc[c.id] = data.tattoos.filter((t) => t.category === c.id).length
    return acc
  }, {})

  const pills = [{ id: 'all', label: 'ALL' }, ...categories]

  return (
    <Page title="Oddaka Inksters | Tattoo Gallery">
      <section className="mx-auto max-w-8xl px-6 pb-24 pt-36 lg:px-10 lg:pt-44 lg:pb-32">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-wide3 text-ink-300">
            The Gallery
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-black uppercase leading-[1.02] tracking-tight text-bone sm:text-6xl lg:text-7xl">
            The work speaks <span className="text-outline-strong">first.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-300">
            Every piece here was drawn for a real person, a real placement, a real story. Filter by
            style or artist and find the work you want on your own skin.
          </p>
        </Reveal>

        <div className="mt-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <CategoryFilter
            categories={pills}
            active={category}
            onChange={(id) => pin({ category: id === 'all' ? '' : id })}
            counts={category === 'all' ? counts : undefined}
          />
          <div className="relative w-full shrink-0 lg:w-56">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-wide3 text-ink-500">
              Artist
            </span>
            <select
              value={artist}
              onChange={(e) => pin({ artist: e.target.value === 'all' ? '' : e.target.value })}
              aria-label="Filter by artist"
              className={cn(
                'w-full cursor-pointer appearance-none rounded-full border bg-transparent py-2.5 pl-16 pr-10 font-mono text-[10px] uppercase tracking-wide2 text-ink-100 transition-colors',
                artist === 'all' ? 'border-ink-600 text-ink-300' : 'border-bone text-bone',
              )}
            >
              <option value="all" className="bg-ink-900">ALL ARTISTS</option>
              {artists.map((a) => (
                <option key={a.id} value={a.id} className="bg-ink-900">
                  {a.name.toUpperCase()}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-400">
              ▾
            </span>
          </div>
        </div>

        <div className="mt-12 lg:mt-14">
          <p className="mb-6 font-mono text-[10px] uppercase tracking-wide3 text-ink-500">
            {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
          </p>
          <GalleryGrid
            tattoos={filtered}
            artistName={artistName}
            emptyAction={{ to: '/gallery', label: 'Clear filters' }}
          />
        </div>
      </section>

      <section className="border-t border-ink-700/50 bg-ink-900/30">
        <div className="mx-auto flex max-w-8xl flex-col items-center gap-6 px-6 py-20 text-center lg:px-10">
          <p className="max-w-lg text-[15px] leading-relaxed text-ink-300">
            Can't find your style listed? We draw custom pieces around the idea you bring us.
          </p>
          <Button to="/contact">
            Discuss a custom piece <ArrowRight size={15} />
          </Button>
        </div>
      </section>
    </Page>
  )
}

export default Gallery