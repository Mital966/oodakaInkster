-- ============================================================================
-- ODDAKA INKSTERS — Supabase schema (PostgreSQL)
-- Primary source of truth for the database. Reproducible migration.
--
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- Storage buckets are created at the end; create them in the dashboard too if
-- the SQL editor path is unavailable for buckets.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- EXTENSIONS
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- PROFILES (mirrors auth.users for admin/editor accounts)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'admin' check (role in ('admin', 'editor')),
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- CATEGORIES
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id            text primary key,              -- slug, e.g. 'fine-line'
  name          text not null,
  slug          text unique not null,
  description   text,
  image         text,
  display_order integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- ARTISTS
-- ----------------------------------------------------------------------------
create table if not exists public.artists (
  id              text primary key,            -- slug, e.g. 'arjun'
  name            text not null,
  slug            text unique not null,
  role            text,
  specialties     text[] not null default '{}',
  profile_image   text,
  bio             text,
  short_bio       text,
  experience_years integer,
  instagram_url   text,
  featured        boolean not null default false,
  display_order   integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TATTOOS
-- ----------------------------------------------------------------------------
create table if not exists public.tattoos (
  id            text primary key default gen_random_uuid()::text,
  title         text not null,
  slug          text unique not null,
  description   text,
  design_notes  text,
  artist_id     text references public.artists (id) on delete set null,
  category_id   text references public.categories (id) on delete set null,
  style         text,                           -- display label, e.g. 'Fine Line'
  placement     text,
  size          text,
  price         numeric,
  sessions      integer,
  duration      text,
  year          integer,
  shape         text default '0.85:1',
  featured      boolean not null default false,
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TATTOO MEDIA
-- ----------------------------------------------------------------------------
create table if not exists public.tattoo_images (
  id            uuid primary key default gen_random_uuid(),
  tattoo_id     text not null references public.tattoos (id) on delete cascade,
  image_url     text not null,
  alt_text      text,
  display_order integer not null default 0,
  is_cover      boolean not null default false,
  created_at    timestamptz not null default now()
);

create table if not exists public.tattoo_videos (
  id            uuid primary key default gen_random_uuid(),
  tattoo_id     text not null references public.tattoos (id) on delete cascade,
  video_url     text not null,
  thumbnail_url text,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- REVIEWS
-- ----------------------------------------------------------------------------
create table if not exists public.reviews (
  id            text primary key default gen_random_uuid()::text,
  client_name   text not null,
  review        text not null,
  style         text,
  tattoo_id     text references public.tattoos (id) on delete set null,
  photo         text,
  rating        integer not null default 5 check (rating between 1 and 5),
  published     boolean not null default true,
  featured      boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- ENQUIRIES (private — never publicly readable)
-- ----------------------------------------------------------------------------
create table if not exists public.enquiries (
  id              text primary key default gen_random_uuid()::text,
  customer_name   text not null,
  phone           text not null,
  email           text,
  idea            text,
  style           text,
  placement       text,
  size            text,
  preferred_date  date,
  budget          text,
  artist_id       text references public.artists (id) on delete set null,
  reference_image text,                          -- storage path, kept private
  message         text,
  status          text not null default 'NEW'
                  check (status in ('NEW','CONTACTED','CONSULTATION','BOOKED','COMPLETED','CANCELLED','ARCHIVED')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- OFFERS / PROMOTIONS
-- ----------------------------------------------------------------------------
create table if not exists public.offers (
  id          text primary key default gen_random_uuid()::text,
  title       text not null,
  description text,
  image       text,
  cta_label   text default 'Enquire now',
  cta_url     text default '/contact',
  start_date  date,
  end_date    date,
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- SITE SETTINGS (JSON groups — business, contact, hours, social, homepage)
-- ----------------------------------------------------------------------------
create table if not exists public.site_settings (
  key        text primary key,                  -- 'business' | 'contact' | 'hours' | 'social' | 'homepage'
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- INDEXES
-- ----------------------------------------------------------------------------
create index if not exists idx_tattoos_published     on public.tattoos (published);
create index if not exists idx_tattoos_featured      on public.tattoos (featured);
create index if not exists idx_tattoos_artist    on public.tattoos (artist_id);
create index if not exists idx_tattoos_category      on public.tattoos (category_id);
create index if not exists idx_images_tattoo         on public.tattoo_images (tattoo_id, display_order);
create index if not exists idx_videos_tattoo         on public.tattoo_videos (tattoo_id, display_order);
create index if not exists idx_reviews_published     on public.reviews (published);
create index if not exists idx_enquiries_status      on public.enquiries (status);
create index if not exists idx_offers_published      on public.offers (published);
create index if not exists idx_artists_active        on public.artists (is_active, display_order);
create index if not exists idx_categories_active     on public.categories (is_active, display_order);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.categories    enable row level security;
alter table public.artists       enable row level security;
alter table public.tattoos       enable row level security;
alter table public.tattoo_images enable row level security;
alter table public.tattoo_videos enable row level security;
alter table public.reviews       enable row level security;
alter table public.enquiries     enable row level security;
alter table public.offers        enable row level security;
alter table public.site_settings enable row level security;

-- helper: is the current user an authenticated admin/editor? (direct column read,
-- roles are only manageable by the owner/service role, so RLS on profiles keeps them safe)
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'editor')
  );
$$;

-- Profiles: users may only read/update their own row.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Every new auth user automatically becomes an admin in profiles (single-owner
-- studio CMS). Deactivate users in Authentication → Users if staff leave.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'admin')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Public read-only content
drop policy if exists "categories_read_public" on public.categories;
create policy "categories_read_public" on public.categories
  for select using (true);

drop policy if exists "artists_read_public" on public.artists;
create policy "artists_read_public" on public.artists
  for select using (true);

drop policy if exists "tattoos_read_public" on public.tattoos;
create policy "tattoos_read_public" on public.tattoos
  for select using (published = true);

drop policy if exists "tattoo_images_read_public" on public.tattoo_images;
create policy "tattoo_images_read_public" on public.tattoo_images
  for select using (exists (
    select 1 from public.tattoos t
    where t.id = tattoo_id and t.published = true
  ));

drop policy if exists "tattoo_videos_read_public" on public.tattoo_videos;
create policy "tattoo_videos_read_public" on public.tattoo_videos
  for select using (exists (
    select 1 from public.tattoos t
    where t.id = tattoo_id and t.published = true
  ));

drop policy if exists "reviews_read_public" on public.reviews;
create policy "reviews_read_public" on public.reviews
  for select using (published = true);

drop policy if exists "offers_read_public" on public.offers;
create policy "offers_read_public" on public.offers
  for select using (published = true);

drop policy if exists "site_settings_read_public" on public.site_settings;
create policy "site_settings_read_public" on public.site_settings
  for select using (true);

-- Enquiries: visitors may submit, only staff may read/change.
drop policy if exists "enquiries_insert_public" on public.enquiries;
create policy "enquiries_insert_public" on public.enquiries
  for insert with check (true);

drop policy if exists "enquiries_read_staff" on public.enquiries;
create policy "enquiries_read_staff" on public.enquiries
  for select using (public.is_staff());

drop policy if exists "enquiries_update_staff" on public.enquiries;
create policy "enquiries_update_staff" on public.enquiries
  for update using (public.is_staff());

drop policy if exists "enquiries_delete_staff" on public.enquiries;
create policy "enquiries_delete_staff" on public.enquiries
  for delete using (public.is_staff());

-- Staff-only write access on managed content.
drop policy if exists "categories_write_staff" on public.categories;
create policy "categories_write_staff" on public.categories
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "artists_write_staff" on public.artists;
create policy "artists_write_staff" on public.artists
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "tattoos_write_staff" on public.tattoos;
create policy "tattoos_write_staff" on public.tattoos
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "tattoo_images_write_staff" on public.tattoo_images;
create policy "tattoo_images_write_staff" on public.tattoo_images
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "tattoo_videos_write_staff" on public.tattoo_videos;
create policy "tattoo_videos_write_staff" on public.tattoo_videos
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "reviews_write_staff" on public.reviews;
create policy "reviews_write_staff" on public.reviews
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "offers_write_staff" on public.offers;
create policy "offers_write_staff" on public.offers
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "site_settings_write_staff" on public.site_settings;
create policy "site_settings_write_staff" on public.site_settings
  for all using (public.is_staff()) with check (public.is_staff());

-- ----------------------------------------------------------------------------
-- STORAGE BUCKETS
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('tattoos', 'tattoos', true),
       ('artists', 'artists', true),
       ('reviews', 'reviews', true),
       ('website', 'website', true),
       ('enquiries', 'enquiries', false)
on conflict (id) do nothing;

-- Public buckets: anyone may read.
do $$
declare b text;
begin
  foreach b in array array['tattoos', 'artists', 'reviews', 'website']
  loop
    execute format(
      'drop policy if exists %I on storage.objects; create policy %I on storage.objects for select using (bucket_id = %L);',
      'public_read_' || b, 'public_read_' || b, b);
  end loop;
end $$;

-- Staff may write/update/delete in the public buckets.
do $$
declare b text;
begin
  foreach b in array array['tattoos', 'artists', 'reviews', 'website']
  loop
    execute format(
      'drop policy if exists %I on storage.objects;
       create policy %I on storage.objects
       for insert with check (bucket_id = %L and public.is_staff());
       drop policy if exists %I on storage.objects;
       create policy %I on storage.objects
       for update using (bucket_id = %L and public.is_staff()) with check (bucket_id = %L and public.is_staff());
       drop policy if exists %I on storage.objects;
       create policy %I on storage.objects
       for delete using (bucket_id = %L and public.is_staff());',
      'staff_write_' || b, 'staff_write_' || b, b,
      'staff_update_' || b, 'staff_update_' || b, b, b,
      'staff_delete_' || b, 'staff_delete_' || b, b);
  end loop;
end $$;

-- Enquiries bucket is private: anon may upload reference images under
-- enquiries/ but cannot list/read them; only staff can read/remove.
drop policy if exists "enquiries_upload_anon" on storage.objects;
create policy "enquiries_upload_anon" on storage.objects
  for insert with check (
    bucket_id = 'enquiries'
    and (storage.foldername(name))[1] = 'enquiries'
  );

drop policy if exists "enquiries_read_staff" on storage.objects;
create policy "enquiries_read_staff" on storage.objects
  for select using (bucket_id = 'enquiries' and public.is_staff());

drop policy if exists "enquiries_delete_staff" on storage.objects;
create policy "enquiries_delete_staff" on storage.objects
  for delete using (bucket_id = 'enquiries' and public.is_staff());

-- ----------------------------------------------------------------------------
-- UPDATED_AT TRIGGER
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_categories_updated on public.categories;
create trigger trg_categories_updated before update on public.categories
  for each row execute function public.touch_updated_at();
drop trigger if exists trg_artists_updated on public.artists;
create trigger trg_artists_updated before update on public.artists
  for each row execute function public.touch_updated_at();
drop trigger if exists trg_tattoos_updated on public.tattoos;
create trigger trg_tattoos_updated before update on public.tattoos
  for each row execute function public.touch_updated_at();
drop trigger if exists trg_enquiries_updated on public.enquiries;
create trigger trg_enquiries_updated before update on public.enquiries
  for each row execute function public.touch_updated_at();
drop trigger if exists trg_offers_updated on public.offers;
create trigger trg_offers_updated before update on public.offers
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- UNIQUE MEDIA ORDER (keeps the seed idempotent — re-running it updates rows
-- instead of duplicating gallery images)
-- ----------------------------------------------------------------------------
create unique index if not exists uq_tattoo_images_order on public.tattoo_images (tattoo_id, display_order);
create unique index if not exists uq_tattoo_videos_order on public.tattoo_videos (tattoo_id, display_order);