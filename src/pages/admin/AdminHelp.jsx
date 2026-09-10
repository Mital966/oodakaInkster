import { ArrowUpRight, BookOpen, KeyRound, Rocket, ShieldCheck, Smartphone } from 'lucide-react'
import { Link } from 'react-router-dom'

const block = 'rounded-lg border border-neutral-200 bg-white p-6 shadow-sm'

function Card({ icon: Icon, title, children }) {
  return (
    <div className={block}>
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-neutral-900 text-neutral-100">
          <Icon size={16} />
        </span>
        <h2 className="font-display text-sm font-bold text-neutral-900">{title}</h2>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-600">{children}</div>
    </div>
  )
}

function Step({ n, title, children }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 font-mono text-[11px] font-bold text-neutral-600">
        {n}
      </span>
      <div>
        <p className="font-semibold text-neutral-800">{title}</p>
        <p className="mt-1 text-neutral-600">{children}</p>
      </div>
    </li>
  )
}

function AdminHelp() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-neutral-900">Help & setup</h1>
        <p className="mt-1 text-sm text-neutral-500">
          A quick guide to running the site — everything in here is a plain step you can repeat on any phone.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card icon={Smartphone} title="Editing the site from your phone">
          <p>Every admin screen is built to work on a phone screen. Open the site on your phone, sign in at
            <code className="mx-1 rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs">/admin/login</code>,
            and use the menu (☰) to move around.</p>
          <p>The mobile drawer has the same sections as the computer sidebar — tattoos, artists, styles, reviews, offers, enquiries, and website settings.</p>
        </Card>

        <Card icon={KeyRound} title="Signing in">
          <p>Use the studio admin email and password set up in Supabase. If you ever get locked out, ask your developer to reset the password from the Supabase dashboard.</p>
          <p>In demo mode (before Supabase is connected) the sign-in details are pre-filled — just press Sign in.</p>
        </Card>

        <Card icon={Rocket} title="Day-to-day publishing (the 3 things)">
          <ul className="list-inside list-disc space-y-2">
            <li><span className="font-semibold">Add a tattoo:</span> Tattoos → Add tattoo → fill title, choose the artist, add the style, upload photos (tap the star to choose the cover) → save.</li>
            <li><span className="font-semibold">Answer an enquiry:</span> Enquiries → read the idea and details → press WhatsApp to reply instantly → mark status.</li>
            <li><span className="font-semibold">Update opening hours:</span> Website → Opening hours → set open/close times → Save.</li>
          </ul>
          <p className="rounded-md bg-neutral-50 p-3 text-xs text-neutral-500">
            Tip: a tattoo is only visible on the public site after it's <span className="font-semibold text-emerald-600">published</span>. You can save things as drafts and publish later.
          </p>
        </Card>

        <Card icon={ShieldCheck} title="Public vs draft content">
          <p>The public site only ever shows approved content:</p>
          <ul className="list-inside list-disc space-y-1.5">
            <li>Published tattoos (drafts are invisible)</li>
            <li>Visible artists and styles</li>
            <li>Published reviews</li>
            <li>Offers with live dates</li>
          </ul>
          <p>Enquiries and reference photos are private and only visible in this admin area.</p>
        </Card>

        <Card icon={BookOpen} title="Go deeper">
          <ol className="space-y-3">
            <Step n={1} title="Connect Supabase">
              Copy the Supabase project URL and anon key into a <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs">.env</code> file (see the README), run the SQL migration and seed script, then restart the app.
            </Step>
            <Step n={2} title="Deploy to Vercel">
              Push the repo to GitHub, import it in Vercel, and add the same environment variables. The admin then talks to your live database.
            </Step>
            <Step n={3} title="Invite your team">
              Add extra studio users from the Supabase dashboard under Authentication → Users. Anyone added with the admin role can sign in here.
            </Step>
          </ol>
          <Link to="/admin/help" className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900">
            Full instructions live in the README <ArrowUpRight size={12} />
          </Link>
        </Card>
      </div>
    </div>
  )
}

export default AdminHelp