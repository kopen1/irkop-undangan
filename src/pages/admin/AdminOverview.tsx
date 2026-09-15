import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarHeart, Palette, Users, Wallet } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { listAllOrders } from "../../lib/api";
import { formatRupiah } from "../../lib/utils";
import { Badge } from "../../components/ui/Badge";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { PageLoader } from "../../components/ui/Spinner";

async function count(table: "profiles" | "invitations" | "themes"): Promise<number> {
  const { count: total } = await supabase.from(table).select("id", { count: "exact", head: true });
  return total ?? 0;
}

export default function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, invitations: 0, themes: 0, pending: 0, revenue: 0 });
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof listAllOrders>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [users, invitations, themes, orderRows] = await Promise.all([
          count("profiles"),
          count("invitations"),
          count("themes"),
          listAllOrders(),
        ]);
        setOrders(orderRows.slice(0, 6));
        setStats({
          users,
          invitations,
          themes,
          pending: orderRows.filter((order) => order.status === "pending").length,
          revenue: orderRows
            .filter((order) => order.status === "verified")
            .reduce((sum, order) => sum + order.amount, 0),
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <PageLoader label="Memuat ringkasan..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Ringkasan</h1>
        <p className="mt-1 text-sm text-slate-500">Kondisi platform saat ini.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Stat icon={Users} label="Pengguna" value={String(stats.users)} />
        <Stat icon={CalendarHeart} label="Undangan" value={String(stats.invitations)} />
        <Stat icon={Palette} label="Tema" value={String(stats.themes)} />
        <Stat icon={Wallet} label="Order pending" value={String(stats.pending)} />
        <Stat icon={Wallet} label="Pendapatan terverifikasi" value={formatRupiah(stats.revenue)} />
      </div>

      <Card>
        <CardHeader
          title="Order terbaru"
          description="Perlu verifikasi manual."
          action={
            <Link
              to="/admin/orders"
              className="text-sm font-medium text-rose-600 hover:text-rose-500"
            >
              Lihat semua
            </Link>
          }
        />
        <CardBody>
          {orders.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada order.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {orders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-700">
                      {order.owner?.full_name || "Pengguna"} · {order.plan?.name ?? "-"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {order.invitation?.slug ?? "-"} · {formatRupiah(order.amount)}
                    </p>
                  </div>
                  <Badge
                    tone={
                      order.status === "verified"
                        ? "green"
                        : order.status === "rejected"
                          ? "rose"
                          : "amber"
                    }
                  >
                    {order.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function Stat({
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
        <div className="min-w-0">
          <p className="truncate text-xs text-slate-500">{label}</p>
          <p className="truncate text-lg font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
