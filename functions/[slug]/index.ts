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

async function handle(context: Context): Promise<Response> {
  const { request, env, params } = context;
  const slug = String(params.slug);
  const accept = request.headers.get("accept") ?? "";

  const assetUrl = new URL("/index.html", request.url);
  const asset = await env.ASSETS.fetch(assetUrl);

  if (!accept.includes("text/html") || RESERVED.has(slug)) {
    return asset;
  }

  const invitation = await fetchInvitation(env, slug);
  if (!invitation) return asset;

  const html = await asset.text();
  const appUrl =
    env.APP_URL && env.APP_URL !== "auto" ? env.APP_URL : new URL(request.url).origin;
  const couple = [invitation.groom_name, invitation.bride_name].filter(Boolean).join(" & ");
  const tags = buildMetaTags(invitation, null, appUrl);
  return htmlResponse(injectTags(html, tags, `Undangan ${couple}`));
}
