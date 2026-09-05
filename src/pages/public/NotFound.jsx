import { ArrowRight, Compass } from 'lucide-react'
import Button from '../../components/common/Button'
import Page from '../../components/public/Page'

function NotFound() {
  return (
    <Page title="Page Not Found | Oddaka Inksters">
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-32 text-center">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/3 select-none font-display text-[40vw] font-black leading-none text-outline opacity-[0.07]"
        >
          404
        </span>
        <div className="relative">
          <p className="font-mono text-[11px] uppercase tracking-wide3 text-ink-300">
            Error 404
          </p>
          <h1 className="mt-4 font-display text-5xl font-black uppercase tracking-tight text-bone sm:text-7xl">
            Wrong side <span className="text-outline-strong">of the skin.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-ink-300">
            This page doesn't exist — but the good work does. Pick a direction back into the studio.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button to="/" size="lg">
            <Compass size={15} /> Back home
            </Button>
            <Button to="/gallery" size="lg" variant="outline">
              Browse the gallery <ArrowRight size={15} />
            </Button>
          </div>
        </div>
      </section>
    </Page>
  )
}

export default NotFound