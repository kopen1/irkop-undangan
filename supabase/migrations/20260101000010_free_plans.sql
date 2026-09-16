-- Untuk sementara semua plan gratis: harga Rp0 dan seluruh fitur + kuota dibuka.
--
-- Admin tetap bisa mematikan fitur per plan lewat panel admin (toggle di tabel
-- plan), jadi pembatasan bisa dinyalakan lagi tanpa mengubah kode.

update public.plans set
  price = 0,
  max_invitations = 10,
  max_guests = 1000,
  max_photos = 200,
  active_duration_days = 365,
  theme_quota = null,
  features = '{"amplop_digital": true, "custom_music": true, "galeri": true, "rsvp": true, "tanpa_watermark": true, "domain_custom": true, "foto_mempelai": true, "sosial_media": true}'::jsonb;

-- Semua tema tersedia untuk semua plan.
delete from public.plan_themes;

insert into public.plan_themes (plan_id, theme_id)
select p.id, t.id
from public.plans p
join public.themes t on true;
