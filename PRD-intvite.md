# PRD — Intvite (Platform Undangan Digital Self-Service)

Versi: 1.0 (Draft final hasil diskusi)
Status domain: sementara di `intvite.irkop.eu.org`, subdomain bisa diganti kapan saja tanpa mengunci kode

---

## 1. Ringkasan Project

Intvite adalah platform undangan digital berbasis self-service: user mendaftar, memilih tema, mengisi konten undangan sendiri lewat dashboard, lalu membagikan link ke tamu lewat WhatsApp. Ada panel admin terpisah untuk mengelola user, tema, plan, dan verifikasi pembayaran.

Referensi model bisnis: [wevitation.com](https://www.wevitation.com/) (SaaS self-service penuh) — bukan [undangandigital.id](https://undangandigital.id/) yang modelnya jasa manual berbalut katalog.

## 2. Posisi & Infrastruktur

| Aspek | Keputusan |
|---|---|
| Posisi terhadap IRKOP | Berdiri sendiri — Supabase project baru, tidak terikat audit/skema IRKOP Content Platform |
| Domain | `intvite.irkop.eu.org` (numpang nama besar IRKOP untuk kredibilitas, infra tetap terpisah), diganti sendiri belakangan via env + DNS |
| Repo | Satu repo, satu Vite app (bukan dua package/monorepo workspace) |
| Deploy | Lokal → test → push GitHub → build Cloudflare Pages |
| Database | Supabase (Postgres + Auth + Storage) |
| Stack frontend | React 18 + TypeScript + Vite + Tailwind + lucide-react + supabase-js |
| Migrasi skema | Supabase CLI, folder `supabase/migrations/`, di-commit ke Git — bukan diedit manual lewat dashboard Supabase |

## 3. Target User & Model Harga

- Target: publik/umum.
- Fase awal: **semua fitur gratis**, tapi struktur plan & kuota sudah dibangun penuh sejak awal — tinggal di-toggle lewat panel admin saat siap monetisasi, tanpa migrasi ulang.
- Pembayaran (fase MVP): transfer manual + verifikasi admin di panel. Tabel `orders` dirancang dari awal agar siap disambung ke payment gateway (Midtrans/Xendit/Mayar) nanti.

## 4. Struktur Aplikasi & Routing

Satu Vite app, dipecah 3 area lewat routing, masing-masing di-*code-split* (React.lazy/dynamic import per area) supaya tamu yang buka undangan tidak ikut men-download bundle dashboard/admin:

| Area | Path | Isi |
|---|---|---|
| Dashboard user | `/app/*` | Login, buat/kelola undangan, pilih tema, daftar tamu, RSVP masuk, ucapan |
| Panel admin | `/admin/*` | Kelola user, tema, plan, verifikasi order, moderasi |
| Undangan publik | `/[slug]/[slug-tamu]` | Halaman yang dibuka tamu lewat link WA — dibuat seringan mungkin |

**Link preview WhatsApp**: karena crawler WA tidak menjalankan JavaScript, halaman `/[slug]/[slug-tamu]` perlu dilayani lewat Cloudflare Pages Function yang mencegat request, mengambil data undangan dari Supabase, lalu inject `og:title` dan `og:image` (dari kolom `cover_image`, bukan galeri) sebelum HTML dikirim ke crawler. SEO tidak relevan di sini karena halaman bersifat privat per pasangan.

**Slug** dua lapis untuk keamanan & kerapian URL:
- `invitations.slug` — slug pasangan, unik global, memblokir kata reserved (`app`, `admin`, `api`, dll).
- `guests.slug` — slug tamu + random suffix pendek (misal `budi-santoso-x7f2`), bukan nama polos, supaya tamu tidak bisa menebak-nebak URL tamu lain dan melihat data RSVP orang lain.

## 5. Auth

- Email + password.
- Google OAuth login (client dibuatkan nanti bareng saat setup Supabase Auth).
- `auth.users` bawaan Supabase tidak diutak-atik langsung — data tambahan (nama, no. WA, role) disimpan di tabel `profiles` terpisah, terhubung via foreign key.

## 6. Tema & Plan

Model **many-to-many** lewat tabel penghubung `plan_themes`, supaya tema apa saja yang tersedia di plan apa bisa diatur ulang kapan saja lewat panel admin, tanpa migrasi atau ubah kode.

Tema MVP yang diusulkan (semua sementara di-assign ke plan Free selama fase "semua gratis"):
1. **Modern Minimalis** — clean, whitespace luas, tipografi besar
2. **Elegan/Floral** — ornamen bunga, palet pastel/earth tone
3. **Adat/Tradisional** — motif batik/ornamen lokal, cocok format akad+resepsi adat

Contoh struktur tier untuk saat monetisasi diaktifkan nanti (tinggal atur baris `plan_themes`, tidak sentuh kode):

| Plan | Tema | Guest | Foto | Durasi |
|---|---|---|---|---|
| Free | 3 tema basic | 50 | 10 | 30 hari |
| Medium | 8 tema (3 basic + 5 eksklusif) | 300 | 50 | 90 hari |
| Premium | Semua tema | 1000 | 200 | 365 hari |

## 7. Storage & Biaya

Risiko biaya terbesar (Supabase free tier storage terbatas). Mitigasi:
- Kompresi wajib di sisi client sebelum upload.
- Kuota per fitur dibaca dari data plan (`max_guests`, `max_photos`), bukan hardcode.
- Kolom `storage_used_bytes` di `invitations`, di-update tiap upload — supaya foto besar-tapi-sedikit tetap kena kontrol, bukan cuma dibatasi jumlah file.
- Musik latar: user tempel link saja (tidak di-hosting sendiri) untuk MVP.

## 8. Skema Database

### `profiles`
Data tambahan user, terpisah dari `auth.users` bawaan Supabase.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid, PK, FK → `auth.users.id` | |
| `full_name` | text | |
| `phone` | text | nomor WA |
| `role` | text | `user` / `admin`, default `user` |
| `created_at` | timestamptz | default now() |

### `plans`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid, PK | |
| `key` | text, unik | `free`, `medium`, `premium` |
| `name` | text | nama tampil |
| `price` | integer | rupiah, default 0, belum aktif dipakai |
| `max_guests` | integer | |
| `max_photos` | integer | |
| `active_duration_days` | integer | |
| `theme_quota` | integer, nullable | null = bebas pilih semua tema yang di-assign |
| `features` | jsonb | `{"amplop_digital": true, "custom_music": true, ...}` |
| `sort_order` | integer | urutan tampil di halaman pricing |
| `is_active` | boolean | default true |
| `created_at` | timestamptz | |

### `themes`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid, PK | |
| `key` | text, unik | dipetakan ke komponen React di frontend, misal `modern-minimalist` |
| `name` | text | |
| `preview_image` | text | url |
| `category` | text, nullable | `basic` / `eksklusif`, untuk filter galeri tema |
| `is_active` | boolean | default true |
| `created_at` | timestamptz | |

### `plan_themes`
Tabel penghubung many-to-many.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `plan_id` | uuid, FK → `plans.id` | |
| `theme_id` | uuid, FK → `themes.id` | |
| PK gabungan | `(plan_id, theme_id)` | |

### `invitations`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid, PK | |
| `owner_id` | uuid, FK → `profiles.id` | |
| `slug` | text, unik global | dicek terhadap daftar kata reserved |
| `plan_id` | uuid, FK → `plans.id` | default plan gratis |
| `theme_id` | uuid, FK → `themes.id` | |
| `status` | text | `draft` / `published` / `expired` / `archived` |
| `groom_name`, `bride_name` | text | |
| `event_date` | date | |
| `cover_image` | text | url, khusus untuk `og:image`, rasio/ukuran fix — terpisah dari galeri |
| `content` | jsonb | isi section fleksibel (cerita, jadwal acara, lokasi, dll — sesuai kerangka section tema) |
| `storage_used_bytes` | bigint | default 0, diupdate tiap upload |
| `published_at`, `expires_at` | timestamptz | |
| `created_at`, `updated_at` | timestamptz | |

### `guests`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid, PK | |
| `invitation_id` | uuid, FK → `invitations.id` | |
| `name` | text | |
| `slug` | text | nama + random suffix, unik per invitation, dipakai di URL personal |
| `whatsapp_sent_at` | timestamptz, nullable | opsional, tracking distribusi |
| `created_at` | timestamptz | |

### `rsvp`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid, PK | |
| `invitation_id` | uuid, FK | |
| `guest_id` | uuid, FK, nullable | nullable karena RSVP publik tanpa link personal juga mungkin |
| `attendance` | text | `hadir` / `tidak_hadir` / `masih_ragu` |
| `guest_count` | integer | jumlah orang yang hadir |
| `created_at` | timestamptz | |

### `wishes`
Ucapan & doa.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid, PK | |
| `invitation_id` | uuid, FK | |
| `guest_name` | text | diisi manual oleh tamu (bukan selalu dari tabel `guests`) |
| `message` | text | |
| `is_visible` | boolean | default true, bisa disembunyikan pemilik undangan |
| `created_at` | timestamptz | |

### `orders`
Disiapkan sejak awal walau payment gateway belum aktif.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid, PK | |
| `invitation_id` | uuid, FK | |
| `plan_id` | uuid, FK | plan yang dibeli/upgrade |
| `amount` | integer | |
| `payment_method` | text | `manual_transfer` (MVP), disiapkan untuk gateway lain |
| `status` | text | `pending` / `verified` / `rejected` |
| `proof_url` | text, nullable | bukti transfer |
| `verified_by` | uuid, FK → `profiles.id`, nullable | admin yang verifikasi |
| `created_at`, `verified_at` | timestamptz | |

## 9. Row Level Security (RLS) — Prinsip Dasar

- `invitations`, `guests`, `rsvp`, `wishes`, `orders`: user hanya bisa CRUD baris miliknya sendiri (`owner_id` / relasi ke `invitation.owner_id`), dicek lewat `auth.uid()`.
- Role `admin` dicek dari kolom `profiles.role`, bukan hardcode email — policy admin di-attach ke semua tabel untuk akses penuh (baca/tulis) demi kebutuhan panel admin.
- Halaman undangan publik (akses oleh tamu, tanpa login) hanya boleh **membaca** baris `invitations` yang `status = 'published'`, dan boleh **insert** ke `rsvp`/`wishes` tanpa perlu autentikasi.
- `plans`, `themes`, `plan_themes`: baca publik untuk semua orang (dipakai di halaman pricing & pilih tema), tulis hanya admin.

## 10. MVP Scope

**Termasuk:** auth (email+Google), buat undangan, 3 tema awal, editor konten, daftar tamu + link personal, RSVP, ucapan & doa, galeri foto, amplop digital (info rekening), panel admin (kelola user/tema/plan/order).

**Ditunda (pasca-MVP):** gift registry, event planner, live streaming, QR check-in, layar penerima tamu, fitur AI, aplikasi mobile, payment gateway otomatis.

## 11. Pertanyaan/Keputusan Terbuka

- Detail isi tiap section per tema (jadwal acara, lokasi via maps, dsb.) belum di-breakdown — menyusul saat desain komponen tema.
- Daftar lengkap kata reserved untuk `slug` invitation belum difinalkan.
- Kebijakan retensi undangan yang `expired` (dihapus otomatis, atau diarsipkan permanen) belum diputuskan.
