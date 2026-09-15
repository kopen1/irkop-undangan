# Invite

Platform undangan digital self-service: user daftar, pilih tema, isi konten lewat dashboard, lalu bagikan link ke tamu via WhatsApp. Ada panel admin terpisah untuk mengelola user, tema, plan, dan verifikasi order.

Implementasi dari `PRD-intvite.md`.

> **Untuk AI/developer berikutnya:** baca [`AGENTS.md`](./AGENTS.md) dulu — berisi peta
> arsitektur, konvensi, jebakan yang sudah pernah muncul, dan checklist menuju go-live.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + lucide-react
- Supabase (Postgres + Auth + Storage), migrasi via Supabase CLI
- Cloudflare Pages (deploy) + Pages Function untuk preview link WhatsApp

## Struktur

```
src/
  pages/app/*        dashboard user (/app)
  pages/admin/*      panel admin (/admin)
  pages/public/*     undangan publik (/:slug/:slug-tamu) + 3 tema
  layouts/           DashboardLayout, AdminLayout
  lib/               supabase client, types, api, utils, kompresi gambar
supabase/migrations/ skema, RLS, storage, seed
functions/           Cloudflare Pages Function (og:title / og:image)
```

## Setup lokal

1. Install dependency

   ```bash
   npm install
   ```

2. Buat project Supabase baru (terpisah dari project lain), lalu salin kredensial:

   ```bash
   copy .env.example .env
   ```

   Isi `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, dan `VITE_APP_URL`.

3. Isi `SUPABASE_DB_PASSWORD` di `.env` (Dashboard → Project Settings → Database), lalu jalankan migrasi:

   ```bash
   npm run db:push
   ```

   Script ini memakai Supabase CLI via `npx` dan membaca password dari `.env`, jadi tidak perlu `supabase login`.

   > Kalau direct connection gagal (project IPv6-only), isi juga `SUPABASE_DB_HOST` dengan host *Session pooler* dari Dashboard → Connect.

   Alternatif tanpa CLI: buka `supabase/setup.sql` (gabungan semua migrasi), copy, lalu paste di Dashboard → SQL Editor → Run.

   Migrasi membuat 10 tabel + RLS, bucket storage (`covers` & `photos` publik, `payment-proofs` privat), 50 slug reserved, dan seed 3 plan + 3 tema.

4. Aktifkan Google OAuth di Supabase Dashboard → Authentication → Providers, lalu tambahkan redirect URL `http://localhost:5173/app` dan domain produksi.

   **Email confirmation** aktif secara default. Untuk mempermudah testing, matikan dulu di Dashboard → Authentication → Sign In / Providers → Email → *Confirm email*, atau konfirmasi akun uji langsung dari Dashboard.

5. Jalankan dev server

   ```bash
   npm run dev
   ```

## Tes dari HP / device lain di WiFi yang sama

Dev server sudah di-set `host: true`, jadi otomatis terbuka ke jaringan lokal:

```bash
npm run dev
# Local:   http://localhost:5173/
# Network: http://192.168.18.10:5173/     <-- buka ini dari HP
```

Karena `VITE_APP_URL=auto`, link undangan yang dibuat dashboard mengikuti alamat yang
sedang dibuka. Jadi dari HP, `http://192.168.18.10:5173/<slug>/<nama-tamu>` langsung
bisa dibuka tanpa mengubah konfigurasi. Kalau Windows Firewall memblokir, izinkan
Node.js untuk jaringan Private.

Set `VITE_APP_URL` ke URL tetap (mis. `https://invite.irkop.eu.org`) kalau ingin link
selalu menunjuk ke domain produksi.

## Tema

Katalog tema ada di `src/lib/theme-tokens.ts` (12 tema: 5 basic + 7 eksklusif). Setiap
tema hanya berisi token warna, font, dan jenis ornamen — semuanya digambar oleh satu
komponen `ThemeRenderer`, dan ornamennya ada di `invitation/ornaments.tsx`.

Pratinjau tiap tema tersedia di `/demo/:themeKey`, mis. `/demo/luxury-gold`. Halaman demo
memakai data contoh dari `src/lib/demo.ts` (foto dibuat sebagai SVG data-URI, jadi tidak
butuh layanan gambar eksternal) dan menonaktifkan form RSVP/ucapan.

Menambah tema baru:

1. Tambah entri di `THEMES` (`src/lib/theme-tokens.ts`) — `key` harus huruf kecil dan
   tanda hubung.
2. Tambah baris `themes` dengan `key` yang sama lewat migrasi baru (atau panel admin →
   Tema), lalu petakan ke plan di `plan_themes`.
3. Kalau butuh ornamen baru, tambahkan jenisnya di `OrnamentKind` + komponennya di
   `ornaments.tsx`.

## Membuat diri sendiri admin

Setelah signup, jalankan di SQL editor Supabase:

```sql
update public.profiles set role = 'admin' where id = (
  select id from auth.users where email = 'email@kamu.com'
);
```

Trigger `profiles_prevent_role_escalation` hanya memblokir perubahan role dari sesi
user biasa, jadi query di SQL editor (jalur `postgres`) tetap berjalan. User tidak
bisa menaikkan dirinya sendiri jadi admin.

## Deploy ke Cloudflare Pages

- Build command: `npm run build`, output `dist`
- Environment variables (build): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_URL`
- Environment variables (Functions runtime): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `APP_URL`

Functions di `functions/` otomatis dipakai Cloudflare Pages. Fungsi ini mencegat `/:slug` dan `/:slug/:tamu`, mengambil data undangan dari Supabase, lalu menyuntikkan `og:title` dan `og:image` ke `index.html` supaya preview WhatsApp benar.

## Skrip

| Perintah | Fungsi |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | typecheck + build produksi |
| `npm run preview` | preview hasil build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run db:push` | push migrasi ke Supabase (baca `SUPABASE_DB_PASSWORD` dari `.env`) |
