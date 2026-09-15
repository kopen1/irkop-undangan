import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarHeart,
  Copy,
  ExternalLink,
  Plus,
  Send,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import {
  countGuestsByInvitation,
  countRsvpByInvitation,
  deleteInvitation,
  listInvitations,
} from "../../lib/api";
import { APP_URL } from "../../lib/supabase";
import type { InvitationFull } from "../../lib/types";
import { STATUS_LABELS } from "../../lib/constants";
import { cn, formatDate } from "../../lib/utils";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { PageLoader } from "../../components/ui/Spinner";

const STATUS_TONE: Record<string, "slate" | "green" | "amber" | "rose"> = {
  draft: "slate",
  published: "green",
  expired: "amber",
  archived: "rose",
};

export default function DashboardHome() {
  const { user } = useAuth();
  const toast = useToast();
  const [invitations, setInvitations] = useState<InvitationFull[]>([]);
  const [guestCounts, setGuestCounts] = useState<Record<string, number>>({});
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, { total: number; attending: number }>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<InvitationFull | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const rows = await listInvitations(user.id);
        if (!active) return;
        setInvitations(rows);
        const ids = rows.map((row) => row.id);
        const [guests, rsvp] = await Promise.all([
          countGuestsByInvitation(ids),
          countRsvpByInvitation(ids),
        ]);
        if (!active) return;
        setGuestCounts(guests);
        setRsvpCounts(rsvp);
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [user, toast]);

  const totals = useMemo(() => {
    const guests = Object.values(guestCounts).reduce((sum, value) => sum + value, 0);
    const attending = Object.values(rsvpCounts).reduce((sum, value) => sum + value.attending, 0);
    const published = invitations.filter((item) => item.status === "published").length;
    return { guests, attending, published };
  }, [guestCounts, rsvpCounts, invitations]);

  const handleCopy = async (slug: string) => {
    await navigator.clipboard.writeText(`${APP_URL}/${slug}`);
    toast.success("Link undangan disalin.");
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteInvitation(pendingDelete.id);
      setInvitations((current) => current.filter((item) => item.id !== pendingDelete.id));
      toast.success("Undangan dihapus.");
      setPendingDelete(null);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader label="Memuat undangan..." />;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Undangan saya</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola semua undangan digitalmu di sini.
          </p>
        </div>
        <Link to="/app/invitations/new">
          <Button>
            <Plus className="h-4 w-4" /> Buat undangan
          </Button>
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard icon={CalendarHeart} label="Undangan terbit" value={String(totals.published)} />
        <StatCard icon={Users} label="Total tamu" value={String(totals.guests)} />
        <StatCard icon={Wallet} label="Perkiraan hadir" value={String(totals.attending)} />
      </div>

      <div className="mt-8">
        {invitations.length === 0 ? (
          <EmptyState
            icon={CalendarHeart}
            title="Belum ada undangan"
            description="Mulai dengan membuat undangan pertamamu. Pilih tema, isi detail, lalu bagikan."
            action={
              <Link to="/app/invitations/new">
                <Button>
                  <Plus className="h-4 w-4" /> Buat undangan
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {invitations.map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                guestCount={guestCounts[invitation.id] ?? 0}
                rsvp={rsvpCounts[invitation.id] ?? { total: 0, attending: 0 }}
                onCopy={() => handleCopy(invitation.slug)}
                onDelete={() => setPendingDelete(invitation)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus undangan ini?"
        description={
          pendingDelete
            ? `"${pendingDelete.groom_name || "?"} & ${pendingDelete.bride_name || "?"}" beserta semua tamu, RSVP, dan ucapan akan dihapus permanen.`
            : undefined
        }
        confirmLabel="Hapus permanen"
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-xl font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function InvitationCard({
  invitation,
  guestCount,
  rsvp,
  onCopy,
  onDelete,
}: {
  invitation: InvitationFull;
  guestCount: number;
  rsvp: { total: number; attending: number };
  onCopy: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-32 bg-gradient-to-br from-rose-100 via-amber-50 to-slate-100">
        {invitation.cover_image ? (
          <img
            src={invitation.cover_image}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-3xl text-rose-300">
            {invitation.groom_name?.charAt(0) || "I"}
            <span className="mx-2 text-rose-200">&</span>
            {invitation.bride_name?.charAt(0) || "V"}
          </div>
        )}
        <div className="absolute right-2 top-2">
          <Badge tone={STATUS_TONE[invitation.status] ?? "slate"}>
            {STATUS_LABELS[invitation.status] ?? invitation.status}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-semibold text-slate-900">
          {invitation.groom_name || "Mempelai pria"} &amp;{" "}
          {invitation.bride_name || "Mempelai wanita"}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          {formatDate(invitation.event_date)} · Tema {invitation.theme?.name ?? "-"}
        </p>

        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {guestCount} tamu
          </span>
          <span className="inline-flex items-center gap-1">
            <Send className="h-3.5 w-3.5" /> {rsvp.total} RSVP
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <Link to={`/app/invitations/${invitation.id}`} className="flex-1">
            <Button variant="primary" size="sm" className="w-full">
              Kelola
            </Button>
          </Link>
          <Button variant="outline" size="icon" onClick={onCopy} title="Salin link">
            <Copy className="h-4 w-4" />
          </Button>
          {invitation.status === "published" ? (
            <a
              href={`${APP_URL}/${invitation.slug}`}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-50",
              )}
              title="Lihat undangan"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
          <Button variant="ghost" size="icon" onClick={onDelete} title="Hapus">
            <Trash2 className="h-4 w-4 text-rose-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}
