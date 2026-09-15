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
