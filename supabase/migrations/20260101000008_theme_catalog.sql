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
