import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { HeartOff } from "lucide-react";
import { findGuestBySlug, getInvitationBySlug, listWishes } from "../../lib/api";
import { parseContent, type InvitationFull, type WishRow } from "../../lib/types";
import { guestNameFromSlug } from "../../lib/utils";
import ThemeRenderer from "./invitation/ThemeRenderer";

export default function PublicInvitation() {
  const { slug, guestSlug } = useParams<{ slug: string; guestSlug?: string }>();
  const [invitation, setInvitation] = useState<InvitationFull | null>(null);
  const [guestName, setGuestName] = useState<string | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [wishes, setWishes] = useState<WishRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);

    (async () => {
      const found = await getInvitationBySlug(slug);
      if (!active) return;
      setInvitation(found);

      if (found) {
        document.title = `${found.groom_name ?? ""} & ${found.bride_name ?? ""} — Undangan`;
        setWishes(await listWishes(found.id, true));
        if (guestSlug) {
          // Nama tamu diambil langsung dari URL, jadi siapa pun bisa mengedit
          // nama di link tanpa perlu menambah tamu ke daftar. Kalau tamunya
          // memang terdaftar, pakai nama kanonik + tautkan RSVP-nya.
          const registered = await findGuestBySlug(slug, guestSlug);
          if (!active) return;
          setGuestName(registered?.name ?? guestNameFromSlug(guestSlug));
          setGuestId(registered?.id ?? null);
        }
      }
      if (active) setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [slug, guestSlug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <HeartOff className="h-7 w-7" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold text-slate-900">
          Undangan tidak ditemukan
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-600">
          Link mungkin salah, sudah kadaluarsa, atau undangan belum diterbitkan pemiliknya.
        </p>
        <Link
          to="/"
          className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Kunjungi Invite
        </Link>
      </div>
    );
  }

  return (
    <ThemeRenderer
      invitation={invitation}
      content={parseContent(invitation.content)}
      guestName={guestName}
      guestId={guestId}
      wishes={wishes}
      onNewWish={(wish) => setWishes((current) => [wish, ...current])}
      onRsvpDone={() => undefined}
    />
  );
}
