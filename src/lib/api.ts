import { supabase } from "./supabase";
import type { Database, Json } from "./database.types";
import type {
  GuestRow,
  InvitationFull,
  InvitationRow,
  OrderFull,
  OrderRow,
  PlanRow,
  ProfileRow,
  RsvpRow,
  ThemeRow,
  WishRow,
} from "./types";
import { parseContent, type InvitationContent } from "./types";
import { guestSlugFromName, uniqueSlug } from "./utils";

interface PostgrestLike<T> {
  data: T | null;
  error: { message: string } | null;
}

function unwrap<T>(response: PostgrestLike<T>): T {
  if (response.error) throw new Error(response.error.message);
  return response.data as T;
}

/* -------------------------------------------------------------------------- */
/* Meta: plans, themes, plan_themes                                           */
/* -------------------------------------------------------------------------- */

export async function listPlans(activeOnly = false): Promise<PlanRow[]> {
  let query = supabase.from("plans").select("*").order("sort_order");
  if (activeOnly) query = query.eq("is_active", true);
  return unwrap(await query) as PlanRow[];
}

export async function listThemes(activeOnly = false): Promise<ThemeRow[]> {
  let query = supabase.from("themes").select("*").order("created_at");
  if (activeOnly) query = query.eq("is_active", true);
  return unwrap(await query) as ThemeRow[];
}

export async function listPlanThemes(): Promise<
  Array<{ plan_id: string; theme_id: string }>
> {
  return unwrap(await supabase.from("plan_themes").select("plan_id, theme_id")) as Array<{
    plan_id: string;
    theme_id: string;
  }>;
}

export async function getFreePlan(): Promise<PlanRow> {
  const plans = await listPlans();
  const free = plans.find((plan) => plan.key === "free") ?? plans[0];
  if (!free) throw new Error("Plan default belum di-seed. Jalankan migrasi seed.");
  return free;
}

async function buildInvitationFull(rows: InvitationRow[]): Promise<InvitationFull[]> {
  if (rows.length === 0) return [];
  const [themes, plans] = await Promise.all([listThemes(), listPlans()]);
  const themeMap = new Map(themes.map((theme) => [theme.id, theme]));
  const planMap = new Map(plans.map((plan) => [plan.id, plan]));

  return rows.map((row) => {
    const theme = themeMap.get(row.theme_id);
    const plan = planMap.get(row.plan_id);
    return {
      ...row,
      theme: theme ? { id: theme.id, key: theme.key, name: theme.name } : null,
      plan: plan
        ? {
            id: plan.id,
            key: plan.key,
            name: plan.name,
            max_invitations: plan.max_invitations,
            max_guests: plan.max_guests,
            max_photos: plan.max_photos,
            active_duration_days: plan.active_duration_days,
            theme_quota: plan.theme_quota,
            features: plan.features,
          }
        : null,
    };
  });
}

/* -------------------------------------------------------------------------- */
/* Invitations                                                                */
/* -------------------------------------------------------------------------- */

export async function listInvitations(ownerId: string): Promise<InvitationFull[]> {
  const rows = unwrap(
    await supabase
      .from("invitations")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false }),
  ) as InvitationRow[];
  return buildInvitationFull(rows);
}

export async function getInvitation(id: string): Promise<InvitationFull> {
  const row = unwrap(
    await supabase.from("invitations").select("*").eq("id", id).maybeSingle(),
  ) as InvitationRow | null;
  if (!row) throw new Error("Undangan tidak ditemukan.");
  const [full] = await buildInvitationFull([row]);
  return full;
}

export async function getInvitationBySlug(slug: string): Promise<InvitationFull | null> {
  const row = unwrap(
    await supabase
      .from("invitations")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle(),
  ) as InvitationRow | null;
  if (!row) return null;
  const [full] = await buildInvitationFull([row]);
  return full;
}

/** Berapa undangan milik user ini yang memakai plan tertentu (kuota plan). */
export async function countInvitationsForPlan(
  ownerId: string,
  planId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("invitations")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId)
    .eq("plan_id", planId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function slugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("invitations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return true;
  return data.id === excludeId;
}

export async function createInvitation(input: {
  ownerId: string;
  slug: string;
  planId: string;
  themeId: string;
  groomName?: string;
  brideName?: string;
  eventDate?: string | null;
  content?: InvitationContent;
}): Promise<InvitationRow> {
  return unwrap(
    await supabase
      .from("invitations")
      .insert({
        owner_id: input.ownerId,
        slug: input.slug,
        plan_id: input.planId,
        theme_id: input.themeId,
        groom_name: input.groomName ?? null,
        bride_name: input.brideName ?? null,
        event_date: input.eventDate ?? null,
        status: "draft",
        content: (input.content ?? {}) as unknown as Json,
      })
      .select("*")
      .single(),
  ) as InvitationRow;
}

export async function updateInvitation(
  id: string,
  patch: Partial<{
    slug: string;
    theme_id: string;
    plan_id: string;
    status: InvitationRow["status"];
    groom_name: string | null;
    bride_name: string | null;
    event_date: string | null;
    cover_image: string | null;
    content: InvitationContent;
    storage_used_bytes: number;
    published_at: string | null;
    expires_at: string | null;
  }>,
): Promise<InvitationRow> {
  const payload = {
    ...patch,
    ...(patch.content ? { content: patch.content as unknown as Json } : {}),
  } as unknown as Database["public"]["Tables"]["invitations"]["Update"];
  return unwrap(
    await supabase.from("invitations").update(payload).eq("id", id).select("*").single(),
  ) as InvitationRow;
}

export async function deleteInvitation(id: string): Promise<void> {
  const { error } = await supabase.from("invitations").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function publishInvitation(
  id: string,
  durationDays: number,
): Promise<InvitationRow> {
  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + durationDays);
  return updateInvitation(id, {
    status: "published",
    published_at: now.toISOString(),
    expires_at: expires.toISOString(),
  });
}

export async function unpublishInvitation(id: string): Promise<InvitationRow> {
  return updateInvitation(id, { status: "draft" });
}

/* -------------------------------------------------------------------------- */
/* Guests                                                                     */
/* -------------------------------------------------------------------------- */

export async function listGuests(invitationId: string): Promise<GuestRow[]> {
  return unwrap(
    await supabase
      .from("guests")
      .select("*")
      .eq("invitation_id", invitationId)
      .order("created_at", { ascending: false }),
  ) as GuestRow[];
}

/**
 * Daftar tamu tidak lagi bisa dibaca publik, jadi pencarian tamu lewat link
 * personal memakai fungsi exact-match (hanya mengembalikan satu baris).
 * Dipakai untuk mengambil nama kanonik dan menautkan RSVP ke tamu terdaftar.
 */
export async function findGuestBySlug(
  invitationSlug: string,
  guestSlug: string,
): Promise<{ id: string; name: string } | null> {
  const { data, error } = await supabase.rpc("get_guest_by_slug", {
    p_invitation_slug: invitationSlug,
    p_guest_slug: guestSlug,
  });
  if (error) return null;
  const rows = (data ?? []) as Array<{ id: string; name: string }>;
  return rows[0] ?? null;
}

export async function countGuestsByInvitation(
  invitationIds: string[],
): Promise<Record<string, number>> {
  if (invitationIds.length === 0) return {};
  const rows = unwrap(
    await supabase.from("guests").select("invitation_id").in("invitation_id", invitationIds),
  ) as Array<{ invitation_id: string }>;
  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.invitation_id] = (acc[row.invitation_id] ?? 0) + 1;
    return acc;
  }, {});
}

export async function countRsvpByInvitation(
  invitationIds: string[],
): Promise<Record<string, { total: number; attending: number }>> {
  if (invitationIds.length === 0) return {};
  const rows = unwrap(
    await supabase
      .from("rsvp")
      .select("invitation_id, attendance, guest_count")
      .in("invitation_id", invitationIds),
  ) as Array<Pick<RsvpRow, "invitation_id" | "attendance" | "guest_count">>;
  return rows.reduce<Record<string, { total: number; attending: number }>>((acc, row) => {
    const current = acc[row.invitation_id] ?? { total: 0, attending: 0 };
    current.total += 1;
    if (row.attendance === "hadir") current.attending += row.guest_count;
    acc[row.invitation_id] = current;
    return acc;
  }, {});
}

async function listGuestSlugs(invitationId: string): Promise<Set<string>> {
  const rows = unwrap(
    await supabase.from("guests").select("slug").eq("invitation_id", invitationId),
  ) as Array<{ slug: string }>;
  return new Set(rows.map((row) => row.slug));
}

export async function addGuest(invitationId: string, name: string): Promise<GuestRow> {
  const taken = await listGuestSlugs(invitationId);
  const slug = uniqueSlug(guestSlugFromName(name), taken);
  return unwrap(
    await supabase
      .from("guests")
      .insert({ invitation_id: invitationId, name, slug })
      .select("*")
      .single(),
  ) as GuestRow;
}

export async function addGuestsBulk(
  invitationId: string,
  names: string[],
): Promise<GuestRow[]> {
  const taken = await listGuestSlugs(invitationId);
  const rows = names.map((name) => {
    const slug = uniqueSlug(guestSlugFromName(name), taken);
    taken.add(slug);
    return { invitation_id: invitationId, name, slug };
  });
  return unwrap(
    await supabase.from("guests").insert(rows).select("*"),
  ) as GuestRow[];
}

export async function updateGuest(
  id: string,
  patch: Partial<Pick<GuestRow, "name" | "slug" | "whatsapp_sent_at">>,
): Promise<GuestRow> {
  return unwrap(
    await supabase.from("guests").update(patch).eq("id", id).select("*").single(),
  ) as GuestRow;
}

export async function deleteGuest(id: string): Promise<void> {
  const { error } = await supabase.from("guests").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* -------------------------------------------------------------------------- */
/* RSVP                                                                       */
/* -------------------------------------------------------------------------- */

export async function listRsvp(invitationId: string): Promise<RsvpRow[]> {
  return unwrap(
    await supabase
      .from("rsvp")
      .select("*")
      .eq("invitation_id", invitationId)
      .order("created_at", { ascending: false }),
  ) as RsvpRow[];
}

/**
 * RSVP bersifat privat (hanya pemilik undangan yang boleh membaca), jadi insert
 * tidak boleh memakai `.select()` — RETURNING akan menuntut policy SELECT untuk
 * anon dan ditolak RLS.
 */
export async function submitRsvp(input: {
  invitationId: string;
  guestId?: string | null;
  attendance: RsvpRow["attendance"];
  guestCount: number;
}): Promise<void> {
  const { error } = await supabase.from("rsvp").insert({
    invitation_id: input.invitationId,
    guest_id: input.guestId ?? null,
    attendance: input.attendance,
    guest_count: input.guestCount,
  });
  if (error) throw new Error(error.message);
}

/* -------------------------------------------------------------------------- */
/* Wishes                                                                     */
/* -------------------------------------------------------------------------- */

export async function listWishes(
  invitationId: string,
  visibleOnly = false,
): Promise<WishRow[]> {
  let query = supabase
    .from("wishes")
    .select("*")
    .eq("invitation_id", invitationId)
    .order("created_at", { ascending: false });
  if (visibleOnly) query = query.eq("is_visible", true);
  return unwrap(await query) as WishRow[];
}

export async function submitWish(input: {
  invitationId: string;
  guestName: string;
  message: string;
}): Promise<WishRow> {
  return unwrap(
    await supabase
      .from("wishes")
      .insert({
        invitation_id: input.invitationId,
        guest_name: input.guestName,
        message: input.message,
      })
      .select("*")
      .single(),
  ) as WishRow;
}

export async function setWishVisibility(id: string, isVisible: boolean): Promise<void> {
  const { error } = await supabase
    .from("wishes")
    .update({ is_visible: isVisible })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteWish(id: string): Promise<void> {
  const { error } = await supabase.from("wishes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* -------------------------------------------------------------------------- */
/* Orders                                                                     */
/* -------------------------------------------------------------------------- */

export async function listOrdersForInvitation(invitationId: string): Promise<OrderRow[]> {
  return unwrap(
    await supabase
      .from("orders")
      .select("*")
      .eq("invitation_id", invitationId)
      .order("created_at", { ascending: false }),
  ) as OrderRow[];
}

export async function createOrder(input: {
  invitationId: string;
  planId: string;
  amount: number;
  proofUrl?: string | null;
}): Promise<OrderRow> {
  return unwrap(
    await supabase
      .from("orders")
      .insert({
        invitation_id: input.invitationId,
        plan_id: input.planId,
        amount: input.amount,
        proof_url: input.proofUrl ?? null,
        status: "pending",
        payment_method: "manual_transfer",
      })
      .select("*")
      .single(),
  ) as OrderRow;
}

export async function listAllOrders(): Promise<OrderFull[]> {
  const orders = unwrap(
    await supabase.from("orders").select("*").order("created_at", { ascending: false }),
  ) as OrderRow[];
  if (orders.length === 0) return [];

  const planIds = [...new Set(orders.map((o) => o.plan_id))];
  const invitationIds = [...new Set(orders.map((o) => o.invitation_id))];

  const [plansResponse, invitationsResponse] = await Promise.all([
    supabase.from("plans").select("*").in("id", planIds),
    supabase
      .from("invitations")
      .select("id, slug, groom_name, bride_name, owner_id")
      .in("id", invitationIds),
  ]);

  const plans = unwrap(plansResponse) as PlanRow[];
  const invitations = unwrap(invitationsResponse) as Array<
    Pick<InvitationRow, "id" | "slug" | "groom_name" | "bride_name" | "owner_id">
  >;

  const ownerIds = [...new Set(invitations.map((i) => i.owner_id))];
  const profiles = ownerIds.length
    ? (unwrap(
        await supabase
          .from("profiles")
          .select("id, full_name, phone, role, created_at")
          .in("id", ownerIds),
      ) as ProfileRow[])
    : [];

  const planMap = new Map(plans.map((p) => [p.id, p]));
  const invitationMap = new Map(invitations.map((i) => [i.id, i]));
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  return orders.map((order) => {
    const plan = planMap.get(order.plan_id);
    const invitation = invitationMap.get(order.invitation_id);
    const owner = invitation ? profileMap.get(invitation.owner_id) : undefined;
    return {
      ...order,
      plan: plan ? { id: plan.id, key: plan.key, name: plan.name, price: plan.price } : null,
      invitation: invitation ?? null,
      owner: owner ? { id: owner.id, full_name: owner.full_name, phone: owner.phone } : null,
    } satisfies OrderFull;
  });
}

export async function verifyOrder(
  orderId: string,
  status: "verified" | "rejected",
  adminId: string,
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status, verified_by: adminId, verified_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) throw new Error(error.message);
}

export async function applyPlanAsAdmin(
  invitationId: string,
  planId: string,
  durationDays: number,
): Promise<void> {
  const expires = new Date();
  expires.setDate(expires.getDate() + durationDays);
  const { error } = await supabase
    .from("invitations")
    .update({ plan_id: planId, expires_at: expires.toISOString() })
    .eq("id", invitationId);
  if (error) throw new Error(error.message);
}

/* -------------------------------------------------------------------------- */
/* Admin                                                                      */
/* -------------------------------------------------------------------------- */

export async function listProfiles(): Promise<ProfileRow[]> {
  return unwrap(
    await supabase.from("profiles").select("*").order("created_at", { ascending: false }),
  ) as ProfileRow[];
}

export async function updateProfileRole(
  id: string,
  role: "user" | "admin",
): Promise<void> {
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function upsertTheme(input: {
  id?: string;
  key: string;
  name: string;
  preview_image?: string | null;
  category?: "basic" | "eksklusif" | null;
  is_active?: boolean;
}): Promise<ThemeRow> {
  return unwrap(
    await supabase.from("themes").upsert(input).select("*").single(),
  ) as ThemeRow;
}

export async function deleteTheme(id: string): Promise<void> {
  const { error } = await supabase.from("themes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function upsertPlan(input: {
  id?: string;
  key: string;
  name: string;
  price?: number;
  max_invitations?: number;
  max_guests?: number;
  max_photos?: number;
  active_duration_days?: number;
  theme_quota?: number | null;
  features?: Json;
  sort_order?: number;
  is_active?: boolean;
}): Promise<PlanRow> {
  return unwrap(
    await supabase.from("plans").upsert(input).select("*").single(),
  ) as PlanRow;
}

export async function setPlanThemes(planId: string, themeIds: string[]): Promise<void> {
  const { error: deleteError } = await supabase
    .from("plan_themes")
    .delete()
    .eq("plan_id", planId);
  if (deleteError) throw new Error(deleteError.message);
  if (themeIds.length === 0) return;
  const { error } = await supabase
    .from("plan_themes")
    .insert(themeIds.map((themeId) => ({ plan_id: planId, theme_id: themeId })));
  if (error) throw new Error(error.message);
}

/* -------------------------------------------------------------------------- */
/* Storage                                                                    */
/* -------------------------------------------------------------------------- */

export type PublicBucket = "covers" | "photos";

export async function uploadInvitationImage(
  bucket: PublicBucket,
  invitationId: string,
  file: File | Blob,
  ext = "jpg",
): Promise<{ path: string; url: string; size: number }> {
  const path = `${invitationId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || "image/jpeg",
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, url: data.publicUrl, size: file.size };
}

export function publicUrl(bucket: PublicBucket, path: string): string {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function removeStorageObject(
  bucket: PublicBucket | "payment-proofs",
  path: string,
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(error.message);
}

export async function uploadPaymentProof(userId: string, file: File): Promise<string> {
  const path = `${userId}/${crypto.randomUUID()}.${file.name.split(".").pop() ?? "jpg"}`;
  const { error } = await supabase.storage.from("payment-proofs").upload(path, file, {
    upsert: false,
    contentType: file.type || "image/jpeg",
  });
  if (error) throw new Error(error.message);
  return path;
}

export async function signedProofUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("payment-proofs")
    .createSignedUrl(path, 60 * 30);
  if (error) return null;
  return data.signedUrl;
}

export async function getPublicInvitationStats(invitationId: string): Promise<{
  guestCount: number;
  wishCount: number;
  attending: number;
}> {
  const [rsvp, wishes] = await Promise.all([listRsvp(invitationId), listWishes(invitationId)]);
  return {
    guestCount: 0,
    wishCount: wishes.length,
    attending: rsvp
      .filter((r) => r.attendance === "hadir")
      .reduce((sum, r) => sum + r.guest_count, 0),
  };
}

export { parseContent };
