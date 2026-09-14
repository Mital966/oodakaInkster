import { useEffect, useState } from 'react'
import { useToast } from '../../components/admin/Toast'
import FormField, { inputCls } from '../../components/admin/FormField'
import Toggle from '../../components/admin/Toggle'
import UploadDropzone from '../../components/admin/UploadDropzone'
import { useAdminData } from '../../context/AdminDataContext'
import { cn } from '../../utils/cn'
import { uploadWebsiteImage } from '../../data/dataService'

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
  const [occasionImageDesktop, setOccasionImageDesktop] = useState(null)
  const [occasionImageMobile, setOccasionImageMobile] = useState(null)

  useEffect(() => {
    if (settings) {
      setDraft(JSON.parse(JSON.stringify(settings)))
      const osc = settings.homepage?.occasion || {}
      const desktop = osc.imageDesktop || osc.image
      setOccasionImageDesktop(desktop ? { url: desktop, kind: 'existing' } : null)
      setOccasionImageMobile(osc.imageMobile ? { url: osc.imageMobile, kind: 'existing' } : null)
    }
  }, [settings])

  if (!settings || !draft) return null
  const d = draft

  const setUnder = (group, field) => (e) =>
    setDraft((prev) => ({ ...prev, homepage: { ...prev.homepage, [group]: { ...prev.homepage[group], [field]: e.target.value } } }))

  const setOccasion = (field, value) =>
    setDraft((prev) => ({ ...prev, homepage: { ...prev.homepage, occasion: { ...prev.homepage.occasion, [field]: value } } }))

  async function handleNewOccasionImage(value, field) {
    if (!value) {
      if (field === 'imageDesktop') setOccasionImageDesktop(null)
      else setOccasionImageMobile(null)
      setOccasion(field, '')
      return
    }
    if (value.kind === 'file') {
      try {
        const url = await uploadWebsiteImage(value.file)
        if (field === 'imageDesktop') setOccasionImageDesktop({ url, kind: 'existing' })
        else setOccasionImageMobile({ url, kind: 'existing' })
        setOccasion(field, url)
      } catch (err) {
        toast('error', err.message || 'We couldn’t upload that image.')
      }
    } else {
      if (field === 'imageDesktop') setOccasionImageDesktop(value)
      else setOccasionImageMobile(value)
    }
  }

  async function handleSave() {
    try {
      const homepage = JSON.parse(JSON.stringify(d.homepage))
      const pending = []
      if (occasionImageDesktop?.kind === 'file') pending.push(['imageDesktop', occasionImageDesktop.file])
      if (occasionImageMobile?.kind === 'file') pending.push(['imageMobile', occasionImageMobile.file])
      for (const [field, file] of pending) {
        homepage.occasion = { ...homepage.occasion, [field]: await uploadWebsiteImage(file) }
      }
      await updateSettings({ homepage })
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

      <Section title="Occasion banner" subtitle="Festival / celebration banner shown at the top of the homepage. Upload a themed image and colours.">
        <div className="flex items-center justify-between gap-4 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-neutral-900">Show occasion banner</p>
            <p className="text-xs text-neutral-500">Turn the stand-alone greeting banner on or off.</p>
          </div>
          <Toggle on={d.homepage.occasion.enabled} onChange={(on) => setOccasion('enabled', on)} label="Toggle occasion banner" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Title" hint="e.g. Happy Ganesh Puja">
            <input className={inputCls} value={d.homepage.occasion.title} onChange={(e) => setOccasion('title', e.target.value)} placeholder="Happy Ganesh Puja" />
          </Field>
          <Field label="Accent colour" hint="Tints the banner to match the occasion.">
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-10 w-14 cursor-pointer rounded-md border border-neutral-200 bg-neutral-50 p-1"
                value={d.homepage.occasion.accentColor}
                onChange={(e) => setOccasion('accentColor', e.target.value)}
              />
              <input className={cn(inputCls, 'font-mono')} value={d.homepage.occasion.accentColor} onChange={(e) => setOccasion('accentColor', e.target.value)} />
            </div>
          </Field>
        </div>
        <Field label="Subtitle" hint="A short greeting or message under the title.">
          <textarea className={cn(inputCls, 'min-h-[70px] resize-y')} value={d.homepage.occasion.subtitle} onChange={(e) => setOccasion('subtitle', e.target.value)} placeholder="May Lord Ganesha bless your life with wisdom and prosperity" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-neutral-700">Website image</span>
            <UploadDropzone value={occasionImageDesktop} onChange={(v) => handleNewOccasionImage(v, 'imageDesktop')} label="Choose desktop image" previewClass="aspect-video" />
          </div>
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-neutral-700">Mobile image</span>
            <UploadDropzone value={occasionImageMobile} onChange={(v) => handleNewOccasionImage(v, 'imageMobile')} label="Choose mobile image" previewClass="aspect-[3/4]" />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Button label" hint="Leave empty to hide the button.">
            <input className={inputCls} value={d.homepage.occasion.ctaLabel} onChange={(e) => setOccasion('ctaLabel', e.target.value)} placeholder="Greet us / Enquire now" />
          </Field>
          <Field label="Button link">
            <input className={inputCls} value={d.homepage.occasion.ctaUrl} onChange={(e) => setOccasion('ctaUrl', e.target.value)} placeholder="/contact" />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Starts on" hint="Leave blank to show immediately.">
            <input type="date" className={inputCls} value={d.homepage.occasion.startDate} onChange={(e) => setOccasion('startDate', e.target.value)} />
          </Field>
          <Field label="Ends on" hint="Leave blank to stay until you turn it off.">
            <input type="date" className={inputCls} value={d.homepage.occasion.endDate} onChange={(e) => setOccasion('endDate', e.target.value)} />
          </Field>
        </div>
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