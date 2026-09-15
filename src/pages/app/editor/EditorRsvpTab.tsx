import { useEffect, useMemo, useState } from "react";
import { Send } from "lucide-react";
import { listRsvp } from "../../../lib/api";
import type { RsvpRow } from "../../../lib/types";
import { ATTENDANCE_LABELS } from "../../../lib/constants";
import { formatDateTime } from "../../../lib/utils";
import { useToast } from "../../../hooks/useToast";
import { Badge } from "../../../components/ui/Badge";
import { Card, CardBody, CardHeader } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Spinner } from "../../../components/ui/Spinner";
import type { EditorTabProps } from "./types";

const TONE: Record<string, "green" | "rose" | "amber"> = {
  hadir: "green",
  tidak_hadir: "rose",
  masih_ragu: "amber",
};

export default function EditorRsvpTab({ invitation }: EditorTabProps) {
  const toast = useToast();
  const [rows, setRows] = useState<RsvpRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listRsvp(invitation.id)
      .then((data) => {
        if (active) setRows(data);
      })
      .catch((error) => toast.error((error as Error).message))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [invitation.id, toast]);

  const summary = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc[row.attendance] += 1;
        if (row.attendance === "hadir") acc.headcount += row.guest_count;
        return acc;
      },
      { hadir: 0, tidak_hadir: 0, masih_ragu: 0, headcount: 0 },
    );
  }, [rows]);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-4">
        <Summary label="Total respons" value={rows.length} />
        <Summary label="Hadir" value={summary.hadir} tone="text-emerald-600" />
        <Summary label="Tidak hadir" value={summary.tidak_hadir} tone="text-rose-600" />
        <Summary label="Perkiraan orang" value={summary.headcount} tone="text-slate-900" />
      </div>

      <Card>
        <CardHeader title="RSVP masuk" description="Respons dari tamu yang membuka undangan." />
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Send}
              title="Belum ada RSVP"
              description="Respons tamu akan muncul di sini setelah undangan dibagikan."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {rows.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <Badge tone={TONE[row.attendance] ?? "slate"}>
                      {ATTENDANCE_LABELS[row.attendance]}
                    </Badge>
                    <p className="mt-1 text-xs text-slate-400">{formatDateTime(row.created_at)}</p>
                  </div>
                  <p className="text-sm text-slate-600">
                    {row.guest_count} orang
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function Summary({
  label,
  value,
  tone = "text-slate-900",
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
