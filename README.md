# Oddaka Inksters — Studio Website & Admin CMS

A production website for **Oddaka Inksters**, a premium tattoo studio in Bhubaneswar, built with
React (Vite), Tailwind CSS, React Router and **Supabase** (Postgres, Auth, Storage + RLS).

The public site (gallery, artists, about, contact, aftercare) and a **no-code admin CMS** are in
one app. The studio owner manages every piece of content from their phone — tattoos, photos and
videos, artists, styles, reviews, offers, enquiries and website text — with zero code involved.

---

## Quick start (local demo mode)

The app runs fully without a database in **local demo mode**: data is served from the bundled demo
content, and admin edits are saved to your browser. Use this to explore the UI and the admin.

```bash
npm install
npm run dev        # http://localhost:5173
```

- Public site: `http://localhost:5173`
- Admin: `http://localhost:5173/admin/login` (demo credentials are pre-filled — just press **Sign in**)

Other commands:

```bash
npm run build      # production build (Vite)
npm run lint       # lint (oxlint)
npm run db:seed    # seed demo content into Supabase (server-side)
```

---

## Going live with Supabase

### 1. Create the database

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and run it.
   This creates all tables, indexes, Row Level Security policies, storage buckets and helper
   functions.
3. Open **Authentication → Users** and create the admin account (`hello@oddakainksters.in`).
   A new signup automatically gets the **admin** role via a trigger in the schema.

### 2. Seed the demo content (optional)

The public site ships with a demo portfolio (`tattoo-01` … `tattoo-17`, artists, reviews, styles,
enquiries and default website text). To load it into your real database:

```bash
# PowerShell
$env:SUPABASE_URL="https://<project-ref>.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
npm run db:seed
```

> The service-role key is **server-side only** — never put it in a browser-facing `.env`.

> Seeding is optional. You can skip it and add content manually from the admin instead.

### 3. Configure the app

Create `.env` in the project root (see `.env.example`):

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

When both are present, the app automatically switches to the live Supabase backend. Without them,
it keeps running in local demo mode — useful for design work.

### 4. Deploy on Vercel

1. Push this repo to GitHub.
2. Import it in Vercel (framework: Vite).
3. Add the two environment variables above (supabase URL + anon key) under **Environment Variables**.
4. Deploy. The admin is now live at `your-domain.com/admin/login`.

---

## Using the admin (for the studio owner)

Sign in at `/admin/login`. Everything works on a phone.

| Section | What you manage |
| --- | --- |
| **Tattoos** | Add/edit pieces, upload photos (peace order, pick the cover), add healing videos, style, artist, category, publish/draft, homepage feature |
| **Artists** | Profiles, portraits, specialties, visibility on the site |
| **Styles** | The gallery’s filter categories, with reorder + visibility |
| **Reviews** | Client stories shown on the homepage; keep drafts hidden until approved |
| **Offers** | Promotions with start/end dates and a button — only live offers show publicly |
| **Enquiries** | Leads from the contact page, status pipeline (NEW → … → COMPLETED), WhatsApp reply, reference-image viewer |
| **Website** | Studio name, logo, contact details, opening hours, socials |
| **Homepage** | Hero headline, subheading, buttons and section text |

Rules of thumb:

- A tattoo only appears on the public site when **Published** is on.
- Artists/styles/reviews can be **Hidden** (drafts) without deleting them.
- Enquiries and reference photos are **private** — only visible in the admin.

---

## Architecture

```
src/
  services/            # data layer (the only place that talks to the outside)
    client.js          #   Supabase client bootstrap; ready when env vars exist
    defaults.js        #   default website settings + merge helper
    local.js           #   local demo backend (browser/localStorage)
    remote.js          #   Supabase backend (Postgres + Storage)
    index.js           #   façade — picks local or remote automatically
  data/dataService.js  # public data API (kept stable so pages never change)
  context/
    AuthContext.jsx    #   Supabase Auth + demo login fallback
    AdminDataContext.jsx # single source of truth for admin state
  pages/               # public + admin pages
  components/          # shared UI (public + admin)
supabase/schema.sql    # full migration: tables, RLS, storage, triggers
scripts/seed.mjs       # server-side demo seeding (service role)
```

### Data safety

- **RLS is on** for every table. The public site can only read `published`, `is_active` and
  in-date content. Enquiries are **write-only** from the public form and **read-only** in admin.
- Photos/videos live in public storage buckets (`tattoos`, `artists`, `reviews`, `website`).
- Enquiry reference images live in a **private** bucket (`enquiries`); the admin fetches short-lived
  signed URLs, so images never leak publicly.
- Media changes rewrite the per-tattoo image/video rows after uploading/cleanup, which keeps
  ordering and the cover consistent (ids are stable text slugs, so public URLs never break).
- The admin resolves duplicate/missing fields gracefully and surfaces **friendly error messages**
  instead of stack traces.

---

## Troubleshooting

- **Admin falls back to demo mode** → `.env` is missing or the variables are empty. Add
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` and restart `npm run dev`.
- **Sign-in fails** → confirm the profile trigger ran (check `profiles` table for your user) and
  that the user exists under **Authentication → Users**.
- **Public page shows “Something went wrong”** → check the browser console; usually a migration
  hasn’t been applied or a table name differs from `schema.sql`.
- **Images don’t upload** → confirm the storage buckets and policies from `schema.sql` exist;
  file size caps are 8 MB per image and 200 MB per video.
- **Node engine warning** → this project targets Node `20.19+` / `22.12+` (Vite 7 requirement).