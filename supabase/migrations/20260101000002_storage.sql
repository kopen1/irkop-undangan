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
