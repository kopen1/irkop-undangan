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
