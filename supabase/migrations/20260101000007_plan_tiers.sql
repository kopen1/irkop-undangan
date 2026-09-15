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
