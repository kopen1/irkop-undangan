import type { InvitationContent, InvitationFull, WishRow } from "./types";
import type { ThemeTokens } from "./theme-tokens";

/**
 * Data contoh untuk halaman demo tema. Foto dibuat sebagai SVG data-URI supaya
 * pratinjau tetap jalan tanpa koneksi ke layanan gambar eksternal.
 */
function demoPhoto(from: string, to: string, accent: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/>
</linearGradient></defs>
<rect width="800" height="1000" fill="url(#g)"/>
<circle cx="400" cy="380" r="130" fill="${accent}" opacity="0.16"/>
<circle cx="400" cy="380" r="180" fill="none" stroke="${accent}" stroke-opacity="0.18" stroke-width="3"/>
<path d="M240 730l110-130 80 90 70-60 120 150z" fill="${accent}" opacity="0.22"/>
<path d="M250 800h300" stroke="${accent}" stroke-opacity="0.3" stroke-width="8" stroke-linecap="round"/>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function buildDemoContent(tokens: ThemeTokens): InvitationContent {
  const { accent, text } = tokens.preview;
  return {
    opening: {
      greeting: "Assalamualaikum Warahmatullahi Wabarakatuh",
      quote:
        "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri supaya kamu dapat ketenangan hati.",
      quote_source: "QS. Ar-Rum: 21",
    },
    story: [
      {
        id: "s1",
        time: "2019",
        title: "Pertama Bertemu",
        description:
          "Berawal dari satu proyek kampus, kami mulai sering menghabiskan waktu bersama.",
      },
      {
        id: "s2",
        time: "2022",
        title: "Mulai Menjalin",
        description: "Belajar saling memahami, melewati jarak dan perbedaan dengan sabar.",
      },
      {
        id: "s3",
        time: "2026",
        title: "Lamaran",
        description: "Dengan restu kedua keluarga, kami memantapkan langkah ke jenjang berikutnya.",
      },
    ],
    events: [
      {
        id: "e1",
        name: "Akad Nikah",
        date: "2026-12-12",
        time: "08.00 - 10.00 WIB",
        location: "Masjid Al-Falah",
        address: "Jl. Melati No. 12, Bandung, Jawa Barat",
        maps_url: "https://maps.google.com/?q=Masjid+Al-Falah+Bandung",
      },
      {
        id: "e2",
        name: "Resepsi",
        date: "2026-12-12",
        time: "11.00 - 14.00 WIB",
        location: "Gedung Graha Asri",
        address: "Jl. Anggrek No. 5, Bandung, Jawa Barat",
        maps_url: "https://maps.google.com/?q=Gedung+Graha+Asri+Bandung",
      },
    ],
    photos: [
      demoPhoto(tokens.preview.bg, accent, accent),
      demoPhoto(accent, tokens.preview.bg, text),
      demoPhoto(tokens.preview.muted, accent, text),
      demoPhoto(tokens.preview.bg, tokens.preview.muted, accent),
      demoPhoto(accent, tokens.preview.muted, text),
      demoPhoto(tokens.preview.muted, tokens.preview.bg, accent),
    ],
    gift: [
      { id: "g1", bank: "BCA", account_number: "1234567890", account_name: "Ahmad Fauzi" },
      { id: "g2", bank: "Mandiri", account_number: "0987654321", account_name: "Siti Nurhaliza" },
    ],
    music_url: "",
    closing:
      "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara berkenan hadir untuk memberikan doa restu.",
  };
}

export function buildDemoInvitation(tokens: ThemeTokens): InvitationFull {
  const now = new Date();
  return {
    id: "demo",
    owner_id: "demo",
    slug: "demo",
    plan_id: "demo",
    theme_id: tokens.key,
    status: "published",
    groom_name: "Ahmad Fauzi",
    bride_name: "Siti Nurhaliza",
    event_date: "2026-12-12",
    cover_image: null,
    content: {},
    storage_used_bytes: 0,
    published_at: now.toISOString(),
    expires_at: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    theme: { id: tokens.key, key: tokens.key, name: tokens.name },
    plan: {
      id: "demo",
      key: "premium",
      name: "Premium (demo)",
      max_invitations: 10,
      max_guests: 1000,
      max_photos: 200,
      active_duration_days: 365,
      theme_quota: null,
      features: {
        amplop_digital: true,
        custom_music: true,
        galeri: true,
        rsvp: true,
        tanpa_watermark: true,
        domain_custom: true,
      },
    },
  };
}

export const DEMO_WISHES: WishRow[] = [
  {
    id: "w1",
    invitation_id: "demo",
    guest_name: "Rizky & Keluarga",
    message: "Barakallahu lakuma wa baraka alaikuma. Semoga menjadi keluarga sakinah, mawaddah, warahmah.",
    is_visible: true,
    created_at: "2026-12-01T10:20:00.000Z",
  },
  {
    id: "w2",
    invitation_id: "demo",
    guest_name: "Dewi Lestari",
    message: "Selamat menempuh hidup baru! Semoga langgeng sampai kakek nenek.",
    is_visible: true,
    created_at: "2026-12-02T14:05:00.000Z",
  },
  {
    id: "w3",
    invitation_id: "demo",
    guest_name: "Budi Santoso",
    message: "Turut berbahagia, semoga Allah melimpahkan rezeki dan kebahagiaan untuk kalian berdua.",
    is_visible: true,
    created_at: "2026-12-03T08:40:00.000Z",
  },
];
