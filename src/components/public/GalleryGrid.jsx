import { LayoutGrid } from 'lucide-react'
import Button from '../common/Button'
import TattooCard from './TattooCard'

const PATTERN = ['tall', 'square', 'tall', 'wide', 'tall', 'square', 'tall', 'wide']

// Editorial gallery grid. Uses CSS columns on small screens (compact masonry)
// and an explicit row pattern on larger screens for visual rhythm.
function GalleryGrid({ tattoos, artistName, emptyAction }) {
  if (tattoos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 border border-dashed border-ink-600 py-24 text-center">
        <LayoutGrid size={22} className="text-ink-500" />
        <p className="max-w-sm text-sm text-ink-300">
          No work here yet with those filters. Try a different category or artist.
        </p>
        {emptyAction && (
          <Button variant="outline" size="sm" to={emptyAction.to}>
            {emptyAction.label}
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="columns-2 gap-4 lg:hidden">
        {tattoos.map((t) => (
          <div key={t.id} className="mb-4 break-inside-avoid">
            <TattooCard tattoo={t} artist={{ name: artistName(t.artistId) }} aspect="tall" />
          </div>
        ))}
      </div>

      <div className="hidden grid-cols-2 gap-4 lg:grid lg:grid-cols-3 xl:grid-cols-4">
        {tattoos.map((t, i) => (
          <TattooCard
            key={t.id}
            tattoo={t}
            artist={{ name: artistName(t.artistId) }}
            aspect={PATTERN[i % PATTERN.length]}
          />
        ))}
      </div>
    </>
  )
}

export default GalleryGrid