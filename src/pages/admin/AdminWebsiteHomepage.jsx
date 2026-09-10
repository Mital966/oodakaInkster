import { useEffect, useState } from 'react'
import { useToast } from '../../components/admin/Toast'
import FormField, { inputCls } from '../../components/admin/FormField'
import { useAdminData } from '../../context/AdminDataContext'
import { cn } from '../../utils/cn'

const block = 'rounded-lg border border-neutral-200 bg-white p-6 shadow-sm'

function Section({ title, subtitle, children }) {
  return (
    <section className={block}>
      <h2 className="font-display text-sm font-bold text-neutral-900">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-neutral-400">{subtitle}</p>}
      <div className="mt-5 grid gap-5">{children}</div>
    </section>
  )
}

function Field({ label, hint, children }) {
  return (
    <FormField label={label} hint={hint}>
      {children}
    </FormField>
  )
}

function AdminWebsiteHomepage() {
  const { settings, updateSettings } = useAdminData()
  const { toast } = useToast()
  const [draft, setDraft] = useState(null)

  useEffect(() => {
    if (settings) setDraft(JSON.parse(JSON.stringify(settings)))
  }, [settings])

  if (!settings || !draft) return null
  const d = draft

  const setUnder = (group, field) => (e) =>
    setDraft((prev) => ({ ...prev, homepage: { ...prev.homepage, [group]: { ...prev.homepage[group], [field]: e.target.value } } }))

  async function handleSave() {
    try {
      await updateSettings({ homepage: d.homepage })
      toast('success', 'Homepage content saved.')
    } catch (err) {
      toast('error', err.message || 'We couldn’t save that. Please try again.')
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-neutral-900">Homepage content</h1>
          <p className="mt-1 text-sm text-neutral-500">
            The headline, intro text and message buttons clients see on the landing page.
          </p>
        </div>
        <button type="button" onClick={handleSave} className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-neutral-100 transition-colors hover:bg-neutral-800">
          Save changes
        </button>
      </div>

      <Section title="Hero" subtitle="The big first screen of the site.">
        <Field label="Eyebrow line" hint="This is currently a fixed line on the site.">
          <input className={cn(inputCls, 'bg-neutral-100 text-neutral-400')} defaultValue="Oddaka Inksters — Custom Tattoo Studio" readOnly />
        </Field>
        <Field label="Headline" hint="Use a new line for each line of the headline. Two lines work best.">
          <textarea className={cn(inputCls, 'min-h-[70px] resize-y')} value={d.homepage.hero.heading} onChange={setUnder('hero', 'heading')} placeholder="YOUR STORY.&#10;PERMANENTLY INKED." />
        </Field>
        <Field label="Subheading">
          <textarea className={cn(inputCls, 'min-h-[70px] resize-y')} value={d.homepage.hero.subheading} onChange={setUnder('hero', 'subheading')} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Primary button">
            <input className={inputCls} value={d.homepage.hero.ctaPrimary} onChange={setUnder('hero', 'ctaPrimary')} placeholder="Book a Consultation" />
          </Field>
          <Field label="Secondary button">
            <input className={inputCls} value={d.homepage.hero.ctaSecondary} onChange={setUnder('hero', 'ctaSecondary')} placeholder="Explore Our Work" />
          </Field>
        </div>
      </Section>

      <Section title="Featured work" subtitle="Shown above the latest pieces.">
        <Field label="Heading">
          <input className={inputCls} value={d.homepage.featured.heading} onChange={setUnder('featured', 'heading')} />
        </Field>
        <Field label="Description">
          <textarea className={cn(inputCls, 'min-h-[70px] resize-y')} value={d.homepage.featured.description} onChange={setUnder('featured', 'description')} />
        </Field>
      </Section>

      <Section title="Studio intro" subtitle="The 'Why Oddaka' section.">
        <Field label="Heading">
          <input className={inputCls} value={d.homepage.studio.heading} onChange={setUnder('studio', 'heading')} />
        </Field>
        <Field label="Description">
          <textarea className={cn(inputCls, 'min-h-[70px] resize-y')} value={d.homepage.studio.description} onChange={setUnder('studio', 'description')} />
        </Field>
      </Section>

      <Section title="Final call to action" subtitle="The last section before the footer.">
        <Field label="Heading">
          <input className={inputCls} value={d.homepage.cta.heading} onChange={setUnder('cta', 'heading')} />
        </Field>
        <Field label="Description">
          <input className={inputCls} value={d.homepage.cta.description} onChange={setUnder('cta', 'description')} />
        </Field>
        <Field label="Button label">
          <input className={inputCls} value={d.homepage.cta.buttonLabel} onChange={setUnder('cta', 'buttonLabel')} placeholder="Start Your Tattoo" />
        </Field>
      </Section>

      <div className="flex justify-end">
        <button type="button" onClick={handleSave} className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-neutral-100 transition-colors hover:bg-neutral-800">
          Save changes
        </button>
      </div>
    </div>
  )
}

export default AdminWebsiteHomepage