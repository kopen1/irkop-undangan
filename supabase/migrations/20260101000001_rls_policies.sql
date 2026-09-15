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
