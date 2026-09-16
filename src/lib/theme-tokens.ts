/**
 * Definisi tema undangan.
 *
 * Setiap tema hanya berupa kumpulan token warna/tipe/ornamen. Komponennya
 * digambar oleh satu `ThemeRenderer`, jadi menambah tema baru cukup menambah
 * satu entri di sini + baris di tabel `themes` (key-nya harus sama).
 */

import { WEDDING_PHOTOS } from "./stock-photos";
import type { CoverStyle } from "./types";

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

/**
 * Arketipe layout. Menentukan susunan/gaya section, bukan sekadar palet warna.
 * - minimal   : bersih, heading kiri, tanpa ornamen, banyak ruang kosong.
 * - floral    : heading tengah, aksen bunga/daun, section lembut.
 * - editorial : cover full-bleed, kutipan berbingkai, foto arch, acara timeline.
 * - framed    : bingkai dekoratif halaman, divider motif, kartu berbingkai.
 */
export type ThemeLayout = "minimal" | "floral" | "editorial" | "framed";

/** Gaya judul section per tema. */
export type SectionHeaderStyle = "left" | "center" | "eyebrow" | "rule";
/** Gaya blok mempelai per tema. */
export type CoupleStyle = "circles" | "arch" | "portrait" | "monogram";
/** Gaya daftar acara per tema. */
export type EventsStyle = "cards" | "timeline" | "list";
/** Gaya galeri per tema. */
export type GalleryStyle = "grid" | "masonry";
/** Gaya pembatas antar section per tema. */
export type DividerStyle = "none" | "line" | "diamond";
/** Gaya blok cerita cinta per tema. */
export type StoryStyle = "timeline" | "list" | "cards";
/** Gaya blok pembuka per tema. */
export type OpeningStyle = "plain" | "boxed" | "framed" | "quote";
/** Gaya blok penutup per tema. */
export type ClosingStyle = "plain" | "big" | "framed";
/** Dekor halaman per tema. */
export type DecorStyle = "none" | "frame" | "vignette";
/** Gaya blok amplop digital per tema. */
export type GiftStyle = "cards" | "list";
/** Gaya daftar ucapan per tema. */
export type WishesStyle = "cards" | "plain" | "panel";
/** Gaya blok RSVP per tema. */
export type RsvpStyle = "card" | "plain" | "panel";
/** Font nama mempelai: heading tema atau script. */
export type NameFont = "heading" | "script";

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
  /** Arketipe layout; diisi otomatis lewat pemetaan setelah katalog dibuat. */
  layout?: ThemeLayout;
  /** Gaya cover khas tema; diisi otomatis lewat pemetaan. */
  coverStyle?: CoverStyle;
  /** Gaya desain section khas tema; diisi otomatis lewat pemetaan. */
  header?: SectionHeaderStyle;
  couple?: CoupleStyle;
  events?: EventsStyle;
  gallery?: GalleryStyle;
  divider?: DividerStyle;
  story?: StoryStyle;
  opening?: OpeningStyle;
  closing?: ClosingStyle;
  decor?: DecorStyle;
  pattern?: string;
  gift?: GiftStyle;
  wishes?: WishesStyle;
  rsvp?: RsvpStyle;
  nameFont?: NameFont;
  coverTagline?: string;
  /** Foto contoh untuk kartu galeri tema (bukan screenshot tema). */
  preview_image?: string;
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

const LAYOUT_BY_THEME: Record<string, ThemeLayout> = {
  "modern-minimalist": "minimal",
  "aesthetic-putih": "minimal",
  "marble-elegan": "minimal",
  "elegan-floral": "floral",
  "rustic-boho": "floral",
  "tropical-bali": "floral",
  "sakura-zen": "floral",
  "adat-tradisional": "framed",
  "islamic-arabesque": "framed",
  "vintage-retro": "framed",
  "luxury-gold": "editorial",
  "cinematic-dark": "editorial",
};

const COVER_BY_THEME: Record<string, CoverStyle> = {
  "modern-minimalist": "minimal",
  "aesthetic-putih": "panel",
  "elegan-floral": "framed",
  "rustic-boho": "split",
  "adat-tradisional": "arch",
  "luxury-gold": "full",
  "marble-elegan": "panel",
  "islamic-arabesque": "arch",
  "tropical-bali": "full",
  "vintage-retro": "framed",
  "sakura-zen": "centered",
  "cinematic-dark": "full",
};

interface ThemeDesign {
  header: SectionHeaderStyle;
  couple: CoupleStyle;
  events: EventsStyle;
  gallery: GalleryStyle;
  divider: DividerStyle;
}

/** Kombinasi desain section per tema supaya tiap template punya UI sendiri. */
const DESIGN_BY_THEME: Record<string, ThemeDesign> = {
  "modern-minimalist": {
    header: "left",
    couple: "monogram",
    events: "list",
    gallery: "grid",
    divider: "line",
  },
  "aesthetic-putih": {
    header: "eyebrow",
    couple: "circles",
    events: "cards",
    gallery: "grid",
    divider: "line",
  },
  "elegan-floral": {
    header: "center",
    couple: "portrait",
    events: "cards",
    gallery: "masonry",
    divider: "diamond",
  },
  "rustic-boho": {
    header: "left",
    couple: "circles",
    events: "list",
    gallery: "masonry",
    divider: "line",
  },
  "adat-tradisional": {
    header: "rule",
    couple: "portrait",
    events: "cards",
    gallery: "grid",
    divider: "diamond",
  },
  "luxury-gold": {
    header: "eyebrow",
    couple: "arch",
    events: "timeline",
    gallery: "masonry",
    divider: "diamond",
  },
  "marble-elegan": {
    header: "left",
    couple: "circles",
    events: "cards",
    gallery: "grid",
    divider: "line",
  },
  "islamic-arabesque": {
    header: "rule",
    couple: "arch",
    events: "cards",
    gallery: "masonry",
    divider: "diamond",
  },
  "tropical-bali": {
    header: "center",
    couple: "portrait",
    events: "cards",
    gallery: "masonry",
    divider: "line",
  },
  "vintage-retro": {
    header: "rule",
    couple: "monogram",
    events: "list",
    gallery: "grid",
    divider: "diamond",
  },
  "sakura-zen": {
    header: "eyebrow",
    couple: "circles",
    events: "timeline",
    gallery: "masonry",
    divider: "line",
  },
  "cinematic-dark": {
    header: "left",
    couple: "arch",
    events: "list",
    gallery: "masonry",
    divider: "none",
  },
};

const STORY_BY_THEME: Record<string, StoryStyle> = {
  "modern-minimalist": "list",
  "aesthetic-putih": "cards",
  "elegan-floral": "timeline",
  "rustic-boho": "list",
  "adat-tradisional": "timeline",
  "luxury-gold": "timeline",
  "marble-elegan": "cards",
  "islamic-arabesque": "timeline",
  "tropical-bali": "cards",
  "vintage-retro": "list",
  "sakura-zen": "timeline",
  "cinematic-dark": "list",
};

const OPENING_BY_THEME: Record<string, OpeningStyle> = {
  "modern-minimalist": "plain",
  "aesthetic-putih": "boxed",
  "elegan-floral": "framed",
  "rustic-boho": "plain",
  "adat-tradisional": "framed",
  "luxury-gold": "quote",
  "marble-elegan": "boxed",
  "islamic-arabesque": "framed",
  "tropical-bali": "quote",
  "vintage-retro": "boxed",
  "sakura-zen": "plain",
  "cinematic-dark": "quote",
};

const CLOSING_BY_THEME: Record<string, ClosingStyle> = {
  "modern-minimalist": "plain",
  "aesthetic-putih": "framed",
  "elegan-floral": "big",
  "rustic-boho": "plain",
  "adat-tradisional": "framed",
  "luxury-gold": "big",
  "marble-elegan": "plain",
  "islamic-arabesque": "framed",
  "tropical-bali": "big",
  "vintage-retro": "framed",
  "sakura-zen": "big",
  "cinematic-dark": "big",
};

const DECOR_BY_THEME: Record<string, DecorStyle> = {
  "luxury-gold": "frame",
  "cinematic-dark": "vignette",
};

const GIFT_BY_THEME: Record<string, GiftStyle> = {
  "modern-minimalist": "list",
  "rustic-boho": "list",
  "vintage-retro": "list",
  "cinematic-dark": "list",
};

const WISHES_BY_THEME: Record<string, WishesStyle> = {
  "modern-minimalist": "plain",
  "rustic-boho": "plain",
  "vintage-retro": "plain",
  "cinematic-dark": "plain",
  "elegan-floral": "panel",
  "luxury-gold": "panel",
  "islamic-arabesque": "panel",
  "tropical-bali": "panel",
  "sakura-zen": "panel",
  "adat-tradisional": "panel",
};

const RSVP_BY_THEME: Record<string, RsvpStyle> = {
  "modern-minimalist": "plain",
  "cinematic-dark": "plain",
  "elegan-floral": "panel",
  "luxury-gold": "panel",
  "islamic-arabesque": "panel",
  "tropical-bali": "panel",
  "sakura-zen": "panel",
  "adat-tradisional": "panel",
  "vintage-retro": "panel",
};

const COVER_TAGLINE_BY_THEME: Record<string, string> = {
  "modern-minimalist": "Our Wedding Day",
  "aesthetic-putih": "We're getting married",
  "elegan-floral": "We're getting married",
  "rustic-boho": "Our Wedding Day",
  "adat-tradisional": "We're getting married",
  "luxury-gold": "Together with joy",
  "marble-elegan": "The Wedding Of",
  "islamic-arabesque": "We're getting married",
  "tropical-bali": "Our Wedding Day",
  "vintage-retro": "We're getting married",
  "sakura-zen": "Our Wedding Day",
  "cinematic-dark": "Save the date",
};

const NAME_FONT_BY_THEME: Record<string, NameFont> = {
  "elegan-floral": "script",
  "adat-tradisional": "script",
  "luxury-gold": "script",
  "islamic-arabesque": "script",
  "tropical-bali": "script",
  "vintage-retro": "script",
  "sakura-zen": "script",
};

for (const [index, theme] of THEMES.entries()) {
  theme.preview_image = WEDDING_PHOTOS[index % WEDDING_PHOTOS.length];
  theme.layout = LAYOUT_BY_THEME[theme.key] ?? "floral";
  theme.coverStyle = COVER_BY_THEME[theme.key] ?? "centered";
  theme.story = STORY_BY_THEME[theme.key] ?? "timeline";
  theme.opening = OPENING_BY_THEME[theme.key] ?? "plain";
  theme.closing = CLOSING_BY_THEME[theme.key] ?? "plain";
  theme.decor = DECOR_BY_THEME[theme.key] ?? "none";
  theme.gift = GIFT_BY_THEME[theme.key] ?? "cards";
  theme.wishes = WISHES_BY_THEME[theme.key] ?? "cards";
  theme.rsvp = RSVP_BY_THEME[theme.key] ?? "card";
  theme.nameFont = NAME_FONT_BY_THEME[theme.key] ?? "heading";
  theme.coverTagline = COVER_TAGLINE_BY_THEME[theme.key];
  const design = DESIGN_BY_THEME[theme.key];
  if (design) {
    theme.header = design.header;
    theme.couple = design.couple;
    theme.events = design.events;
    theme.gallery = design.gallery;
    theme.divider = design.divider;
  }
}

export const THEME_MAP = new Map(THEMES.map((theme) => [theme.key, theme]));

export function getThemeTokens(key: string | null | undefined): ThemeTokens {
  return (key && THEME_MAP.get(key)) || THEMES[0];
}

/** Layout untuk sebuah tema; fallback ke "floral". */
export function themeLayout(key: string | null | undefined): ThemeLayout {
  return getThemeTokens(key).layout ?? "floral";
}

export const FREE_THEME_KEYS = THEMES.filter((t) => t.category === "basic").map((t) => t.key);
export const PREMIUM_THEME_KEYS = THEMES.filter((t) => t.category === "eksklusif").map((t) => t.key);
