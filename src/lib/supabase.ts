import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient<Database> = createClient<Database>(
  url ?? "http://localhost:54321",
  anonKey ?? "public-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

/**
 * VITE_APP_URL=auto (atau dikosongkan) membuat link undangan mengikuti alamat
 * yang sedang dipakai — localhost saat dev, IP LAN saat dites dari HP, dan
 * domain sendiri saat sudah ter-deploy. Tidak perlu ganti config per environment.
 */
const configuredAppUrl = ((import.meta.env.VITE_APP_URL as string | undefined) ?? "").trim();

export const APP_URL =
  configuredAppUrl && configuredAppUrl !== "auto"
    ? configuredAppUrl.replace(/\/+$/, "")
    : typeof window !== "undefined"
      ? window.location.origin
      : "";
