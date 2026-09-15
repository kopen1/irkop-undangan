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
