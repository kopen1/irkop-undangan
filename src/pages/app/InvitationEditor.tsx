import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  ExternalLink,
  Home,
  Images,
  LayoutList,
  MessageSquareHeart,
  Palette,
  Send,
  Settings2,
  Users,
} from "lucide-react";
import { getInvitation, updateInvitation } from "../../lib/api";
import { APP_URL } from "../../lib/supabase";
import type { InvitationFull } from "../../lib/types";
import { STATUS_LABELS } from "../../lib/constants";
import { cn } from "../../lib/utils";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { PageLoader } from "../../components/ui/Spinner";
import type { EditorTabProps, InvitationPatch } from "./editor/types";
import EditorDetailTab from "./editor/EditorDetailTab";
import EditorStudioTab from "./editor/EditorStudioTab";
import EditorContentTab from "./editor/EditorContentTab";
import EditorGalleryTab from "./editor/EditorGalleryTab";
import EditorGuestsTab from "./editor/EditorGuestsTab";
import EditorRsvpTab from "./editor/EditorRsvpTab";
import EditorWishesTab from "./editor/EditorWishesTab";
import EditorPlanTab from "./editor/EditorPlanTab";

const TABS = [
  { key: "detail", label: "Detail & Tema", icon: Settings2 },
  { key: "studio", label: "Studio", icon: Palette },
  { key: "konten", label: "Konten", icon: LayoutList },
  { key: "galeri", label: "Galeri", icon: Images },
  { key: "tamu", label: "Tamu", icon: Users },
  { key: "rsvp", label: "RSVP", icon: Send },
  { key: "ucapan", label: "Ucapan", icon: MessageSquareHeart },
  { key: "plan", label: "Plan", icon: CreditCard },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const STATUS_TONE: Record<string, "slate" | "green" | "amber" | "rose"> = {
  draft: "slate",
  published: "green",
  expired: "amber",
  archived: "rose",
};

export default function InvitationEditor() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState<InvitationFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const tab = (searchParams.get("tab") as TabKey) ?? "detail";

  const reload = useCallback(async () => {
    if (!id) return;
    const row = await getInvitation(id);
    setInvitation(row);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    getInvitation(id)
      .then((row) => {
        if (active) setInvitation(row);
      })
      .catch(() => {
        if (active) setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const update = useCallback(
    async (patch: InvitationPatch) => {
      if (!id) return;
      await updateInvitation(id, patch);
      await reload();
    },
    [id, reload],
  );

  if (loading) return <PageLoader label="Memuat undangan..." />;

  if (notFound || !invitation) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-600">Undangan tidak ditemukan atau bukan milikmu.</p>
        <Button className="mt-4" onClick={() => navigate("/app")}>
          Kembali ke dashboard
        </Button>
      </div>
    );
  }

  const tabProps: EditorTabProps = { invitation, reload, update };

  return (
    <div>
      <Link
        to="/app"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" /> Semua undangan
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 font-display text-lg font-semibold text-white">
            {(invitation.groom_name || "?").charAt(0)}
            <span className="mx-0.5 text-rose-300">&</span>
            {(invitation.bride_name || "?").charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-semibold text-slate-900">
                {invitation.groom_name || "Mempelai"} &amp; {invitation.bride_name || "Mempelai"}
              </h1>
              <Badge tone={STATUS_TONE[invitation.status] ?? "slate"}>
                {STATUS_LABELS[invitation.status]}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">
              {APP_URL}/{invitation.slug}
            </p>
          </div>
        </div>
        {invitation.status === "published" ? (
          <a href={`${APP_URL}/${invitation.slug}`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" /> Lihat undangan
            </Button>
          </a>
        ) : (
          <Button
            size="sm"
            variant="soft"
            onClick={() => setSearchParams({ tab: "detail" })}
            title="Terbitkan dari tab Detail"
          >
            <Home className="h-4 w-4" /> Belum terbit
          </Button>
        )}
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200 pb-px scrollbar-hide">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setSearchParams({ tab: item.key })}
            className={cn(
              "flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition",
              tab === item.key
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "detail" ? <EditorDetailTab {...tabProps} /> : null}
        {tab === "studio" ? <EditorStudioTab {...tabProps} /> : null}
        {tab === "konten" ? <EditorContentTab {...tabProps} /> : null}
        {tab === "galeri" ? <EditorGalleryTab {...tabProps} /> : null}
        {tab === "tamu" ? <EditorGuestsTab {...tabProps} /> : null}
        {tab === "rsvp" ? <EditorRsvpTab {...tabProps} /> : null}
        {tab === "ucapan" ? <EditorWishesTab {...tabProps} /> : null}
        {tab === "plan" ? <EditorPlanTab {...tabProps} /> : null}
      </div>
    </div>
  );
}
