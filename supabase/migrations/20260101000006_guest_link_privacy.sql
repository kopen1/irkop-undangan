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
