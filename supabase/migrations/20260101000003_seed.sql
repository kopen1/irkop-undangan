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
