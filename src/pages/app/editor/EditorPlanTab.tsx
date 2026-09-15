import { useEffect, useRef, useState } from "react";
import { CreditCard, Upload } from "lucide-react";
import {
  createOrder,
  listOrdersForInvitation,
  listPlanThemes,
  listPlans,
  listThemes,
  uploadPaymentProof,
} from "../../../lib/api";
import type { OrderRow, PlanRow, ThemeRow } from "../../../lib/types";
import { formatDate, formatRupiah } from "../../../lib/utils";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../hooks/useToast";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Modal } from "../../../components/ui/Modal";
import { PlanCards } from "../../../components/plans/PlanCards";
import type { EditorTabProps } from "./types";

const ORDER_TONE: Record<string, "amber" | "green" | "rose"> = {
  pending: "amber",
  verified: "green",
  rejected: "rose",
};

export default function EditorPlanTab({ invitation }: EditorTabProps) {
  const { user } = useAuth();
  const toast = useToast();
  const proofInput = useRef<HTMLInputElement>(null);

  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [themes, setThemes] = useState<ThemeRow[]>([]);
  const [planThemes, setPlanThemes] = useState<Array<{ plan_id: string; theme_id: string }>>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [selected, setSelected] = useState<PlanRow | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      listPlans(true),
      listThemes(true),
      listPlanThemes(),
      listOrdersForInvitation(invitation.id),
    ])
      .then(([planRows, themeRows, links, orderRows]) => {
        setPlans(planRows);
        setThemes(themeRows);
        setPlanThemes(links);
        setOrders(orderRows);
      })
      .catch((error) => toast.error((error as Error).message));
  }, [invitation.id, toast]);

  const handleSubmit = async () => {
    if (!user || !selected) return;
    if (selected.price > 0 && !proofFile) {
      toast.error("Unggah bukti transfer untuk plan berbayar.");
      return;
    }
    setSubmitting(true);
    try {
      const proofUrl = proofFile ? await uploadPaymentProof(user.id, proofFile) : null;
      const created = await createOrder({
        invitationId: invitation.id,
        planId: selected.id,
        amount: selected.price,
        proofUrl,
      });
      setOrders((current) => [created, ...current]);
      toast.success("Permintaan upgrade dikirim. Menunggu verifikasi admin.");
      setSelected(null);
      setProofFile(null);
      if (proofInput.current) proofInput.current.value = "";
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Plan aktif" description="Kuota dan masa aktif undangan ini." />
        <CardBody className="grid gap-4 sm:grid-cols-5">
          <Info label="Plan" value={invitation.plan?.name ?? "-"} />
          <Info label="Kuota undangan" value={String(invitation.plan?.max_invitations ?? 0)} />
          <Info label="Maks tamu" value={String(invitation.plan?.max_guests ?? 0)} />
          <Info label="Maks foto" value={String(invitation.plan?.max_photos ?? 0)} />
          <Info
            label="Berakhir"
            value={invitation.expires_at ? formatDate(invitation.expires_at) : "-"}
          />
        </CardBody>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Pilih plan</h2>
        <PlanCards
          plans={plans}
          themes={themes}
          planThemes={planThemes}
          highlightKey={invitation.plan?.key}
          renderCta={(plan) =>
            plan.id === invitation.plan_id ? (
              <Button variant="outline" className="w-full" disabled>
                Plan saat ini
              </Button>
            ) : (
              <Button
                className="w-full"
                variant={plan.price === 0 ? "outline" : "primary"}
                onClick={() => setSelected(plan)}
              >
                <CreditCard className="h-4 w-4" /> {plan.price === 0 ? "Pilih" : "Upgrade"}
              </Button>
            )
          }
        />
      </div>

      <Card>
        <CardHeader title="Riwayat order" description="Permintaan upgrade dan status verifikasinya." />
        <CardBody>
          {orders.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="Belum ada order"
              description="Order akan muncul setelah kamu mengajukan upgrade plan."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {orders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm text-slate-700">
                      {formatRupiah(order.amount)} · {order.payment_method}
                    </p>
                    <p className="text-xs text-slate-400">{formatDate(order.created_at)}</p>
                  </div>
                  <Badge tone={ORDER_TONE[order.status] ?? "slate"}>{order.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={`Upgrade ke ${selected?.name ?? ""}`}
        description={
          selected && selected.price > 0
            ? `Transfer ${formatRupiah(selected.price)} lalu unggah bukti transfer.`
            : "Plan gratis tinggal dipilih."
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Batal
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              Kirim permintaan
            </Button>
          </>
        }
      >
        {selected && selected.price > 0 ? (
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              Transfer ke rekening yang akan diinformasikan admin, lalu unggah bukti di bawah.
            </div>
            <input
              ref={proofInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
            />
            <Button variant="outline" onClick={() => proofInput.current?.click()}>
              <Upload className="h-4 w-4" /> {proofFile ? proofFile.name : "Pilih bukti transfer"}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            Plan ini tidak berbayar. Konfirmasi untuk mengajukan permintaan.
          </p>
        )}
      </Modal>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
