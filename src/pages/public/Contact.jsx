import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Clock, ImageUp, Mail, MapPin, MessageCircle, Phone, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Button from '../../components/common/Button'
import Reveal from '../../components/common/Reveal'
import Spinner from '../../components/common/Spinner'
import Page from '../../components/public/Page'
import { BUDGET_RANGES, SITE } from '../../config/site'
import { createEnquiry, getArtists, getCategories } from '../../data/dataService'
import { useDataQuery } from '../../hooks/useDataQuery'
import { cn } from '../../utils/cn'
import { buildWhatsAppLink, whatsAppEnquiry } from '../../utils/wa'

const PLACEMENTS = [
  'Arm', 'Forearm', 'Wrist', 'Hand', 'Shoulder', 'Chest', 'Ribside', 'Back', 'Shoulder Blade',
  'Leg', 'Thigh', 'Calf', 'Ankle', 'Foot', 'Neck', 'Other',
]
const SIZES = ['Small', 'Medium', 'Large', 'Full Sleeve', 'Back Piece', 'Not sure yet']
const EMPTY = {
  name: '',
  phone: '',
  email: '',
  idea: '',
  style: '',
  placement: '',
  size: '',
  preferredDate: '',
  budget: '',
  artist: '',
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-wide3 text-ink-300">
        {label}
      </span>
      {children}
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 block text-xs text-[#e07a3f]"
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  )
}

const inputCls = (invalid) =>
  cn(
    'w-full border bg-ink-900/60 px-4 py-3 text-sm text-bone outline-none transition-colors placeholder:text-ink-500',
    invalid ? 'border-[#b3541e] focus:border-[#e07a3f]' : 'border-ink-600 focus:border-bone',
  )

function Contact() {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ ...EMPTY, artist: searchParams.get('artist') || '' })
  const [errors, setErrors] = useState({})
  const [reference, setReference] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const fileRef = useRef(null)

  const { data, loading } = useDataQuery(
    () =>
      Promise.all([getCategories(), getArtists()]).then(([categories, artists]) => ({
        categories,
        artists,
      })),
    [],
  )

  const styles = useMemo(() => (data ? ['Not sure yet', ...data.categories.map((c) => c.label)] : ['Not sure yet']), [data])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const clearError = (key) => setErrors((prev) => {
    const next = { ...prev }
    delete next[key]
    return next
  })

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Your name is required'
    if (!/^[+\d][\d\s-]{7,}$/.test(form.phone.trim())) e.phone = 'Enter a valid WhatsApp number'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email'
    if (form.idea.trim().length < 10) e.idea = 'Tell us a little about the idea (at least 10 characters)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    await createEnquiry({
      ...form,
      idea: form.idea.trim(),
      size: form.size || 'Not sure yet',
      style: form.style || 'Not sure yet',
      preferredDate: form.preferredDate || null,
      budget: form.budget || 'Not sure yet',
      artist: form.artist || null,
    })
    setSubmitting(false)
    setDone(true)
  }

  const waMessage = whatsAppEnquiry(form)

  if (done) {
    return (
      <Page title="Enquiry Sent | Oddaka Inksters">
        <section className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-6 pt-40 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-[#79b08c]/50 text-[#79b08c]">
              <CheckCircle2 size={28} strokeWidth={1.5} />
            </span>
            <h1 className="mt-7 font-display text-4xl font-black uppercase tracking-tight text-bone lg:text-5xl">
              Enquiry received.
            </h1>
            <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-ink-300">
              Thanks, {form.name.split(' ')[0]}. The studio will review your idea and get back to
              you on WhatsApp within a day or two to set up your consultation.
            </p>
            <div className="mt-9 flex flex-col items-center gap-3">
              <Button href={buildWhatsAppLink(waMessage)} size="lg" variant="outline">
                <MessageCircle size={15} /> Skip the wait — chat now
              </Button>
              <Button to="/gallery" variant="ghost" size="sm">
                Keep looking at the work
              </Button>
            </div>
          </motion.div>
        </section>
      </Page>
    )
  }

  if (loading || !data) {
    return (
      <Page title="Oddaka Inksters | Contact">
        <div className="pt-40">
          <Spinner label="Opening the studio" />
        </div>
      </Page>
    )
  }

  return (
    <Page title="Oddaka Inksters | Book a Consultation">
      <section className={cn('pt-40 pb-24 lg:pt-48', 'mx-auto max-w-8xl px-6 lg:px-10')}>
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-wide3 text-ink-300">Book a Consultation</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-black uppercase leading-[1.02] tracking-tight text-bone sm:text-6xl lg:text-7xl">
            Start your <span className="text-outline-strong">tattoo.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-300">
            Fill in what you know about the idea. If you're not sure yet, leave the details blank —
            the consultation is where we figure it out together.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-12 lg:grid-cols-12">
          {/* form */}
          <Reveal delay={0.05} className="lg:col-span-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Your name *" error={errors.name}>
                  <input className={inputCls(errors.name)} value={form.name} onChange={(e) => { set('name')(e); clearError('name') }} placeholder="Full name" autoComplete="name" />
                </Field>
                <Field label="WhatsApp number *" error={errors.phone}>
                  <input className={inputCls(errors.phone)} value={form.phone} onChange={(e) => { set('phone')(e); clearError('phone') }} placeholder="+91 ..." type="tel" inputMode="tel" autoComplete="tel" />
                </Field>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Email *" error={errors.email}>
                  <input className={inputCls(errors.email)} value={form.email} onChange={(e) => { set('email')(e); clearError('email') }} placeholder="you@example.com" type="email" autoComplete="email" />
                </Field>
                <Field label="Preferred artist">
                  <select className={cn(inputCls(false), 'cursor-pointer appearance-none')} value={form.artist} onChange={set('artist')}>
                    <option value="">No preference</option>
                    {data.artists.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} — {a.specialties.join(' / ')}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Tattoo idea *" error={errors.idea}>
                <textarea
                  className={cn(inputCls(errors.idea), 'min-h-[120px] resize-y')}
                  value={form.idea}
                  onChange={(e) => { set('idea')(e); clearError('idea') }}
                  placeholder="What are you thinking? Subject, meaning, references — anything you have."
                />
              </Field>

              <div className="grid gap-6 sm:grid-cols-3">
                <Field label="Tattoo style">
                  <select className={cn(inputCls(false), 'cursor-pointer appearance-none')} value={form.style} onChange={set('style')}>
                    {styles.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Body placement">
                  <select className={cn(inputCls(false), 'cursor-pointer appearance-none')} value={form.placement} onChange={set('placement')}>
                    <option value="">Not decided</option>
                    {PLACEMENTS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Approx. size">
                  <select className={cn(inputCls(false), 'cursor-pointer appearance-none')} value={form.size} onChange={set('size')}>
                    {SIZES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Preferred date">
                  <input className={inputCls(false)} type="date" value={form.preferredDate} onChange={set('preferredDate')} />
                </Field>
                <Field label="Budget range">
                  <select className={cn(inputCls(false), 'cursor-pointer appearance-none')} value={form.budget} onChange={set('budget')}>
                    <option value="">Flexible</option>
                    {BUDGET_RANGES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Reference image (optional)">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) setReference({ file: f, url: URL.createObjectURL(f) })
                  }}
                />
                {reference ? (
                  <div className="flex items-center gap-4 border border-ink-600 bg-ink-900/60 p-3">
                    <img src={reference.url} alt="" className="h-16 w-16 rounded-sm object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-bone">{reference.file.name}</p>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide3 text-ink-400">
                        {Math.round(reference.file.size / 1024)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setReference(null); if (fileRef.current) fileRef.current.value = '' }}
                      aria-label="Remove reference image"
                      className="rounded-md p-2 text-ink-400 transition-colors hover:bg-ink-800 hover:text-bone"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex w-full items-center justify-center gap-3 border border-dashed border-ink-600 bg-ink-900/30 px-4 py-6 text-sm text-ink-300 transition-colors hover:border-ink-400 hover:text-bone"
                  >
                    <ImageUp size={16} /> Upload a sketch or reference
                  </button>
                )}
              </Field>

              <div className="flex flex-col items-start justify-between gap-5 border-t border-ink-700/50 pt-8 sm:flex-row sm:items-center">
                <p className="max-w-sm text-xs leading-relaxed text-ink-400">
                  This message goes straight to the studio's enquiry queue. We reply on WhatsApp,
                  usually within a day.
                </p>
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send Enquiry'} <ArrowRight size={15} />
                </Button>
              </div>
            </form>
          </Reveal>

          {/* aside */}
          <div className="lg:col-span-4">
            <div className="space-y-5 lg:sticky lg:top-28">
              <Reveal delay={0.1}>
                <a
                  href={buildWhatsAppLink(waMessage)}
                  className="group block border border-[#4f9e57]/40 bg-[#4f9e57]/10 p-7 transition-colors hover:border-[#4f9e57]"
                >
                  <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-wide3 text-[#79c685]">
                    <MessageCircle size={15} /> Chat on WhatsApp
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-200">
                    Prefer a quick chat? Your details are already pre-filled into a ready-to-send
                    enquiry message.
                  </p>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-wide3 text-ink-400 underline-offset-4 transition-colors group-hover:text-bone group-hover:underline">
                    Open the chat →
                  </p>
                </a>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="divide-y divide-ink-700/50 border border-ink-700/50 bg-ink-900/30">
                  <div className="flex items-start gap-4 p-6">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-ink-400" />
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wide3 text-ink-400">Studio</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-200">{SITE.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-6">
                    <Clock size={16} className="mt-0.5 shrink-0 text-ink-400" />
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wide3 text-ink-400">Hours</p>
                      <div className="mt-1.5 space-y-1">
                        {SITE.hours.map((h) => (
                          <p key={h.days} className="text-sm text-ink-200">
                            <span className="text-ink-400">{h.days}</span> — {h.time}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-6">
                    <Phone size={16} className="mt-0.5 shrink-0 text-ink-400" />
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wide3 text-ink-400">Call</p>
                      <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="mt-1.5 block text-sm text-ink-200 hover:text-bone">
                        {SITE.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-6">
                    <Mail size={16} className="mt-0.5 shrink-0 text-ink-400" />
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wide3 text-ink-400">General</p>
                      <a href={`mailto:${SITE.email}`} className="mt-1.5 block text-sm text-ink-200 hover:text-bone">
                        {SITE.email}
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </Page>
  )
}

export default Contact