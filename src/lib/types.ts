import type { Json } from "./database.types";
import type { ThemeKey } from "./constants";

export interface Opening {
  greeting: string;
  quote: string;
  quote_source: string;
}

export interface StoryItem {
  id: string;
  time: string;
  title: string;
  description: string;
}

export interface EventItem {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  address: string;
  maps_url: string;
}

export interface GiftAccount {
  id: string;
  bank: string;
  account_number: string;
  account_name: string;
}

export interface InvitationContent {
  opening: Opening;
  story: StoryItem[];
  events: EventItem[];
  photos: string[];
  gift: GiftAccount[];
  music_url: string;
  closing: string;
}

export const EMPTY_CONTENT: InvitationContent = {
  opening: { greeting: "", quote: "", quote_source: "" },
  story: [],
  events: [],
  photos: [],
  gift: [],
  music_url: "",
  closing: "",
};

export function parseContent(raw: Json | null | undefined): InvitationContent {
  const value = (raw ?? {}) as Partial<InvitationContent>;
  return {
    opening: { ...EMPTY_CONTENT.opening, ...(value.opening ?? {}) },
    story: Array.isArray(value.story) ? value.story : [],
    events: Array.isArray(value.events) ? value.events : [],
    photos: Array.isArray(value.photos) ? value.photos : [],
    gift: Array.isArray(value.gift) ? value.gift : [],
    music_url: typeof value.music_url === "string" ? value.music_url : "",
    closing: typeof value.closing === "string" ? value.closing : "",
  };
}

export type InvitationStatus = "draft" | "published" | "expired" | "archived";

export interface InvitationRow {
  id: string;
  owner_id: string;
  slug: string;
  plan_id: string;
  theme_id: string;
  status: InvitationStatus;
  groom_name: string | null;
  bride_name: string | null;
  event_date: string | null;
  cover_image: string | null;
  content: Json;
  storage_used_bytes: number;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanRow {
  id: string;
  key: string;
  name: string;
  price: number;
  max_invitations: number;
  max_guests: number;
  max_photos: number;
  active_duration_days: number;
  theme_quota: number | null;
  features: Json;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export type PlanFeature =
  | "amplop_digital"
  | "custom_music"
  | "galeri"
  | "rsvp"
  | "tanpa_watermark"
  | "domain_custom";

/** Baca kolom jsonb `plans.features`. Plan tanpa fitur = false. */
export function planHasFeature(
  plan: { features: Json } | null | undefined,
  key: PlanFeature,
): boolean {
  if (!plan) return false;
  const features = plan.features as Record<string, unknown> | null;
  return features?.[key] === true;
}

export interface ThemeRow {
  id: string;
  key: string;
  name: string;
  preview_image: string | null;
  category: "basic" | "eksklusif" | null;
  is_active: boolean;
  created_at: string;
}

export interface GuestRow {
  id: string;
  invitation_id: string;
  name: string;
  slug: string;
  whatsapp_sent_at: string | null;
  created_at: string;
}

export interface RsvpRow {
  id: string;
  invitation_id: string;
  guest_id: string | null;
  attendance: "hadir" | "tidak_hadir" | "masih_ragu";
  guest_count: number;
  created_at: string;
}

export interface WishRow {
  id: string;
  invitation_id: string;
  guest_name: string;
  message: string;
  is_visible: boolean;
  created_at: string;
}

export interface OrderRow {
  id: string;
  invitation_id: string;
  plan_id: string;
  amount: number;
  payment_method: string;
  status: "pending" | "verified" | "rejected";
  proof_url: string | null;
  verified_by: string | null;
  created_at: string;
  verified_at: string | null;
}

export interface ProfileRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "user" | "admin";
  created_at: string;
}

export interface InvitationFull extends InvitationRow {
  theme: Pick<ThemeRow, "id" | "key" | "name"> | null;
  plan: Pick<
    PlanRow,
    | "id"
    | "key"
    | "name"
    | "max_invitations"
    | "max_guests"
    | "max_photos"
    | "active_duration_days"
    | "theme_quota"
    | "features"
  > | null;
}

export interface OrderFull extends OrderRow {
  plan: Pick<PlanRow, "id" | "key" | "name" | "price"> | null;
  invitation: Pick<InvitationRow, "id" | "slug" | "groom_name" | "bride_name" | "owner_id"> | null;
  owner: Pick<ProfileRow, "id" | "full_name" | "phone"> | null;
}

export type { ThemeKey };
