# AGENTS.md — Invite (undangan digital)

Dokumen ini untuk AI/developer berikutnya. Baca ini dulu sebelum mengubah apa pun.

- **Produk:** platform undangan digital self-service. User daftar, pilih tema, isi konten
  lewat dashboard, lalu bagikan link ke tamu via WhatsApp. Ada panel admin terpisah.
- **Repo:** `github.com/kopen1/irkop-undangan`
- **Domain tujuan:** `invite.irkop.eu.org`
- **Status:** MVP lengkap dan sudah diuji end-to-end di lokal. **Belum ter-deploy**
  (domain masih 404 karena Cloudflare Pages belum terhubung). Lihat §7 untuk go-live.

---

## 1. Stack

| Bagian | Teknologi |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + lucide-react |
| Routing | react-router-dom v6, `React.lazy` per area |
| Backend | Supabase (Postgres + Auth + Storage), tanpa server sendiri |
| Migrasi | Supabase CLI, file di `supabase/migrations/`, di-commit ke git |
| Deploy | Cloudflare Pages + Pages Functions |
| Font | Google Fonts dimuat di `src/index.css` |

Tidak ada state manager, tidak ada React Query, tidak ada UI kit. Komponen UI ditulis
sendiri di `src/components/ui/`. Jangan tambahkan dependensi baru tanpa alasan kuat.

## 2. Peta folder

```
src/
  pages/LandingPage.tsx        home publik (branding + galeri tema + harga)
  pages/PricingPage.tsx        perbandingan paket publik
  pages/NotFoundPage.tsx
  pages/auth/                  LoginPage, RegisterPage, AuthShell
  pages/app/                   dashboard user
    DashboardHome.tsx          daftar undangan + statistik
    NewInvitationPage.tsx      buat undangan (cek kuota plan di sini)
    InvitationEditor.tsx       shell + tab (state undangan ada di sini)
    editor/                    EditorDetailTab, EditorContentTab, EditorGalleryTab,
                               EditorGuestsTab, EditorRsvpTab, EditorWishesTab,
                               EditorPlanTab, types.ts
    ProfilePage.tsx
    DashboardPricing.tsx
  pages/admin/                 AdminOverview, AdminUsers, AdminThemes, AdminPlans,
                               AdminOrders
  pages/public/
    PublicInvitation.tsx       halaman tamu (/:slug dan /:slug/:guestSlug)
    DemoInvitation.tsx         pratinjau tema (/demo/:themeKey)
    invitation/
      ThemeRenderer.tsx        SATU komponen untuk semua tema
      theme-types.ts           kontrak props tema
      common.tsx               blok section (cover, opening, couple, story, events,
                               gallery, gift, rsvp, wishes, music, countdown, footer)
      ornaments.tsx            ornamen dekoratif per tema
  layouts/                     DashboardLayout, AdminLayout
  lib/
    supabase.ts                client + APP_URL (mendukung VITE_APP_URL=auto)
    database.types.ts          tipe Database (ditulis manual, bukan hasil generate)
    types.ts                   tipe domain + parseContent + planHasFeature
    api.ts                     SEMUA akses data lewat sini
    theme-tokens.ts            katalog 12 tema
    demo.ts                    data contoh untuk halaman demo
    utils.ts, constants.ts, image.ts (kompresi gambar), supabase.ts
  components/
    ui/                        Button, Field, Card, Modal, Badge, Spinner, EmptyState,
                               ConfirmDialog
    plans/PlanCards.tsx        kartu paket (dipakai landing, pricing, dashboard)
    themes/ThemeGallery.tsx    galeri tema
    auth/RouteGuards.tsx       RequireAuth, RequireAdmin
supabase/migrations/           9 migrasi berurutan (0000..0008)
supabase/setup.sql             GABUNGAN semua migrasi (untuk paste ke SQL Editor)
functions/                     Cloudflare Pages Functions (og:title/og:image)
scripts/db-push.mjs            push migrasi pakai SUPABASE_DB_PASSWORD dari .env
```

## 3. Konvensi

- **Bahasa:** komentar dan teks UI dalam Bahasa Indonesia. Identitas kode (variabel,
  fungsi) dalam Bahasa Inggris.
- **Akses data:** selalu lewat `src/lib/api.ts`. Jangan panggil `supabase.from(...)`
  langsung dari komponen (kecuali panel admin yang butuh query agregat, lihat
  `AdminOverview.tsx`).
- **Tipe:** `database.types.ts` ditulis manual. Kalau skema berubah, perbarui file itu
  juga, plus tipe domain di `types.ts`.
- **Error handling:** `api.ts` melempar `Error`. Komponen menangkapnya dan menampilkan
  lewat `useToast()`. Jangan `console.log` untuk error yang terlihat user.
- **Fitur berbayar:** dicek lewat `planHasFeature(invitation.plan, "nama_fitur")`.
  Kuota angka dibaca dari `invitation.plan` (`max_guests`, `max_photos`,
  `max_invitations`), **jangan hardcode**.
- **Tema:** jangan bikin komponen tema baru. Tambahkan token di
  `src/lib/theme-tokens.ts` + baris di tabel `themes` dengan `key` yang sama.
- **Tanpa emoji** di UI maupun kode.

## 4. Database

10 tabel: `profiles`, `plans`, `themes`, `plan_themes`, `reserved_slugs`,
`invitations`, `guests`, `rsvp`, `wishes`, `orders`. RLS aktif di semuanya.

Poin penting:

- `profiles` terpisah dari `auth.users`; baris dibuat otomatis oleh trigger
  `handle_new_user`. Klien juga membuat ulang kalau hilang (`fetchProfile` di
  `AuthProvider`) — ini sengaja, jangan dihapus.
- Role admin dibaca dari `profiles.role` lewat fungsi `is_admin()`. **Trigger
  `profiles_prevent_role_escalation` mencegah user menaikkan role-nya sendiri.** Ini
  jangan dilepas.
- `check_invitation_slug()` adalah **security definer** — kalau diubah jadi bukan,
  pengecekan slug reserved akan diam-diam berhenti bekerja (RLS memblokir SELECT ke
  `reserved_slugs`).
- Policy `guests` sengaja **tidak** memberikan SELECT ke anon. Personalisasi tamu
  diambil dari URL (`guestNameFromSlug`), dan penautan RSVP memakai RPC
  `get_guest_by_slug()` (security definer, exact match, maksimal 1 baris). Jangan
  menambahkan policy SELECT publik ke `guests` — itu membocorkan seluruh daftar tamu.
- `rsvp` tidak punya policy SELECT untuk anon, jadi `submitRsvp()` **tidak boleh**
  memakai `.select()` setelah insert (RETURNING butuh policy SELECT dan akan ditolak).
- Bucket storage: `covers` + `photos` (publik), `payment-proofs` (privat). Konvensi
  path: `{invitation_id}/{uuid}.{ext}` untuk media, `{auth.uid()}/{file}` untuk bukti
  transfer.

### Push migrasi

```bash
# isi SUPABASE_DB_PASSWORD di .env dulu
npm run db:push
```

Script `scripts/db-push.mjs` memakai `npx supabase db push --db-url` sehingga tidak
perlu `supabase login`. Kalau project IPv6-only dan koneksi langsung gagal, isi
`SUPABASE_DB_HOST` dengan host Session pooler dari Dashboard → Connect.

Setelah menambah migrasi baru, **regenerasi `supabase/setup.sql`** (gabungan semua file
di `supabase/migrations/`, urut nama) supaya pengguna tanpa CLI tetap bisa setup.

## 5. Auth

- Email + password dan Google OAuth, keduanya sudah terpasang di kode.
- `VITE_APP_URL=auto` membuat link undangan mengikuti `window.location.origin`
  (localhost / IP LAN / domain produksi) tanpa ganti config. Nilai `auto` juga
  ditangani di Pages Function.
- Redirect URL Supabase harus memuat `http://localhost:5173/**` dan
  `https://invite.irkop.eu.org/**`.

## 6. Sudah selesai & terverifikasi

- Auth (email/password + Google), trigger profil, self-heal profil.
- Dashboard: buat/kelola undangan, editor 7 tab, galeri dengan kompresi client,
  daftar tamu + link personal, RSVP, ucapan + moderasi, amplop digital, request upgrade.
- Panel admin: ringkasan, verifikasi order, pengguna (ubah role), tema (CRUD), plan
  (kuota + fitur + pemetaan tema).
- Halaman publik 3 lapis URL: `/:slug`, `/:slug/:guestSlug`, `/demo/:themeKey`.
- 12 tema token-driven (5 basic + 7 eksklusif) + 11 ornamen.
- Paket: Free (1 undangan, 1 tema, 50 tamu, 2 foto, 30 hari, tanpa musik/amplop),
  Medium (3 undangan, 8 tema, 300 tamu, 50 foto, 90 hari), Premium (10 undangan, 12
  tema, 1000 tamu, 200 foto, 365 hari).
- Pages Function untuk preview WhatsApp (`og:title`, `og:image`).
- Diuji end-to-end: 32/32 + 13/13 + 12/12 pemeriksaan lulus. `npm run build`,
  `npm run lint`, `npx tsc -b --noEmit` bersih.

## 7. Menuju go-live

Kerjakan berurutan. Jangan lompat ke §7.4 sebelum §7.2 selesai.

### 7.1 Prasyarat

- Akses repo GitHub dan akun Cloudflare.
- Kredensial Supabase (URL, anon key, database password, project ref).
- `.env` sudah ter-commit dan terisi (lihat §11). `SUPABASE_DB_PASSWORD` disimpan di
  `.env.local` yang tidak ikut ter-commit — minta nilainya ke pemilik repo.

### 7.2 Cloudflare Pages

1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git, pilih
   repo `irkop-undangan`.
2. Build settings:
   - Framework preset: `None` (jangan pilih Vite, biar tidak dobel build)
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`
3. Environment variables (Production **dan** Preview):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_URL=auto`
   - `SUPABASE_URL` (untuk Functions, tanpa prefix VITE_)
   - `SUPABASE_ANON_KEY`
   - `APP_URL=auto`
4. Deploy. Cek apakah `functions/` otomatis terdeteksi di tab Functions.
5. **JANGAN menambahkan `public/_redirects`.** Cloudflare Pages sudah melakukan SPA
   fallback otomatis: "If your project does not include a top-level `404.html` file,
   Pages assumes that you are deploying a single-page application... matches all
   incoming paths to the root (`/`)". Build kita hanya menghasilkan `dist/index.html`,
   jadi `/app`, `/login`, dan `/:slug` sudah dilayani tanpa konfigurasi tambahan.
   `_redirects` tidak berlaku untuk request yang dipegang Pages Function, jadi menambah
   `/* /index.html 200` tidak memberi manfaat apa pun, hanya menambah permukaan risiko.

   **Jebakan:** menambahkan `public/404.html` akan **mematikan** SPA fallback otomatis
   itu. Kalau nanti butuh halaman 404 kustom, fallback harus dipasang manual
   (`_redirects` atau Function), dan harus diuji ulang.

6. Verifikasi SPA fallback: `/app`, `/login`, `/pricing`, dan `/<slug-undangan>` harus
   balas 200 (bukan 404). Kalau 404, cek dulu apakah ada `404.html` di `dist/`.
7. Verifikasi Pages Function: buka `https://<project>.pages.dev/<slug-undangan>` dan
   pastikan `<meta property="og:image">` terisi. Kalau Functions tidak jalan, cek
   bahwa `functions/` ada di root repo dan env `SUPABASE_URL`/`SUPABASE_ANON_KEY`
   sudah diisi.
8. **Kuota Functions.** Begitu ada folder `functions/`, semua request secara default
   memanggil Function, termasuk request ke `/assets/*`. Cloudflare otomatis membuat
   `_routes.json` saat mendeteksi folder `functions/`, jadi static asset seharusnya
   sudah dikecualikan. Verifikasi di output build/deploy bahwa `_routes.json` terbentuk
   dan `exclude` berisi `/assets/*`. Kalau tidak terbentuk, buat sendiri di
   `public/_routes.json` dengan `include: ["/*"]` dan `exclude: ["/assets/*", "/favicon.svg"]`.

### 7.3 Domain

1. Cloudflare Pages → project → Custom domains → tambah `invite.irkop.eu.org`.
2. Karena zona `irkop.eu.org` sudah di Cloudflare, DNS record dibuat otomatis.
   Sekarang domain ini masih 404 — itu tanda belum ada deployment yang terhubung,
   bukan masalah DNS.
3. Setelah aktif, cek HTTPS dan coba buka halaman undangan lewat domain asli.

### 7.4 Auth di produksi

1. Supabase → Authentication → URL Configuration:
   - Site URL: `https://invite.irkop.eu.org`
   - Redirect URLs: `https://invite.irkop.eu.org/**`, `http://localhost:5173/**`
2. Google provider sudah aktif (diuji: `/auth/v1/authorize?provider=google` → 302).
   Tapi layar consent Google masih menampilkan `...supabase.co` sebagai nama app.
   Perbaiki di Google Cloud Console → Google Auth Platform → Branding: set **App name**
   (mis. `Invite`, jangan pakai nama berisi domain), Authorized domain `irkop.eu.org`,
   lalu **Publish app**. Kalau masih muncul domain, nama app perlu proses verifikasi
   Google.
3. Email confirmation: matikan untuk testing cepat, atau biarkan aktif untuk produksi.
   Kalau aktif, siapkan template email di Supabase → Authentication → Email Templates.

### 7.5 Admin pertama

Setelah signup, jalankan di Supabase SQL Editor:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'email@kamu.com');
```

Query ini tetap jalan karena trigger hanya memblokir perubahan role dari sesi user
biasa (`auth.uid()` tidak null). Panel admin ada di `/admin`.

### 7.6 Uji asap produksi

Lakukan di domain asli, pakai akun baru (bukan akun uji):

- [ ] Daftar email/password → profil terbentuk → bisa buat undangan.
- [ ] Daftar Google → profil terbentuk (nama terisi dari Google).
- [ ] Buat undangan dengan plan Free → tema yang muncul hanya 1.
- [ ] Coba buat undangan kedua → muncul kartu "kuota habis" (benar, Free = 1).
- [ ] Unggah cover + 3 foto → foto ke-3 ditolak (Free = 2 foto).
- [ ] Terbitkan → buka `/<slug>` dan `/<slug>/<nama-bebas>`; nama tamu ikut dari URL.
- [ ] Kirim link ke WhatsApp → preview memuat nama pasangan + cover.
- [ ] Isi RSVP dan ucapan dari HP (anon) → muncul di dashboard.
- [ ] Sembunyikan ucapan → hilang dari halaman publik.
- [ ] Login sebagai admin → `/admin` bisa dibuka; user biasa tidak bisa.
- [ ] Alur order: ajukan upgrade → admin verifikasi → plan undangan berubah.
- [ ] Hard refresh di `/app/invitations/<id>` (deep link) → tidak 404.

### 7.7 Operasional

- Supabase free tier: pantau Storage dan Database size. Kuota per plan
  (`max_photos`, `storage_used_bytes`) adalah pertahanan utama.
- Aktifkan Point-in-Time Recovery / backup berkala sebelum menerima user nyata.
- Pindahkan verifikasi pembayaran manual ke payment gateway (Midtrans/Xendit) saat
  siap. Tabel `orders` sudah dirancang untuk itu; `applyPlanAsAdmin()` di `api.ts`
  adalah tempat plan diterapkan setelah pembayaran sah.
- `supabase/config.toml` masih berisi default lokal; tidak berpengaruh ke produksi.

## 8. Jebakan yang sudah pernah menggigit

Baca sebelum debug — semuanya nyata dan sudah diperbaiki sekali.

1. **PATCH PostgREST balas 200 walau 0 baris ter-update.** RLS memblokir di klausa
   WHERE tanpa error. Selalu verifikasi nilai di database, jangan cuma status code.
2. **`.insert().select()` butuh policy SELECT.** Untuk tabel yang sengaja tidak bisa
   dibaca anon (`rsvp`), RETURNING akan ditolak 401/42501. Insert tanpa `.select()`.
3. **Fungsi trigger yang membaca tabel ber-RLS harus `security definer`**, kalau tidak
   pengecekannya selalu gagal tanpa error.
4. **Urutan route penting.** `/demo/:themeKey` harus didaftarkan **sebelum**
   `/:slug/:guestSlug`, kalau tidak akan dianggap sebagai undangan. Tambahkan juga kata
   baru ke `RESERVED_SLUGS` (`src/lib/constants.ts`) **dan** `RESERVED` di
   `functions/_lib/og.ts`.
5. **Koneksi langsung Supabase bisa IPv6-only.** Kalau `db push` gagal connect, pakai
   Session pooler lewat `SUPABASE_DB_HOST`.
6. **`key` tema di `theme-tokens.ts` harus sama persis dengan kolom `themes.key`.**
   Ketidaksamaan tidak memunculkan error, hanya jatuh ke tema default. Ada pemeriksaan
   manual di `check-themes` (lihat §9).
7. **Rahasia hanya di `.env.local`, bukan `.env`.** `.env` ikut ter-commit dan isinya
   terkirim ke browser; `.env.local` di-ignore. Lihat §11.

## 9. Perintah

| Perintah | Fungsi |
|---|---|
| `npm install` | install dependensi |
| `npm run dev` | dev server di `0.0.0.0:5173` (bisa diakses dari WiFi) |
| `npm run build` | typecheck + build produksi ke `dist/` |
| `npm run preview` | coba hasil build |
| `npm run lint` | ESLint (`--max-warnings 0`, harus bersih) |
| `npm run typecheck` | TypeScript |
| `npm run db:push` | push migrasi ke Supabase |

Definition of done untuk setiap perubahan: `npm run lint` bersih,
`npx tsc -b --noEmit` bersih, `npm run build` sukses, dan alur terkait diuji minimal
lewat REST/API seperti yang sudah dilakukan pada pengujian sebelumnya.

## 10. Keputusan yang masih terbuka

- Detail isi section per tema belum difinalkan (sekarang semua tema memakai section
  yang sama, hanya beda palet/ornamen/font).
- Daftar kata reserved untuk slug belum difinalkan.
- Kebijakan retensi undangan `expired`: dihapus otomatis atau diarsipkan permanen.
- Kuota undangan ditegakkan di sisi klien, belum ada constraint di database.
- `preview_image` tema masih kosong; galeri memakai mockup CSS, bukan screenshot.
- Belum ada halaman reset password walau Supabase sudah mendukungnya.
- Belum ada `robots.txt` / `noindex`. Undangan bersifat privat per pasangan, jadi
  sebaiknya halaman `/:slug` tidak diindeks mesin pencari. Perlu diputuskan apakah
  memakai `public/robots.txt` dengan `Disallow: /` atau menambahkan
  `<meta name="robots" content="noindex">` di halaman undangan saja.

## 11. Rahasia & file `.env`

Aturan pembagiannya:

| File | Status | Isi |
|---|---|---|
| `.env` | **di-commit** | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `APP_URL` |
| `.env.local` | di-ignore (`.env.*`) | `SUPABASE_DB_PASSWORD` |
| `.env.example` | di-commit | placeholder, untuk dokumentasi |

Nilai di `.env` memang **bukan rahasia**: anon key Supabase ikut ter-bundle ke
JavaScript yang dikirim ke browser, dan RLS-lah yang membatasi aksesnya. Amannya
menyimpannya di repo untuk kemudahan setup.

`SUPABASE_DB_PASSWORD` berbeda kelas: password itu memberi akses penuh ke Postgres dan
**melewati seluruh RLS**. Nilainya disimpan di `.env.local`.
`scripts/db-push.mjs` membaca `.env` lalu menimpanya dengan `.env.local`, jadi
`npm run db:push` tetap jalan tanpa password ada di git.

Aturan untuk perubahan berikutnya:

- Rahasia baru (service role key, secret payment gateway, dsb.) → `.env.local`, **jangan**
  `.env`.
- Domain `irkop.eu.org` dan project ini terikat ke pemilik repo. Kalau repo dibuat
  publik, jangan pernah menambahkan rahasia ke `.env`.
- Kalau ada rahasia yang terlanjur masuk history git: rotasi kredensialnya lebih dulu
  (Supabase → Project Settings → Database → Reset password), baru bersihkan history
  dengan `git filter-repo`. History permanen — rotasi tetap wajib.
- Untuk produksi, kredensial cukup diisi sebagai environment variables Cloudflare
  Pages; tidak perlu ada di repo sama sekali.
