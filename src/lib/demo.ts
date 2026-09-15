import { THEMES, type ThemeTokens } from "./theme-tokens";
import type { InvitationContent, InvitationFull, WishRow } from "./types";
import { DEFAULT_SECTIONS } from "./types";
import { WEDDING_PHOTOS } from "./stock-photos";
import { DEFAULT_MUSIC, OPENING_PRESETS } from "./constants";

/**
 * Data contoh untuk halaman demo tema. Foto diambil dari WEDDING_PHOTOS
 * (Pexels), urutannya digeser per tema agar tiap demo tidak identik.
 */
const DEMO_PHOTOS = WEDDING_PHOTOS;

function themePhotoOffset(tokens: ThemeTokens): number {
  const index = THEMES.findIndex((theme) => theme.key === tokens.key);
  return index < 0 ? 0 : index;
}

export function buildDemoContent(tokens: ThemeTokens): InvitationContent {
  const offset = themePhotoOffset(tokens);
  const photos = DEMO_PHOTOS.map(
    (_, index) => DEMO_PHOTOS[(offset + index) % DEMO_PHOTOS.length],
  );
  return {
    opening: {
      greeting: OPENING_PRESETS[0].greeting,
      quote: OPENING_PRESETS[0].quote,
      quote_source: OPENING_PRESETS[0].quote_source,
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
        entertainment: "",
      },
      {
        id: "e2",
        name: "Resepsi",
        date: "2026-12-12",
        time: "11.00 - 14.00 WIB",
        location: "Gedung Graha Asri",
        address: "Jl. Anggrek No. 5, Bandung, Jawa Barat",
        maps_url: "https://maps.google.com/?q=Gedung+Graha+Asri+Bandung",
        entertainment: "Dangdut (Romansa)",
      },
    ],
    photos,
    groom_photo: DEMO_PHOTOS[offset % DEMO_PHOTOS.length],
    bride_photo: DEMO_PHOTOS[(offset + 2) % DEMO_PHOTOS.length],
    socials: [
      { id: "so1", platform: "Instagram", owner: "pria", url: "https://instagram.com/" },
      { id: "so2", platform: "TikTok", owner: "wanita", url: "https://tiktok.com/" },
      { id: "so3", platform: "YouTube", owner: "wanita", url: "https://youtube.com/" },
    ],
    gift: [
      { id: "g1", bank: "BCA", account_number: "1234567890", account_name: "Ahmad Fauzi" },
      { id: "g2", bank: "Mandiri", account_number: "0987654321", account_name: "Siti Nurhaliza" },
    ],
    music_url: DEFAULT_MUSIC.url,
    music_enabled: true,
    closing:
      "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara berkenan hadir untuk memberikan doa restu.",
    layout: { sections: DEFAULT_SECTIONS.map((section) => ({ ...section })) },
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
    cover_image: DEMO_PHOTOS[themePhotoOffset(tokens) % DEMO_PHOTOS.length],
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
        foto_mempelai: true,
        sosial_media: true,
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
