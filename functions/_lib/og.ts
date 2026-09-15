/**
 * Helper untuk Cloudflare Pages Function: menyuntikkan meta og:* ke index.html
 * agar preview link WhatsApp menampilkan nama pasangan + cover undangan.
 * Crawler WhatsApp tidak menjalankan JavaScript, jadi injeksi harus di server.
 */

export interface OGInvitation {
  slug: string;
  groom_name: string | null;
  bride_name: string | null;
  event_date: string | null;
  cover_image: string | null;
  status: string;
}

export interface OGEnv {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  APP_URL?: string;
}

export const RESERVED = new Set([
  "app",
  "admin",
  "api",
  "auth",
  "login",
  "logout",
  "register",
  "dashboard",
  "pricing",
  "privacy",
  "terms",
  "demo",
  "tema",
  "theme",
  "assets",
  "static",
  "public",
  "www",
  "favicon",
  "robots",
  "sitemap",
]);

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function fetchInvitation(
  env: OGEnv,
  slug: string,
): Promise<OGInvitation | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return null;
  const url =
    `${env.SUPABASE_URL}/rest/v1/invitations` +
    `?slug=eq.${encodeURIComponent(slug)}&status=eq.published` +
    `&select=slug,groom_name,bride_name,event_date,cover_image,status&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      },
    });
    if (!response.ok) return null;
    const rows = (await response.json()) as OGInvitation[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export function buildMetaTags(invitation: OGInvitation, guestName: string | null, appUrl: string): string {
  const couple = [invitation.groom_name, invitation.bride_name].filter(Boolean).join(" & ");
  const title = escapeHtml(couple ? `Undangan ${couple}` : "Undangan Pernikahan");
  const description = guestName
    ? escapeHtml(`Kepada ${guestName} — undangan pernikahan ${couple}`)
    : escapeHtml(
        invitation.event_date
          ? `Undangan pernikahan ${couple} pada ${invitation.event_date}`
          : `Undangan pernikahan ${couple}`,
      );
  const pageUrl = escapeHtml(`${appUrl}/${invitation.slug}${guestName ? `/${guestName}` : ""}`);
  const image = invitation.cover_image ? escapeHtml(invitation.cover_image) : "";

  const tags = [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Invite" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${pageUrl}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
  ];

  if (image) {
    tags.push(`<meta property="og:image" content="${image}" />`);
    tags.push(`<meta name="twitter:image" content="${image}" />`);
  }

  return tags.join("\n    ");
}

export function injectTags(html: string, tags: string, title: string): string {
  let output = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  if (output.includes("</head>")) {
    output = output.replace("</head>", `  ${tags}\n  </head>`);
  }
  return output;
}

export function htmlResponse(html: string, status = 200): Response {
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300",
    },
  });
}
