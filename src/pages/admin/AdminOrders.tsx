import { useEffect, useState } from "react";
import { BadgeCheck, Check, ExternalLink, X } from "lucide-react";
import {
  applyPlanAsAdmin,
  listAllOrders,
  signedProofUrl,
  verifyOrder,
} from "../../lib/api";
import type { OrderFull } from "../../lib/types";
import { formatDateTime, formatRupiah } from "../../lib/utils";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageLoader } from "../../components/ui/Spinner";

const STATUS_TONE: Record<string, "amber" | "green" | "rose"> = {
  pending: "amber",
  verified: "green",
  rejected: "rose",
};

export default function AdminOrders() {
  const { user } = useAuth();
  const toast = useToast();
  const [orders, setOrders] = useState<OrderFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("pending");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setOrders(await listAllOrders());
  };

  useEffect(() => {
    load()
      .catch((error) => toast.error((error as Error).message))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleDecision = async (order: OrderFull, status: "verified" | "rejected") => {
    if (!user) return;
    setBusyId(order.id);
    try {
      await verifyOrder(order.id, status, user.id);
      if (status === "verified") {
        const duration = order.plan?.key ? 365 : 30;
        const plan = order.plan;
        if (plan) {
          const durationMap: Record<string, number> = { free: 30, medium: 90, premium: 365 };
          await applyPlanAsAdmin(
            order.invitation_id,
            plan.id,
            durationMap[plan.key] ?? duration,
          );
        }
      }
      await load();
      toast.success(status === "verified" ? "Order diverifikasi." : "Order ditolak.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const handleViewProof = async (order: OrderFull) => {
    if (!order.proof_url) {
      toast.info("Order ini tidak melampirkan bukti transfer.");
      return;
    }
    const url = await signedProofUrl(order.proof_url);
    if (!url) {
      toast.error("Gagal membuka bukti transfer.");
      return;
    }
    window.open(url, "_blank");
  };

  if (loading) return <PageLoader label="Memuat order..." />;

  const visible = filter === "all" ? orders : orders.filter((order) => order.status === filter);

  return (
    <Card>
      <CardHeader
        title="Verifikasi order"
        description="Konfirmasi pembayaran manual dari pengguna."
        action={
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {(["pending", "verified", "rejected", "all"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition ${
                  filter === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                {key === "all" ? "semua" : key}
              </button>
            ))}
          </div>
        }
      />
      <CardBody>
        {visible.length === 0 ? (
          <EmptyState icon={BadgeCheck} title="Tidak ada order" description="Belum ada order di kategori ini." />
        ) : (
          <ul className="space-y-3">
            {visible.map((order) => (
              <li
                key={order.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">
                      {order.owner?.full_name || "Pengguna"}
                    </p>
                    <Badge tone={STATUS_TONE[order.status] ?? "slate"}>{order.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {order.plan?.name ?? "-"} · {formatRupiah(order.amount)} ·{" "}
                    {order.invitation?.slug ?? "-"}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatDateTime(order.created_at)}
                    {order.verified_at ? ` · diproses ${formatDateTime(order.verified_at)}` : ""}
                  </p>
                  {order.owner?.phone ? (
                    <a
                      href={`https://wa.me/${order.owner.phone.replace(/\D/g, "").replace(/^0/, "62")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-500"
                    >
                      Hubungi via WhatsApp <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleViewProof(order)}>
                    Lihat bukti
                  </Button>
                  {order.status === "pending" ? (
                    <>
                      <Button
                        size="sm"
                        loading={busyId === order.id}
                        onClick={() => handleDecision(order, "verified")}
                      >
                        <Check className="h-3.5 w-3.5" /> Verifikasi
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={busyId === order.id}
                        onClick={() => handleDecision(order, "rejected")}
                      >
                        <X className="h-3.5 w-3.5" /> Tolak
                      </Button>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
