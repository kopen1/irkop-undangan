-- Intvite — initial schema
-- Fase: MVP. Semua tabel dirancang sejak awal agar siap monetisasi tanpa migrasi ulang.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helper: updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- Data tambahan user, terpisah dari auth.users bawaan Supabase.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  phone       text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now()
);

comment on table public.profiles is 'Data profil user, terhubung ke auth.users.id.';

-- Auto-create profile saat user signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Cek role admin dari tabel profiles, bukan hardcode email.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- plans
-- ---------------------------------------------------------------------------
create table if not exists public.plans (
  id                  uuid primary key default gen_random_uuid(),
  key                 text not null unique,
  name                text not null,
  price               integer not null default 0,
  max_guests          integer not null default 50,
  max_photos          integer not null default 10,
  active_duration_days integer not null default 30,
  theme_quota         integer,
  features            jsonb not null default '{}'::jsonb,
  sort_order          integer not null default 0,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- themes
-- ---------------------------------------------------------------------------
create table if not exists public.themes (
  id             uuid primary key default gen_random_uuid(),
  key            text not null unique,
  name           text not null,
  preview_image  text,
  category       text check (category in ('basic', 'eksklusif')),
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- plan_themes (many-to-many)
-- ---------------------------------------------------------------------------
create table if not exists public.plan_themes (
  plan_id   uuid not null references public.plans (id) on delete cascade,
  theme_id  uuid not null references public.themes (id) on delete cascade,
  primary key (plan_id, theme_id)
);

-- ---------------------------------------------------------------------------
-- reserved_slugs
-- Daftar kata yang tidak boleh dipakai sebagai slug undangan.
-- ---------------------------------------------------------------------------
create table if not exists public.reserved_slugs (
  slug text primary key
);

insert into public.reserved_slugs (slug) values
  ('app'), ('admin'), ('api'), ('auth'), ('login'), ('logout'), ('register'),
  ('dashboard'), ('pricing'), ('tema'), ('theme'), ('themes'), ('help'),
  ('about'), ('contact'), ('privacy'), ('terms'), ('settings'), ('assets'),
  ('static'), ('public'), ('www'), ('mail'), ('blog'), ('docs'), ('support'),
  ('null'), ('undefined'), ('new'), ('edit'), ('delete'), ('invitation'),
  ('invitations'), ('guest'), ('guests'), ('rsvp'), ('wishes'), ('order'),
  ('orders'), ('payment'), ('checkout'), ('callback'), ('webhook'), ('sitemap'),
  ('robots'), ('favicon'), ('_next'), ('supabase'), ('functions'), ('cdn')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- invitations
-- ---------------------------------------------------------------------------
create table if not exists public.invitations (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null references public.profiles (id) on delete cascade,
  slug                text not null unique,
  plan_id             uuid not null references public.plans (id),
  theme_id            uuid not null references public.themes (id),
  status              text not null default 'draft'
                        check (status in ('draft', 'published', 'expired', 'archived')),
  groom_name          text,
  bride_name          text,
  event_date          date,
  cover_image         text,
  content             jsonb not null default '{}'::jsonb,
  storage_used_bytes  bigint not null default 0,
  published_at        timestamptz,
  expires_at          timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint invitations_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) between 3 and 60)
);

create index if not exists invitations_owner_idx on public.invitations (owner_id);
create index if not exists invitations_status_idx on public.invitations (status);

drop trigger if exists invitations_set_updated_at on public.invitations;
create trigger invitations_set_updated_at
  before update on public.invitations
  for each row execute function public.set_updated_at();

-- Tolak slug yang masuk daftar reserved.
create or replace function public.check_invitation_slug()
returns trigger
language plpgsql
as $$
begin
  if exists (select 1 from public.reserved_slugs where slug = new.slug) then
    raise exception 'Slug "%" tidak bisa dipakai (reserved).', new.slug
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists invitations_check_slug on public.invitations;
create trigger invitations_check_slug
  before insert or update of slug on public.invitations
  for each row execute function public.check_invitation_slug();

-- ---------------------------------------------------------------------------
-- guests
-- ---------------------------------------------------------------------------
create table if not exists public.guests (
  id                uuid primary key default gen_random_uuid(),
  invitation_id     uuid not null references public.invitations (id) on delete cascade,
  name              text not null,
  slug              text not null,
  whatsapp_sent_at  timestamptz,
  created_at        timestamptz not null default now(),
  unique (invitation_id, slug)
);

create index if not exists guests_invitation_idx on public.guests (invitation_id);

-- ---------------------------------------------------------------------------
-- rsvp
-- ---------------------------------------------------------------------------
create table if not exists public.rsvp (
  id             uuid primary key default gen_random_uuid(),
  invitation_id  uuid not null references public.invitations (id) on delete cascade,
  guest_id       uuid references public.guests (id) on delete set null,
  attendance     text not null check (attendance in ('hadir', 'tidak_hadir', 'masih_ragu')),
  guest_count    integer not null default 1 check (guest_count >= 0),
  created_at     timestamptz not null default now()
);

create index if not exists rsvp_invitation_idx on public.rsvp (invitation_id);

-- ---------------------------------------------------------------------------
-- wishes (ucapan & doa)
-- ---------------------------------------------------------------------------
create table if not exists public.wishes (
  id             uuid primary key default gen_random_uuid(),
  invitation_id  uuid not null references public.invitations (id) on delete cascade,
  guest_name     text not null,
  message        text not null,
  is_visible     boolean not null default true,
  created_at     timestamptz not null default now()
);

create index if not exists wishes_invitation_idx on public.wishes (invitation_id);

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  invitation_id  uuid not null references public.invitations (id) on delete cascade,
  plan_id        uuid not null references public.plans (id),
  amount         integer not null default 0,
  payment_method text not null default 'manual_transfer',
  status         text not null default 'pending'
                   check (status in ('pending', 'verified', 'rejected')),
  proof_url      text,
  verified_by    uuid references public.profiles (id) on delete set null,
  created_at     timestamptz not null default now(),
  verified_at    timestamptz
);

create index if not exists orders_invitation_idx on public.orders (invitation_id);
create index if not exists orders_status_idx on public.orders (status);
