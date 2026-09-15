import {
  RESERVED,
  buildMetaTags,
  fetchInvitation,
  htmlResponse,
  injectTags,
  type OGEnv,
} from "../_lib/og";

interface Context {
  request: Request;
  env: OGEnv & { ASSETS: { fetch: (input: Request | URL | string) => Promise<Response> } };
  params: Record<string, string | string[]>;
  next: () => Promise<Response>;
}

export async function onRequestGet(context: Context): Promise<Response> {
  return handle(context);
}

export async function onRequest(context: Context): Promise<Response> {
  if (context.request.method !== "GET") return context.next();
  return handle(context);
}

async function fetchGuestName(context: Context, invitationIdSlug: string, guestSlug: string) {
  const { env } = context;
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return null;
  const url =
    `${env.SUPABASE_URL}/rest/v1/guests` +
    `?select=name&slug=eq.${encodeURIComponent(guestSlug)}` +
    `&invitation_id=in.(select id from invitations where slug=eq.${encodeURIComponent(invitationIdSlug)})` +
    `&limit=1`;
  try {
    const response = await fetch(url, {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      },
    });
    if (!response.ok) return null;
    const rows = (await response.json()) as Array<{ name: string }>;
    return rows[0]?.name ?? null;
  } catch {
    return null;
  }
}

async function handle(context: Context): Promise<Response> {
  const { request, env, params } = context;
  const slug = String(params.slug);
  const guestSlug = String(params.guest);
  const accept = request.headers.get("accept") ?? "";

  const asset = await env.ASSETS.fetch(new URL("/index.html", request.url));

  if (!accept.includes("text/html") || RESERVED.has(slug)) {
    return asset;
  }

  const invitation = await fetchInvitation(env, slug);
  if (!invitation) return asset;

  const guestName = await fetchGuestName(context, slug, guestSlug);
  const html = await asset.text();
  const appUrl =
    env.APP_URL && env.APP_URL !== "auto" ? env.APP_URL : new URL(request.url).origin;
  const couple = [invitation.groom_name, invitation.bride_name].filter(Boolean).join(" & ");
  const tags = buildMetaTags(invitation, guestName, appUrl);
  return htmlResponse(injectTags(html, tags, `Undangan ${couple}`));
}
