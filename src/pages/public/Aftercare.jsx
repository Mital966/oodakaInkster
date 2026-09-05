import { AlertTriangle, Check, X } from 'lucide-react'
import Button from '../../components/common/Button'
import Reveal from '../../components/common/Reveal'
import Page from '../../components/public/Page'
import { cn } from '../../utils/cn'

const CONTAINER = 'mx-auto max-w-8xl px-6 lg:px-10'

const PHASES = [
  {
    num: '01',
    name: 'First 24 Hours',
    period: 'Day 0 – 1',
    summary: 'The tattoo is an open wound in a clean bandage. Protect it.',
    do: [
      'Keep the studio bandage on for the full 6–24 hours they recommend',
      'Wash gently with lukewarm water and unscented soap when it comes off',
      'Pat dry with a fresh paper towel — never rub',
      'Apply a thin layer of aftercare balm',
    ],
    dont: [
      'Do not re-bandage blindly or seal it airtight',
      'No swimming, gym or heavy sweating',
      'No direct sun on the fresh ink',
      'Do not let pets or dirty hands near it',
    ],
  },
  {
    num: '02',
    name: 'Days 2–7',
    period: 'The itchy phase',
    summary: 'Peeling and tightness are normal. This is when most people ruin a tattoo.',
    do: [
      'Wash 2–3 times daily, gently, with fingertips only',
      'Keep it moisturised with a thin, even layer',
      'Let peeling skin fall off on its own',
      'Wear clean, loose clothing over the area',
    ],
    dont: [
      'Do not pick, scratch or peel',
      'No soaking — no baths, pools, hot tubs or long showers',
      'No harsh lotions, perfume or alcohol wipes',
      'Do not sleep directly on the tattoo',
    ],
  },
  {
    num: '03',
    name: 'Weeks 2–4',
    period: 'Settling in',
    summary: 'Surface healing finishes; the ink settles under the skin.',
    do: [
      'Continue moisturising daily',
      'Keep it out of the sun; use SPF once fully healed',
      'Watch for how the ink settles into its final tone',
    ],
    dont: [
      'No tanning beds or prolonged sun exposure',
      'Do not return to heavy equipment that rubs the area',
      'Still no scratching — even when it looks fine',
    ],
  },
  {
    num: '04',
    name: 'Fully Healed',
    period: '6+ weeks',
    summary: 'Your tattoo is now part of you. It still needs a little respect.',
    do: [
      'Moisturise regularly to keep colours deep',
      'Apply SPF 50 when it will see sun — sun is the top cause of fading',
      'Touch-ups are normal after a few years; we plan for that',
    ],
    dont: [
      'Do not expose fresh tattoos to the same sun habits as old ones',
      'Do not be afraid to reach out if anything looks off',
    ],
  },
]

const WARNINGS = [
  'Persistent redness, heat or swelling spreading beyond the tattoo',
  'Streaking red lines moving away from the piece',
  'Oozing or yellow-green discharge after the first days',
  'Fever or chills within a few days of the session',
]

function Aftercare() {
  return (
    <Page title="Oddaka Inksters | Tattoo Aftercare">
      <section className={cn('pt-40 pb-20 lg:pt-48', CONTAINER)}>
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-wide3 text-ink-300">Tattoo Aftercare</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-black uppercase leading-[1.02] tracking-tight text-bone sm:text-6xl lg:text-7xl">
            The healing is <span className="text-outline-strong">half the tattoo.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-300">
            How you care for a tattoo in the first weeks decides how it looks for the first
            decades. Here's the exact routine we give every client.
          </p>
        </Reveal>
      </section>

      <section className="border-t border-ink-700/50 bg-ink-900/30">
        <div className={cn('space-y-0 py-20', CONTAINER)}>
          {PHASES.map((phase, i) => (
            <Reveal key={phase.num}>
              <article className={cn('grid gap-10 py-16 lg:grid-cols-3', i > 0 && 'border-t border-ink-700/40')}>
                <div className="lg:col-span-1">
                  <div className="flex items-baseline gap-5">
                    <span className="font-display text-5xl font-black leading-none text-outline">{phase.num}</span>
                    <div>
                      <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-bone">
                        {phase.name}
                      </h2>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-wide3 text-ink-400">
                        {phase.period}
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-ink-300">{phase.summary}</p>
                </div>
                <div className="grid gap-8 sm:grid-cols-2 lg:col-span-2">
                  <div>
                    <p className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide3 text-[#79b08c]">
                      <Check size={13} /> What to do
                    </p>
                    <ul className="space-y-2.5">
                      {phase.do.map((step) => (
                        <li key={step} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-200">
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#79b08c]" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide3 text-[#b3541e]">
                      <X size={13} /> What to avoid
                    </p>
                    <ul className="space-y-2.5">
                      {phase.dont.map((step) => (
                        <li key={step} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-200">
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#b3541e]" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className={cn('py-24', CONTAINER)}>
        <Reveal>
          <div className="border border-[#b3541e]/40 bg-[#b3541e]/[0.06] p-8 lg:p-10">
            <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-wide3 text-[#e07a3f]">
              <AlertTriangle size={15} /> Warning signs — when to reach out
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {WARNINGS.map((w) => (
                <li key={w} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-200">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#b3541e]" />
                  {w}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-ink-300">
              If anything worries you, message the studio with a photo. Better to ask than to guess —
              and we'd rather look at it than have you wonder.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="mt-16 flex flex-col items-center gap-6 py-10 text-center">
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-bone lg:text-4xl">
              Need help with your tattoo?
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-ink-300">
              Send us a photo of how it's healing. We'll tell you exactly what to do next.
            </p>
            <Button to="/contact" size="lg">
              Contact the studio
            </Button>
          </div>
        </Reveal>
      </section>
    </Page>
  )
}

export default Aftercare