/**
 * Definisi tema undangan.
 *
 * Setiap tema hanya berupa kumpulan token warna/tipe/ornamen. Komponennya
 * digambar oleh satu `ThemeRenderer`, jadi menambah tema baru cukup menambah
 * satu entri di sini + baris di tabel `themes` (key-nya harus sama).
 */

export type OrnamentKind =
  | "none"
  | "minimal"
  | "floral"
  | "boho"
  | "batik"
  | "gold"
  | "arabesque"
  | "tropical"
  | "geometric"
  | "sakura"
  | "marble"
  | "cinematic";

export type ThemeCategory = "basic" | "eksklusif";

export interface ThemeTokens {
  key: string;
  name: string;
  category: ThemeCategory;
  tagline: string;
  /** Font stack untuk `--font-heading`. */
  heading: string;
  uppercaseHeading: boolean;
  page: string;
  softSection: string;
  darkSection: string;
  cover: string;
  coverButton: string;
  cta: string;
  ornament: OrnamentKind;
  galleryColumns: 2 | 3 | 4;
  /** Dipakai galeri tema untuk menggambar thumbnail (tanpa file gambar). */
  preview: { bg: string; accent: string; text: string; muted: string };
}

export const THEMES: ThemeTokens[] = [
  {
    key: "modern-minimalist",
    name: "Modern Minimalis",
    category: "basic",
    tagline: "Putih bersih, tipografi besar, tanpa ornamen.",
    heading: "'Josefin Sans', ui-sans-serif, system-ui, sans-serif",
    uppercaseHeading: false,
    page: "bg-white text-slate-800",
    softSection: "bg-slate-50",
    darkSection: "bg-slate-900 text-white",
    cover: "bg-slate-900 text-white",
    coverButton: "bg-white text-slate-900",
    cta: "bg-slate-900 text-white hover:bg-slate-800",
    ornament: "minimal",
    galleryColumns: 3,
    preview: { bg: "#0f172a", accent: "#ffffff", text: "#0f172a", muted: "#94a3b8" },
  },
  {
    key: "aesthetic-putih",
    name: "Aesthetic Putih",
    category: "basic",
    tagline: "Nuansa gading hangat dan layout lapang.",
    heading: "'Josefin Sans', ui-sans-serif, system-ui, sans-serif",
    uppercaseHeading: false,
    page: "bg-[#fbfaf8] text-stone-700",
    softSection: "bg-[#f4f1ec]",
    darkSection: "bg-stone-800 text-stone-100",
    cover: "bg-[#f4f1ec] text-stone-700",
    coverButton: "bg-stone-800 text-white",
    cta: "bg-stone-800 text-white hover:bg-stone-700",
    ornament: "minimal",
    galleryColumns: 2,
    preview: { bg: "#f4f1ec", accent: "#292524", text: "#44403c", muted: "#a8a29e" },
  },
  {
    key: "elegan-floral",
    name: "Elegan Floral",
    category: "basic",
    tagline: "Ornamen bunga dengan palet pastel yang lembut.",
    heading: "'Cormorant Garamond', ui-serif, serif",
    uppercaseHeading: false,
    page: "bg-[#fdf6f0] text-rose-900",
    softSection: "bg-rose-50/70",
    darkSection: "bg-rose-900 text-rose-50",
    cover: "bg-gradient-to-b from-rose-200 via-orange-100 to-amber-50 text-rose-900",
    coverButton: "bg-rose-600 text-white",
    cta: "bg-rose-600 text-white hover:bg-rose-500",
    ornament: "floral",
    galleryColumns: 2,
    preview: { bg: "#fde8ea", accent: "#e11d48", text: "#881337", muted: "#f0a5b1" },
  },
  {
    key: "rustic-boho",
    name: "Rustic Boho",
    category: "basic",
    tagline: "Earth tone, kering, dan terkesan handmade.",
    heading: "'Lora', ui-serif, serif",
    uppercaseHeading: false,
    page: "bg-[#faf3e8] text-[#6b4423]",
    softSection: "bg-[#f0e2cd]",
    darkSection: "bg-[#4a3524] text-[#f5e9d7]",
    cover: "bg-gradient-to-b from-[#e8d5b7] via-[#f3e5d0] to-[#faf3e8] text-[#5b3a1e]",
    coverButton: "bg-[#a9744f] text-white",
    cta: "bg-[#a9744f] text-white hover:bg-[#96643f]",
    ornament: "boho",
    galleryColumns: 3,
    preview: { bg: "#f0e2cd", accent: "#a9744f", text: "#5b3a1e", muted: "#cbb18d" },
  },
  {
    key: "adat-tradisional",
    name: "Adat Tradisional",
    category: "basic",
    tagline: "Motif batik dan nuansa kayu untuk acara adat.",
    heading: "'Marcellus', ui-serif, serif",
    uppercaseHeading: true,
    page: "bg-[#f7f1e3] text-[#4a2c17]",
    softSection: "bg-[#efe3cc]",
    darkSection: "bg-[#3f2415] text-amber-50",
    cover: "bg-gradient-to-b from-[#3f2415] via-[#5b3a22] to-[#7a5230] text-amber-50",
    coverButton: "bg-amber-400 text-[#3f2415]",
    cta: "bg-[#7a5230] text-amber-50 hover:bg-[#5b3a22]",
    ornament: "batik",
    galleryColumns: 4,
    preview: { bg: "#3f2415", accent: "#fbbf24", text: "#f7f1e3", muted: "#a1754b" },
  },

  {
    key: "luxury-gold",
    name: "Luxury Gold",
    category: "eksklusif",
    tagline: "Hitam pekat dengan aksen emas dan garis tipis.",
    heading: "'Marcellus', ui-serif, serif",
    uppercaseHeading: true,
    page: "bg-[#0d0d10] text-[#e8d9b5]",
    softSection: "bg-[#141419]",
    darkSection: "bg-[#08080a] text-[#e8d9b5]",
    cover: "bg-gradient-to-b from-black via-[#1a1712] to-[#0d0d10] text-[#e8d9b5]",
    coverButton: "bg-[#c9a227] text-black",
    cta: "bg-[#c9a227] text-black hover:bg-[#d8b23a]",
    ornament: "gold",
    galleryColumns: 3,
    preview: { bg: "#0d0d10", accent: "#c9a227", text: "#e8d9b5", muted: "#6b5d3f" },
  },
  {
    key: "marble-elegan",
    name: "Marble Elegan",
    category: "eksklusif",
    tagline: "Tekstur marmer dengan aksen tinta gelap.",
    heading: "'Cormorant Garamond', ui-serif, serif",
    uppercaseHeading: false,
    page: "pattern-marble text-slate-700",
    softSection: "bg-white/60",
    darkSection: "bg-slate-800 text-slate-100",
    cover: "pattern-marble text-slate-800",
    coverButton: "bg-slate-800 text-white",
    cta: "bg-slate-800 text-white hover:bg-slate-700",
    ornament: "marble",
    galleryColumns: 3,
    preview: { bg: "#eef2f6", accent: "#334155", text: "#334155", muted: "#94a3b8" },
  },
  {
    key: "islamic-arabesque",
    name: "Islamic Arabesque",
    category: "eksklusif",
    tagline: "Hijau zamrud, arch, dan ornamen geometris.",
    heading: "'Amiri', ui-serif, serif",
    uppercaseHeading: false,
    page: "bg-[#f5f7f2] text-[#1f3d2b]",
    softSection: "bg-[#e7efe3]",
    darkSection: "bg-[#123524] text-[#e9f2e6]",
    cover: "bg-gradient-to-b from-[#0f2e1f] via-[#17442e] to-[#1f5a3c] text-[#eaf3e6]",
    coverButton: "bg-[#d4af37] text-[#0f2e1f]",
    cta: "bg-[#1f5a3c] text-white hover:bg-[#17442e]",
    ornament: "arabesque",
    galleryColumns: 3,
    preview: { bg: "#17442e", accent: "#d4af37", text: "#eaf3e6", muted: "#5f8a72" },
  },
  {
    key: "tropical-bali",
    name: "Tropical Bali",
    category: "eksklusif",
    tagline: "Daun tropis dan gradasi hijau-turquoise.",
    heading: "'Josefin Sans', ui-sans-serif, system-ui, sans-serif",
    uppercaseHeading: false,
    page: "bg-[#f2f8f4] text-[#14532d]",
    softSection: "bg-[#e0efe4]",
    darkSection: "bg-[#0f3d2e] text-emerald-50",
    cover: "bg-gradient-to-b from-[#0f766e] via-[#14b8a6] to-[#5eead4] text-emerald-950",
    coverButton: "bg-white text-emerald-900",
    cta: "bg-[#0f766e] text-white hover:bg-[#0d6a63]",
    ornament: "tropical",
    galleryColumns: 2,
    preview: { bg: "#0f766e", accent: "#ecfdf5", text: "#e6fffb", muted: "#5eead4" },
  },
  {
    key: "vintage-retro",
    name: "Vintage Retro",
    category: "eksklusif",
    tagline: "Kertas sepia dan bingkai geometris klasik.",
    heading: "'Lora', ui-serif, serif",
    uppercaseHeading: true,
    page: "bg-[#f6efdd] text-[#5b4636]",
    softSection: "bg-[#eadfc6]",
    darkSection: "bg-[#5b4636] text-[#f6efdd]",
    cover: "bg-gradient-to-b from-[#e3d3ac] via-[#efe4c8] to-[#f6efdd] text-[#5b4636]",
    coverButton: "bg-[#8a6d3b] text-white",
    cta: "bg-[#8a6d3b] text-white hover:bg-[#755c31]",
    ornament: "geometric",
    galleryColumns: 3,
    preview: { bg: "#eadfc6", accent: "#8a6d3b", text: "#5b4636", muted: "#b8a37f" },
  },
  {
    key: "sakura-zen",
    name: "Sakura Zen",
    category: "eksklusif",
    tagline: "Kelopak sakura dan nada pink-ivory yang tenang.",
    heading: "'Cormorant Garamond', ui-serif, serif",
    uppercaseHeading: false,
    page: "bg-[#fff7f7] text-[#7a4b52]",
    softSection: "bg-[#fdeef0]",
    darkSection: "bg-[#8d5b63] text-[#fff3f4]",
    cover: "bg-gradient-to-b from-[#fbdce2] via-[#fdeef0] to-[#fff7f7] text-[#7a4b52]",
    coverButton: "bg-[#d77a8c] text-white",
    cta: "bg-[#d77a8c] text-white hover:bg-[#c96a7c]",
    ornament: "sakura",
    galleryColumns: 3,
    preview: { bg: "#fbdce2", accent: "#d77a8c", text: "#7a4b52", muted: "#e8aeb8" },
  },
  {
    key: "cinematic-dark",
    name: "Cinematic Dark",
    category: "eksklusif",
    tagline: "Gelap sinematik, kontras tinggi, sangat foto-oriented.",
    heading: "'Playfair Display', ui-serif, serif",
    uppercaseHeading: false,
    page: "bg-[#111114] text-[#d9d9de]",
    softSection: "bg-[#17171b]",
    darkSection: "bg-black text-[#e6e6ea]",
    cover: "bg-gradient-to-b from-black to-[#1b1b20] text-[#e6e6ea]",
    coverButton: "bg-white text-black",
    cta: "bg-white text-black hover:bg-slate-200",
    ornament: "cinematic",
    galleryColumns: 4,
    preview: { bg: "#111114", accent: "#ffffff", text: "#e6e6ea", muted: "#6b7280" },
  },
];

export const THEME_MAP = new Map(THEMES.map((theme) => [theme.key, theme]));

export function getThemeTokens(key: string | null | undefined): ThemeTokens {
  return (key && THEME_MAP.get(key)) || THEMES[0];
}

export const FREE_THEME_KEYS = THEMES.filter((t) => t.category === "basic").map((t) => t.key);
export const PREMIUM_THEME_KEYS = THEMES.filter((t) => t.category === "eksklusif").map((t) => t.key);
