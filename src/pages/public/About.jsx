import { ArrowRight } from 'lucide-react'
import Button from '../../components/common/Button'
import Reveal from '../../components/common/Reveal'
import SectionHeading from '../../components/common/SectionHeading'
import CTASection from '../../components/public/CTASection'
import Page from '../../components/public/Page'
import { cn } from '../../utils/cn'

const CONTAINER = 'mx-auto max-w-8xl px-6 lg:px-10'

const VALUES = [
  {
    title: 'Craft over volume',
    body: 'We book one client at a time, at a pace that lets every design get drawn properly. No assembly lines.',
  },
  {
    title: 'Hygiene is non-negotiable',
    body: 'Single-use needles and tubes, sealed inks, autoclaved equipment and a scrubbed-down station for every single session.',
  },
  {
    title: 'The design comes first',
    body: 'Skin is permanent. Ideas get as much revision time as they need before the first needle touches you.',
  },
  {
    title: 'Honest advice',
    body: "If we think an idea won't age well, we say so — and we redesign it together until it will.",
  },
]

function About() {
  return (
    <Page title="Oddaka Inksters | About the Studio">
      {/* intro */}
      <section className={cn('pt-40 pb-20 lg:pt-48', CONTAINER)}>
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-wide3 text-ink-300">About Oddaka Inksters</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-black uppercase leading-[1.02] tracking-tight text-bone sm:text-6xl lg:text-7xl">
            A studio built on the idea that tattooing is{" "}
            <span className="text-outline-strong">a craft, not a service.</span>
          </h1>
        </Reveal>
        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          <Reveal delay={0.05} className="lg:col-span-7">
            <p className="text-[16px] leading-relaxed text-ink-200">
              Oddaka Inksters started with one bench, one machine and a refusal to rush. Years
              later, the studio is still built the same way — a small team of artists who draw
              everything themselves, in a space that feels more like an atelier than a shop.
            </p>
            <p className="mt-5 text-[16px] leading-relaxed text-ink-200">
              We don't chase trends. We chase work that ages honestly: placed thoughtfully, drawn
              with confidence, and made — always — for a specific person. Whether it's a single
              fine line or a full sleeve, the standard is the same.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5">
            <div className="border border-ink-700/50 bg-ink-900/30 p-8">
              <p className="font-mono text-[10px] uppercase tracking-wide3 text-ink-400">Studio philosophy</p>
              <blockquote className="mt-4 font-display text-xl font-bold leading-snug tracking-tight text-bone lg:text-2xl">
                "A good tattoo is designed the way an idea deserves: slowly, honestly, and on
                paper."
              </blockquote>
              <div className="mt-6 grid grid-cols-2 gap-6 border-t border-ink-700/50 pt-6">
                <div>
                  <p className="font-display text-3xl font-black text-bone">4</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-wide3 text-ink-400">Artists</p>
                </div>
                <div>
                  <p className="font-display text-3xl font-black text-bone">10+</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-wide3 text-ink-400">Years combined craft</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* values */}
      <section className="border-t border-ink-700/50 bg-ink-900/30">
        <div className={cn('py-24 lg:py-32', CONTAINER)}>
          <SectionHeading eyebrow="What we hold to" title={<>The standards, in print.</>} />
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={(i % 2) * 0.06}>
                <div className="group h-full border border-ink-700/50 bg-ink-950/40 p-7 transition-colors duration-300 hover:border-ink-500">
                  <span className="font-mono text-[11px] text-[#b3541e]">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-3 font-display text-lg font-bold uppercase tracking-tight text-bone">
                    {v.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-300">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 grid gap-px overflow-hidden border border-ink-700/50 bg-ink-700/50 sm:grid-cols-3">
            {[
              ['Custom approach', 'Every piece starts as a blank sheet and a conversation. No two designs leave our benches the same.'],
              ['Experience', 'A combined decade-and-a-half of studio practice across realism, blackwork, fine line and traditional.'],
              ['Aftercare', 'Healing follow-ups are part of the booking — we stay in touch until your tattoo is fully settled.'],
            ].map(([t, d]) => (
              <div key={t} className="bg-ink-900/70 p-7">
                <h3 className="font-mono text-[11px] uppercase tracking-wide3 text-bone">{t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-300">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Come see the studio."
        text="Consultation first, always — walk through the project, meet your artist, and see the space where the work happens."
        buttonLabel="Book a Consultation"
      />
    </Page>
  )
}

export default About