// One-time seeding script: pushes the bundled demo content into a real
// Supabase project. Run AFTER applying supabase/schema.sql.
//
// Usage:
//   npm run db:seed
//
// Requires (must be set in .env.local BEFORE this runs — it is server-side code
// reading from process.env, and uses the SERVICE ROLE key. Keep it secret; the
// service-role key must never be used in the browser app):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//
// Everything is upserted with stable ids (tattoo-01, arjun, ...) so the
// existing public URLs (/gallery/tattoo-01) keep working.

import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.')
  console.error('Example (PowerShell):  $env:SUPABASE_URL="https://xxx.supabase.co"; $env:SUPABASE_SERVICE_ROLE_KEY="sb_secret"; npm run db:seed')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { realtime: { transport: ws } })

const read = (p) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))

const tattoos = read('src/data/tattoos.json')
const artists = read('src/data/artists.json')
const reviews = read('src/data/reviews.json')
const enquiries = read('src/data/enquiries.json')
const categoryItems = read('src/data/categories.json')

async function upsert(table, rows, conflicts) {
  const { error } = await supabase.from(table).upsert(rows, { onConflict: conflicts })
  if (error) {
    console.error(`FAILED ${table}:`, error.message)
    process.exitCode = 1
    return
  }
  console.log(`ok   ${table}: ${rows.length} rows`)
}

async function run() {
  console.log('Seeding Oddaka Inksters…\n')

  await upsert(
    'categories',
    categoryItems.map((c, i) => ({
      id: c.id,
      name: c.label,
      slug: c.id,
      display_order: i,
      is_active: true,
    })),
    'id',
  )

  await upsert(
    'artists',
    artists.map((a) => ({
      id: a.id,
      name: a.name,
      slug: a.id,
      role: a.role,
      specialties: a.specialties,
      profile_image: a.portrait,
      bio: a.bio,
      short_bio: a.shortBio,
      experience_years: Number(a.experienceYears) || null,
      instagram_url: a.instagram === '#' ? null : a.instagram,
      featured: a.featured,
      display_order: a.order,
      is_active: true,
    })),
    'id',
  )

  await upsert(
    'tattoos',
    tattoos.map((t) => ({
      id: t.id,
      title: t.title,
      slug: t.id,
      description: t.description,
      design_notes: t.designNotes || null,
      artist_id: t.artistId,
      category_id: t.category,
      style: t.style,
      placement: t.placement || null,
      size: t.size || null,
      price: t.price ?? null,
      sessions: t.sessions ?? null,
      duration: t.duration || null,
      year: t.year ?? null,
      shape: t.shape || '0.85:1',
      featured: t.featured,
      published: t.published,
    })),
    'id',
  )

  const imageRows = []
  const videoRows = []
  for (const t of tattoos) {
    ;(t.photos || []).forEach((url, i) =>
      imageRows.push({
        tattoo_id: t.id,
        image_url: url,
        alt_text: `${t.title} — view ${i + 1}`,
        display_order: i,
        is_cover: i === 0,
      }),
    )
    if (t.video) {
      videoRows.push({
        tattoo_id: t.id,
        video_url: t.video,
        thumbnail_url: t.videoPoster || t.photos?.[0] || null,
        display_order: 0,
      })
    }
  }
  if (imageRows.length) await supabase.from('tattoo_images').upsert(imageRows, { onConflict: 'tattoo_id,display_order' })
  console.log(`ok   tattoo_images: ${imageRows.length} rows`)
  if (videoRows.length) await supabase.from('tattoo_videos').upsert(videoRows, { onConflict: 'tattoo_id,display_order' })
  console.log(`ok   tattoo_videos: ${videoRows.length} rows`)

  await upsert(
    'reviews',
    reviews.map((r) => ({
      id: r.id,
      client_name: r.client,
      review: r.review,
      style: r.style,
      tattoo_id: r.tattooId || null,
      rating: r.rating ?? 5,
      published: true,
      featured: r.rating === 5,
    })),
    'id',
  )

  await upsert(
    'enquiries',
    enquiries.map((e) => ({
      id: e.id,
      customer_name: e.customer,
      phone: e.phone,
      email: e.email || null,
      idea: e.idea,
      style: e.style || null,
      placement: e.placement || null,
      size: e.size || null,
      preferred_date: e.preferredDate || null,
      budget: e.budget || null,
      artist_id: null,
      status: e.status,
      created_at: e.createdAt ? new Date(e.createdAt + 'T00:00:00Z').toISOString() : new Date().toISOString(),
    })),
    'id',
  )

  await upsert(
    'offers',
    [
      {
        id: 'offer-01',
        title: 'Student Tattoo Night',
        description: 'Every Thursday, students get 15% off fine line and single-needle work. Bring a valid ID.',
        image: null,
        cta_label: 'Claim the discount',
        cta_url: '/contact',
        start_date: null,
        end_date: null,
        published: true,
      },
      {
        id: 'offer-02',
        title: 'Cover-Up Consults Free',
        description: 'Book a cover-up consultation and the design session is on us — only pay if you go ahead.',
        image: null,
        cta_label: 'Book a consult',
        cta_url: '/contact',
        start_date: null,
        end_date: null,
        published: false,
      },
    ],
    'id',
  )

  await upsert(
    'site_settings',
    [
      {
        key: 'business',
        value: {
          name: 'ODDAKA INKSTERS',
          tagline: 'Premium Tattoo Studio',
          aboutText:
            'A premium tattoo studio built on craft, honesty and work that ages well. Custom designs, drawn by hand, made to last.',
        },
      },
      {
        key: 'contact',
        value: {
          whatsapp: '917653910386',
          phone: '+91 76539 10386',
          email: 'hello@oddakainksters.in',
          address:
            'Back Side Stairs, Govind Prasad, Plot No-376, 2nd Floor, Samsung Store Building, near Lexicon Institute, Bomikhal, Laxmisagar, Bhubaneswar, Odisha 751006',
          mapsUrl: '',
        },
      },
      {
        key: 'hours',
        value: {
          monday: { open: '10:30', close: '21:00', closed: false },
          tuesday: { open: '10:30', close: '21:00', closed: false },
          wednesday: { open: '10:30', close: '21:00', closed: false },
          thursday: { open: '10:30', close: '21:00', closed: false },
          friday: { open: '10:30', close: '21:00', closed: false },
          saturday: { open: '10:30', close: '21:00', closed: false },
          sunday: { open: '10:30', close: '21:00', closed: false },
        },
      },
      {
        key: 'social',
        value: {
          instagram: 'oddakainksters__',
          instagramUrl: 'https://www.instagram.com/oddakainksters__/',
          facebook: '',
          youtube: '',
        },
      },
      {
        key: 'homepage',
        value: {
          hero: {
            heading: 'YOUR STORY.\nPERMANENTLY INKED.',
            subheading:
              'Custom tattoos · Fine line · Realism · Blackwork · Cover-ups. Designed around you, drawn by hand, made to last.',
            ctaPrimary: 'Book a Consultation',
            ctaSecondary: 'Explore Our Work',
          },
          featured: {
            heading: 'Drawn to live on skin.',
            description:
              'A selection of recent pieces from the studio — every one drawn for a specific person, placement and story.',
          },
          studio: { heading: 'Precision, not promises.', description: 'Any studio can claim experience. These are the standards we hold every session to — no exceptions.' },
          cta: {
            heading: 'Ready to get inked?',
            description: "Tell us your idea. We'll help turn it into something permanent.",
            buttonLabel: 'Start Your Tattoo',
          },
        },
      },
    ],
    'key',
  )

  console.log('\nDone. Demo content is now live in Supabase.')
}

run()