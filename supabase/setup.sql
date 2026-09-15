-- Invite - setup lengkap (gabungan seluruh migrasi)
-- Jalankan sekali di Supabase Dashboard > SQL Editor > New query > paste > Run.
-- Sumber: supabase/migrations/*.sql


-- =============================================================
-- 20260101000000_init_schema.sql
-- ============================================================
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


-- =============================================================
-- 20260101000001_rls_policies.sql
-- ============================================================
-- Intvite — Row Level Security
-- Prinsip:
--  * user  : CRUD baris miliknya sendiri via auth.uid()
--  * admin : dicek dari profiles.role lewat public.is_admin()
--  * publik: hanya publish invitations, insert rsvp/wishes tanpa auth
--  * meta  : plans/themes/plan_themes baca publik, tulis admin

alter table public.profiles       enable row level security;
alter table public.plans          enable row level security;
alter table public.themes         enable row level security;
alter table public.plan_themes    enable row level security;
alter table public.reserved_slugs enable row level security;
alter table public.invitations    enable row level security;
alter table public.guests         enable row level security;
alter table public.rsvp           enable row level security;
alter table public.wishes         enable row level security;
alter table public.orders         enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_delete on public.profiles;
create policy profiles_admin_delete on public.profiles
  for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- plans / themes / plan_themes / reserved_slugs — baca publik, tulis admin
-- ---------------------------------------------------------------------------
drop policy if exists plans_select_all on public.plans;
create policy plans_select_all on public.plans
  for select to anon, authenticated using (true);

drop policy if exists plans_admin_write on public.plans;
create policy plans_admin_write on public.plans
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists themes_select_all on public.themes;
create policy themes_select_all on public.themes
  for select to anon, authenticated using (true);

drop policy if exists themes_admin_write on public.themes;
create policy themes_admin_write on public.themes
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists plan_themes_select_all on public.plan_themes;
create policy plan_themes_select_all on public.plan_themes
  for select to anon, authenticated using (true);

drop policy if exists plan_themes_admin_write on public.plan_themes;
create policy plan_themes_admin_write on public.plan_themes
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists reserved_slugs_admin_all on public.reserved_slugs;
create policy reserved_slugs_admin_all on public.reserved_slugs
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- invitations
-- ---------------------------------------------------------------------------
drop policy if exists invitations_select_public on public.invitations;
create policy invitations_select_public on public.invitations
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists invitations_select_own on public.invitations;
create policy invitations_select_own on public.invitations
  for select to authenticated
  using (owner_id = auth.uid() or public.is_admin());

drop policy if exists invitations_insert_own on public.invitations;
create policy invitations_insert_own on public.invitations
  for insert to authenticated
  with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists invitations_update_own on public.invitations;
create policy invitations_update_own on public.invitations
  for update to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists invitations_delete_own on public.invitations;
create policy invitations_delete_own on public.invitations
  for delete to authenticated
  using (owner_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- guests
-- ---------------------------------------------------------------------------
-- Tamu boleh membaca data tamu hanya dari undangan yang sudah published
-- (dibutuhkan untuk personalisasi nama di halaman undangan).
drop policy if exists guests_select_public on public.guests;
create policy guests_select_public on public.guests
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.invitations i
      where i.id = guests.invitation_id and i.status = 'published'
    )
  );

drop policy if exists guests_owner_all on public.guests;
create policy guests_owner_all on public.guests
  for all to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.invitations i
      where i.id = guests.invitation_id and i.owner_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.invitations i
      where i.id = guests.invitation_id and i.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- rsvp
-- ---------------------------------------------------------------------------
drop policy if exists rsvp_insert_public on public.rsvp;
create policy rsvp_insert_public on public.rsvp
  for insert to anon, authenticated
  with check (
    exists (
      select 1 from public.invitations i
      where i.id = rsvp.invitation_id and i.status = 'published'
    )
  );

drop policy if exists rsvp_select_owner on public.rsvp;
create policy rsvp_select_owner on public.rsvp
  for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.invitations i
      where i.id = rsvp.invitation_id and i.owner_id = auth.uid()
    )
  );

drop policy if exists rsvp_delete_owner on public.rsvp;
create policy rsvp_delete_owner on public.rsvp
  for delete to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.invitations i
      where i.id = rsvp.invitation_id and i.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- wishes
-- ---------------------------------------------------------------------------
drop policy if exists wishes_select_public on public.wishes;
create policy wishes_select_public on public.wishes
  for select to anon, authenticated
  using (
    is_visible
    and exists (
      select 1 from public.invitations i
      where i.id = wishes.invitation_id and i.status = 'published'
    )
  );

drop policy if exists wishes_insert_public on public.wishes;
create policy wishes_insert_public on public.wishes
  for insert to anon, authenticated
  with check (
    exists (
      select 1 from public.invitations i
      where i.id = wishes.invitation_id and i.status = 'published'
    )
  );

drop policy if exists wishes_owner_all on public.wishes;
create policy wishes_owner_all on public.wishes
  for all to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.invitations i
      where i.id = wishes.invitation_id and i.owner_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.invitations i
      where i.id = wishes.invitation_id and i.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
drop policy if exists orders_owner_select on public.orders;
create policy orders_owner_select on public.orders
  for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.invitations i
      where i.id = orders.invitation_id and i.owner_id = auth.uid()
    )
  );

drop policy if exists orders_owner_insert on public.orders;
create policy orders_owner_insert on public.orders
  for insert to authenticated
  with check (
    public.is_admin()
    or exists (
      select 1 from public.invitations i
      where i.id = orders.invitation_id and i.owner_id = auth.uid()
    )
  );

drop policy if exists orders_admin_update on public.orders;
create policy orders_admin_update on public.orders
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.plans, public.themes, public.plan_themes to anon, authenticated;
grant select on public.invitations, public.guests, public.wishes to anon;
grant insert on public.rsvp, public.wishes to anon;

grant select, insert, update, delete on
  public.profiles,
  public.plans,
  public.themes,
  public.plan_themes,
  public.reserved_slugs,
  public.invitations,
  public.guests,
  public.rsvp,
  public.wishes,
  public.orders
to authenticated;


-- =============================================================
-- 20260101000002_storage.sql
-- ============================================================
-- Intvite — Supabase Storage
-- Konvensi path:
--   covers/{invitation_id}/{file}          (publik, untuk og:image & cover)
--   photos/{invitation_id}/{file}          (publik, galeri)
--   payment-proofs/{auth.uid()}/{file}     (privat, bukti transfer)

insert into storage.buckets (id, name, public)
values
  ('covers', 'covers', true),
  ('photos', 'photos', true),
  ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- covers & photos
-- ---------------------------------------------------------------------------
drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('covers', 'photos'));

drop policy if exists "media owner insert" on storage.objects;
create policy "media owner insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('covers', 'photos')
    and exists (
      select 1 from public.invitations i
      where i.id::text = split_part(name, '/', 1)
        and (i.owner_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "media owner update" on storage.objects;
create policy "media owner update" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('covers', 'photos')
    and exists (
      select 1 from public.invitations i
      where i.id::text = split_part(name, '/', 1)
        and (i.owner_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "media owner delete" on storage.objects;
create policy "media owner delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('covers', 'photos')
    and exists (
      select 1 from public.invitations i
      where i.id::text = split_part(name, '/', 1)
        and (i.owner_id = auth.uid() or public.is_admin())
    )
  );

-- ---------------------------------------------------------------------------
-- payment-proofs (privat)
-- ---------------------------------------------------------------------------
drop policy if exists "proofs owner rw" on storage.objects;
create policy "proofs owner rw" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'payment-proofs'
    and (split_part(name, '/', 1) = auth.uid()::text or public.is_admin())
  )
  with check (
    bucket_id = 'payment-proofs'
    and (split_part(name, '/', 1) = auth.uid()::text or public.is_admin())
  );


-- =============================================================
-- 20260101000003_seed.sql
-- ============================================================
-- Intvite — seed data awal
-- Fase "semua gratis": semua tema di-assign ke plan Free.
-- Saat monetisasi aktif, cukup ubah baris plan_themes lewat panel admin.

insert into public.plans (key, name, price, max_guests, max_photos, active_duration_days, theme_quota, features, sort_order, is_active)
values
  ('free',    'Free',    0,      50,   10,  30,  null,
    '{"amplop_digital": true, "custom_music": true, "galeri": true, "rsvp": true}'::jsonb, 1, true),
  ('medium',  'Medium',  49000,  300,  50,  90,  null,
    '{"amplop_digital": true, "custom_music": true, "galeri": true, "rsvp": true, "tanpa_watermark": true}'::jsonb, 2, true),
  ('premium', 'Premium', 99000, 1000, 200, 365, null,
    '{"amplop_digital": true, "custom_music": true, "galeri": true, "rsvp": true, "tanpa_watermark": true, "domain_custom": true}'::jsonb, 3, true)
on conflict (key) do nothing;

insert into public.themes (key, name, preview_image, category, is_active)
values
  ('modern-minimalist', 'Modern Minimalis',  null, 'basic',     true),
  ('elegan-floral',     'Elegan Floral',     null, 'basic',     true),
  ('adat-tradisional',  'Adat Tradisional',  null, 'basic',     true)
on conflict (key) do nothing;

-- MVP: semua tema tersedia di plan Free.
insert into public.plan_themes (plan_id, theme_id)
select p.id, t.id
from public.plans p
cross join public.themes t
where p.key = 'free'
on conflict do nothing;


-- =============================================================
-- 20260101000004_protect_profile_role.sql
-- ============================================================
-- Perbaikan keamanan: cegah user menaikkan role dirinya sendiri jadi admin.
--
-- Sebelumnya policy profiles_update_self (dan profiles_insert_self) mengizinkan
-- user menulis kolom `role` pada baris miliknya sendiri, sehingga siapa pun bisa
-- memberi dirinya akses admin. Role sekarang hanya bisa diubah oleh admin asli,
-- atau lewat SQL editor / service role (auth.uid() null).

create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Role hanya bisa diubah oleh admin.'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_escalation on public.profiles;
create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- Insert sendiri hanya boleh dengan role default.
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert to authenticated
  with check (id = auth.uid() and (role = 'user' or public.is_admin()));

-- Update sendiri tidak boleh menyentuh kolom role (dijaga trigger di atas),
-- jadi policy cukup memastikan barisnya milik sendiri.
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());


-- =============================================================
-- 20260101000005_fix_slug_guard.sql
-- ============================================================
-- Perbaikan: penjaga slug reserved tidak pernah aktif.
--
-- check_invitation_slug() bukan security definer, sehingga SELECT ke
-- public.reserved_slugs tunduk pada RLS (hanya admin yang boleh baca).
-- Akibatnya exists(...) selalu false dan slug seperti 'admin' lolos.
-- Fungsi dijadikan security definer agar pengecekan berjalan.

create or replace function public.check_invitation_slug()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.reserved_slugs where slug = new.slug) then
    raise exception 'Slug "%" tidak bisa dipakai (reserved).', new.slug
      using errcode = '23514';
  end if;
  return new;
end;
$$;

-- Bersihkan sisa data uji bila slug reserved sempat lolos.
delete from public.invitations where slug in ('admin', 'app', 'api', 'login');


-- =============================================================
-- 20260101000006_guest_link_privacy.sql
-- ============================================================
-- Personalisasi tamu tanpa menyimpan nama di database.
--
-- Halaman undangan sekarang mengambil nama tamu langsung dari URL
-- (mis. /kopen/iqbal -> "Kepada Iqbal"), jadi pemilik undangan cukup mengedit
-- nama di link tanpa harus menambah tamu ke daftar.
--
-- Konsekuensinya daftar tamu tidak lagi perlu dibaca publik. Policy lama
-- guests_select_public mengizinkan siapa pun menarik SELURUH daftar tamu dari
-- undangan yang sudah terbit lewat satu request:
--   GET /rest/v1/guests?invitation_id=eq.<id>
-- Policy itu dihapus dan diganti fungsi exact-match yang hanya bisa mengembalikan
-- satu baris, dipakai untuk menautkan RSVP ke tamu yang memang terdaftar.

drop policy if exists guests_select_public on public.guests;

create or replace function public.get_guest_by_slug(
  p_invitation_slug text,
  p_guest_slug text
)
returns table (id uuid, name text)
language sql
stable
security definer
set search_path = public
as $$
  select g.id, g.name
  from public.guests g
  join public.invitations i on i.id = g.invitation_id
  where i.slug = p_invitation_slug
    and i.status = 'published'
    and g.slug = p_guest_slug
  limit 1;
$$;

revoke all on function public.get_guest_by_slug(text, text) from public;
grant execute on function public.get_guest_by_slug(text, text) to anon, authenticated;


-- =============================================================
-- 20260101000007_plan_tiers.sql
-- ============================================================
-- Perbedaan nyata antar plan.
--
-- Sebelumnya ketiga plan hanya beda angka kuota, dan tema/musik/amplop sama saja.
-- Sekarang tiap plan punya batas jumlah undangan, tema, dan fitur yang berbeda.
--
--   plan      undangan  tema          tamu   foto  durasi  musik  amplop  watermark
--   free            1   modern(1)       50      2   30 hr     -       -        ya
--   medium          3   3 tema         300     50   90 hr   v       v         -
--   premium        10   semua tema    1000    200  365 hr   v       v         -
--
-- Pembatasan fitur tidak menghapus data lama: kalau user upgrade, isi musik dan
-- amplop yang sebelumnya diisi akan muncul lagi.

alter table public.plans
  add column if not exists max_invitations integer not null default 1;

update public.plans set
  price = 0,
  max_invitations = 1,
  max_guests = 50,
  max_photos = 2,
  active_duration_days = 30,
  theme_quota = null,
  features = '{"amplop_digital": false, "custom_music": false, "galeri": true, "rsvp": true}'::jsonb,
  sort_order = 1,
  is_active = true
where key = 'free';

update public.plans set
  price = 49000,
  max_invitations = 3,
  max_guests = 300,
  max_photos = 50,
  active_duration_days = 90,
  theme_quota = null,
  features = '{"amplop_digital": true, "custom_music": true, "galeri": true, "rsvp": true, "tanpa_watermark": true}'::jsonb,
  sort_order = 2,
  is_active = true
where key = 'medium';

update public.plans set
  price = 99000,
  max_invitations = 10,
  max_guests = 1000,
  max_photos = 200,
  active_duration_days = 365,
  theme_quota = null,
  features = '{"amplop_digital": true, "custom_music": true, "galeri": true, "rsvp": true, "tanpa_watermark": true, "domain_custom": true}'::jsonb,
  sort_order = 3,
  is_active = true
where key = 'premium';

-- Pemetaan tema: Free hanya 1 tema, Medium & Premium dapat semua tema.
delete from public.plan_themes;

insert into public.plan_themes (plan_id, theme_id)
select p.id, t.id
from public.plans p
join public.themes t on true
where (p.key = 'free' and t.key = 'modern-minimalist')
   or p.key in ('medium', 'premium');


-- =============================================================
-- 20260101000008_theme_catalog.sql
-- ============================================================
-- Katalog tema lengkap: 5 basic + 7 eksklusif.
--
-- `key` harus sama persis dengan entri di src/lib/theme-tokens.ts, karena
-- frontend memetakan key ini ke komponen tema.
--
-- Distribusi per plan (sesuai keputusan produk: Free dapat 1 tema):
--   free     -> modern-minimalist (1)
--   medium   -> 5 basic + luxury-gold, marble-elegan, islamic-arabesque (8)
--   premium  -> semua tema

insert into public.themes (key, name, category, is_active) values
  ('modern-minimalist',  'Modern Minimalis',   'basic',     true),
  ('aesthetic-putih',    'Aesthetic Putih',    'basic',     true),
  ('elegan-floral',      'Elegan Floral',      'basic',     true),
  ('rustic-boho',        'Rustic Boho',        'basic',     true),
  ('adat-tradisional',   'Adat Tradisional',   'basic',     true),
  ('luxury-gold',        'Luxury Gold',        'eksklusif', true),
  ('marble-elegan',      'Marble Elegan',      'eksklusif', true),
  ('islamic-arabesque',  'Islamic Arabesque',  'eksklusif', true),
  ('tropical-bali',      'Tropical Bali',      'eksklusif', true),
  ('vintage-retro',      'Vintage Retro',      'eksklusif', true),
  ('sakura-zen',         'Sakura Zen',         'eksklusif', true),
  ('cinematic-dark',     'Cinematic Dark',     'eksklusif', true)
on conflict (key) do update set
  name = excluded.name,
  category = excluded.category,
  is_active = true;

delete from public.plan_themes;

insert into public.plan_themes (plan_id, theme_id)
select p.id, t.id
from public.plans p
join public.themes t on true
where
  (p.key = 'free' and t.key = 'modern-minimalist')
  or (
    p.key = 'medium'
    and (
      t.category = 'basic'
      or t.key in ('luxury-gold', 'marble-elegan', 'islamic-arabesque')
    )
  )
  or p.key = 'premium';


-- =============================================================
-- 20260101000009_premium_content.sql
-- ============================================================
-- Fitur konten premium: foto tiap mempelai (opsional) + sosial media.
--
-- Hanya tersedia di plan medium & premium. Plan free terkunci; nilai false
-- ditulis eksplisit supaya jelas di panel admin. Data lama tidak terpengaruh:
-- bila user upgrade, field yang tadinya kosong akan mulai tampil di undangan.

update public.plans
set features = features || '{"foto_mempelai": false, "sosial_media": false}'::jsonb
where key = 'free';

update public.plans
set features = features || '{"foto_mempelai": true, "sosial_media": true}'::jsonb
where key in ('medium', 'premium');
