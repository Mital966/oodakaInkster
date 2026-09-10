import { useEffect, useState } from 'react'
import UploadDropzone from '../../components/admin/UploadDropzone'
import { useToast } from '../../components/admin/Toast'
import FormField, { inputCls } from '../../components/admin/FormField'
import Toggle from '../../components/admin/Toggle'
import { useAdminData } from '../../context/AdminDataContext'
import { cn } from '../../utils/cn'
import { uploadWebsiteImage } from '../../data/dataService'

const block =
  'rounded-lg border border-neutral-200 bg-white p-6 shadow-sm'

function Section({ title, subtitle, children }) {
  return (
    <section className={block}>
      <h2 className="font-display text-sm font-bold text-neutral-900">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-neutral-400">{subtitle}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  )
}

function Field({ label, hint, error, children }) {
  return <FormField label={label} hint={hint} error={error}>{children}</FormField>
}

function LogoField({ value, onChange }) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold text-neutral-700">Header logo</span>
      {value ? (
        <div className="flex items-center gap-4 rounded-md border border-neutral-200 p-3">
          <img src={value} alt="" className="h-10 w-10 rounded-md object-contain ring-1 ring-neutral-100" />
          <p className="text-xs text-neutral-500">Logo is live on the site.</p>
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={() => onChange(null)} className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50">
              Remove
            </button>
          </div>
        </div>
      ) : (
        <UploadDropzone value={null} onChange={onChange} label="Upload a logo" previewClass="aspect-[3/1] max-w-xs" />
      )}
    </div>
  )
}

function HoursEditor({ value, onChange }) {
  return (
    <div className="space-y-2">
      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
        const d = value[day] || { open: '10:30', close: '21:00', closed: false }
        return (
          <div key={day} className="flex flex-wrap items-center gap-3 rounded-md border border-neutral-200 px-3.5 py-2.5">
            <span className="w-24 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">{day}</span>
            <Toggle on={!d.closed} onChange={(on) => onChange(day, { ...d, closed: !on })} label={`${day} open`} />
            <span className="text-xs text-neutral-400">{d.closed ? 'Closed' : 'Open'}</span>
            {!d.closed && (
              <div className="ml-auto flex items-center gap-2">
                <input type="time" value={d.open} onChange={(e) => onChange(day, { ...d, open: e.target.value })} className={cn(inputCls, 'w-auto px-2 py-1.5')} aria-label={`${day} open time`} />
                <span className="text-xs text-neutral-400">to</span>
                <input type="time" value={d.close} onChange={(e) => onChange(day, { ...d, close: e.target.value })} className={cn(inputCls, 'w-auto px-2 py-1.5')} aria-label={`${day} close time`} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function AdminWebsite() {
  const { settings, updateSettings } = useAdminData()
  const { toast } = useToast()
  const [draft, setDraft] = useState(null)

  useEffect(() => {
    if (settings) setDraft(JSON.parse(JSON.stringify(settings)))
  }, [settings])

  if (!settings || !draft) return null
  const d = draft
  const setBiz = (f) => (e) => setDraft((prev) => ({ ...prev, business: { ...prev.business, [f]: e.target.value } }))
  const setContact = (f) => (e) => setDraft((prev) => ({ ...prev, contact: { ...prev.contact, [f]: e.target.value } }))
  const setSocial = (f) => (e) => setDraft((prev) => ({ ...prev, social: { ...prev.social, [f]: e.target.value } }))

  async function handleSave() {
    try {
      await updateSettings({ business: d.business, contact: d.contact, hours: d.hours, social: d.social })
      toast('success', 'Website details saved.')
    } catch (err) {
      toast('error', err.message || 'We couldn’t save that. Please try again.')
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-neutral-900">Website settings</h1>
          <p className="mt-1 text-sm text-neutral-500">Business details, contact info, hours and socials shown across the public site.</p>
        </div>
        <button type="button" onClick={handleSave} className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-neutral-100 transition-colors hover:bg-neutral-800">
          Save changes
        </button>
      </div>

      <Section title="Business" subtitle="Who you are — the name, tagline and a short introduction.">
        <Field label="Studio name">
          <input className={inputCls} value={d.business.name} onChange={setBiz('name')} />
        </Field>
        <Field label="Tagline">
          <input className={inputCls} value={d.business.tagline} onChange={setBiz('tagline')} />
        </Field>
        <Field label="About text" hint="Used on the About page and as the site's default description.">
          <textarea className={cn(inputCls, 'min-h-[90px] resize-y')} value={d.business.aboutText} onChange={setBiz('aboutText')} />
        </Field>
        <LogoField
          value={d.business.logo}
          onChange={async (value) => {
            if (!value) {
              setDraft((prev) => ({ ...prev, business: { ...prev.business, logo: null } }))
              return
            }
            try {
              const url = await uploadWebsiteImage(value.file)
              setDraft((prev) => ({ ...prev, business: { ...prev.business, logo: url } }))
            } catch (err) {
              toast('error', err.message || 'We couldn’t upload that logo.')
            }
          }}
        />
      </Section>

      <Section title="Contact" subtitle="What clients see when they need to reach you.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="WhatsApp number (with country code)" hint="Used by the Chat button on the contact page.">
            <input className={inputCls} value={d.contact.whatsapp} onChange={setContact('whatsapp')} placeholder="917653910386" />
          </Field>
          <Field label="Phone">
            <input className={inputCls} value={d.contact.phone} onChange={setContact('phone')} placeholder="+91 76539 10386" />
          </Field>
          <Field label="Email">
            <input className={inputCls} value={d.contact.email} onChange={setContact('email')} placeholder="hello@..." />
          </Field>
          <Field label="Google Maps link" hint="Opens in the Map button on the contact page.">
            <input className={inputCls} value={d.contact.mapsUrl} onChange={setContact('mapsUrl')} placeholder="https://maps.app.goo.gl/..." />
          </Field>
        </div>
        <Field label="Studio address">
          <textarea className={cn(inputCls, 'min-h-[70px] resize-y')} value={d.contact.address} onChange={setContact('address')} />
        </Field>
      </Section>

      <Section title="Opening hours" subtitle="Daily open and close times shown on the contact page.">
        <HoursEditor
          value={d.hours}
          onChange={(day, patch) => setDraft((prev) => ({ ...prev, hours: { ...prev.hours, [day]: patch } }))}
        />
      </Section>

      <Section title="Social" subtitle="Links shown in the site footer.">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Instagram handle">
            <input className={inputCls} value={d.social.instagram} onChange={setSocial('instagram')} placeholder="@handle" />
          </Field>
          <Field label="Instagram URL">
            <input className={inputCls} value={d.social.instagramUrl} onChange={setSocial('instagramUrl')} placeholder="https://instagram.com/..." />
          </Field>
          <Field label="YouTube">
            <input className={inputCls} value={d.social.youtube} onChange={setSocial('youtube')} placeholder="(optional)" />
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

export default AdminWebsite