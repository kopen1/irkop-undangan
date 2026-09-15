export const RESERVED_SLUGS = new Set([
  "app",
  "admin",
  "api",
  "auth",
  "login",
  "logout",
  "register",
  "dashboard",
  "pricing",
  "demo",
  "tema",
  "theme",
  "themes",
  "help",
  "about",
  "contact",
  "privacy",
  "terms",
  "settings",
  "assets",
  "static",
  "public",
  "www",
  "mail",
  "blog",
  "docs",
  "support",
  "null",
  "undefined",
  "new",
  "edit",
  "delete",
  "invitation",
  "invitations",
  "guest",
  "guests",
  "rsvp",
  "wishes",
  "order",
  "orders",
  "payment",
  "checkout",
  "callback",
  "webhook",
  "sitemap",
  "robots",
  "favicon",
  "_next",
  "supabase",
  "functions",
  "cdn",
]);

export const THEME_KEYS = [
  "modern-minimalist",
  "elegan-floral",
  "adat-tradisional",
] as const;

export type ThemeKey = (typeof THEME_KEYS)[number];

export const ATTENDANCE_LABELS: Record<string, string> = {
  hadir: "Hadir",
  tidak_hadir: "Tidak hadir",
  masih_ragu: "Masih ragu",
};

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  published: "Terbit",
  expired: "Kadaluarsa",
  archived: "Arsip",
};

export const MVP_SECTION_HINT =
  "Isi section fleksibel per tema (cerita, jadwal acara, lokasi, dsb).";

/** Platform sosial media untuk dropdown di editor. "Lainnya" diisi manual. */
export const SOCIAL_PLATFORMS = [
  "Instagram",
  "Facebook",
  "TikTok",
  "X (Twitter)",
  "YouTube",
  "LinkedIn",
  "Website",
] as const;

/** Rekomendasi salam & kutipan pembuka. Tetap bisa diedit manual. */
export const OPENING_PRESETS: Array<{
  label: string;
  greeting: string;
  quote: string;
  quote_source: string;
}> = [
  {
    label: "Islami — Assalamualaikum (QS. Ar-Rum: 21)",
    greeting: "Assalamualaikum Warahmatullahi Wabarakatuh",
    quote:
      "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berfikir.",
    quote_source: "QS. Ar-Rum: 21",
  },
  {
    label: "Islami — Bertakwalah (QS. An-Nisa: 1)",
    greeting: "Assalamualaikum Warahmatullahi Wabarakatuh",
    quote:
      "Hai sekalian manusia, bertakwalah kepada Tuhan-mu yang telah menciptakan kamu dari seorang diri, dan dari padanya Allah menciptakan isterinya; dan dari pada keduanya Allah memperkembang biakkan laki-laki dan perempuan yang banyak. Dan bertakwalah kepada Allah yang dengan (mempergunakan) nama-Nya kamu saling meminta satu sama lain, dan (peliharalah) hubungan silaturrahim. Sesungguhnya Allah selalu menjaga dan mengawasi kamu.",
    quote_source: "QS. An-Nisa: 1",
  },
  {
    label: "Umum — tanpa kutipan",
    greeting: "Salam sejahtera untuk kita semua",
    quote: "",
    quote_source: "",
  },
];

/**
 * Musik latar default untuk plan Free. Sumber: Mixkit
 * (https://mixkit.co/license/) — bebas royalti, tanpa atribusi.
 */
export const DEFAULT_MUSIC = {
  label: "Serene View — Arulo",
  url: "https://assets.mixkit.co/music/443/443.mp3",
};

/** Rekomendasi musik latar untuk plan berbayar; tetap bisa diisi link sendiri. */
export const MUSIC_PRESETS = [
  DEFAULT_MUSIC,
  { label: "Romantic — Francisco Alvear", url: "https://assets.mixkit.co/music/659/659.mp3" },
  { label: "Beautiful Dream — Diego Nava", url: "https://assets.mixkit.co/music/493/493.mp3" },
  {
    label: "Valley Sunset — Alejandro Magaña (A. M.)",
    url: "https://assets.mixkit.co/music/127/127.mp3",
  },
  {
    label: "Sun and His Daughter — Eugenio Mininni",
    url: "https://assets.mixkit.co/music/580/580.mp3",
  },
  {
    label: "Forest Treasure — Alejandro Magaña (A. M.)",
    url: "https://assets.mixkit.co/music/138/138.mp3",
  },
];

/** Rekomendasi kalimat penutup undangan. Tetap bisa diedit manual. */
export const CLOSING_PRESETS: Array<{ label: string; text: string }> = [
  {
    label: "Doa restu",
    text: "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara berkenan hadir untuk memberikan doa restu.",
  },
  {
    label: "Terima kasih singkat",
    text: "Terima kasih atas doa dan restunya. Sampai jumpa di hari bahagia kami.",
  },
  {
    label: "Islami",
    text: "Barakallahu lakuma wa baraka alaikuma. Terima kasih atas doa restu yang diberikan.",
  },
];

/** Rekomendasi acara untuk mengisi tab Acara dengan cepat. */
export const EVENT_PRESETS: Array<{ label: string; name: string; time: string }> = [
  { label: "Akad Nikah", name: "Akad Nikah", time: "08.00 - 10.00 WIB" },
  { label: "Resepsi", name: "Resepsi", time: "11.00 - 14.00 WIB" },
  { label: "Ngunduh Mantu", name: "Ngunduh Mantu", time: "11.00 - 14.00 WIB" },
  { label: "Tasyakuran", name: "Tasyakuran", time: "10.00 - 12.00 WIB" },
];
