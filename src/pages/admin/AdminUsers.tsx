import { useEffect, useMemo, useState } from "react";
import { Search, Shield, User } from "lucide-react";
import { listProfiles, updateProfileRole } from "../../lib/api";
import type { ProfileRow } from "../../lib/types";
import { formatDate } from "../../lib/utils";
import { useToast } from "../../hooks/useToast";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Field";
import { PageLoader } from "../../components/ui/Spinner";

export default function AdminUsers() {
  const toast = useToast();
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    listProfiles()
      .then(setRows)
      .catch((error) => toast.error((error as Error).message))
      .finally(() => setLoading(false));
  }, [toast]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (row) =>
        (row.full_name ?? "").toLowerCase().includes(term) ||
        (row.phone ?? "").toLowerCase().includes(term),
    );
  }, [rows, query]);

  const toggleRole = async (row: ProfileRow) => {
    const nextRole = row.role === "admin" ? "user" : "admin";
    setBusyId(row.id);
    try {
      await updateProfileRole(row.id, nextRole);
      setRows((current) =>
        current.map((item) => (item.id === row.id ? { ...item, role: nextRole } : item)),
      );
      toast.success(`Role ${row.full_name || row.id} diubah ke ${nextRole}.`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <PageLoader label="Memuat pengguna..." />;

  return (
    <Card>
      <CardHeader
        title="Pengguna"
        description={`${rows.length} akun terdaftar`}
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama atau no. WA"
              className="pl-9 sm:w-64"
            />
          </div>
        }
      />
      <CardBody className="overflow-x-auto px-0">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3 font-medium">Nama</th>
              <th className="px-5 py-3 font-medium">No. WhatsApp</th>
              <th className="px-5 py-3 font-medium">Terdaftar</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3 font-medium text-slate-800">{row.full_name || "-"}</td>
                <td className="px-5 py-3 text-slate-600">{row.phone || "-"}</td>
                <td className="px-5 py-3 text-slate-500">{formatDate(row.created_at)}</td>
                <td className="px-5 py-3">
                  <Badge tone={row.role === "admin" ? "rose" : "slate"}>{row.role}</Badge>
                </td>
                <td className="px-5 py-3 text-right">
                  <Button
                    size="sm"
                    variant={row.role === "admin" ? "outline" : "soft"}
                    loading={busyId === row.id}
                    onClick={() => toggleRole(row)}
                  >
                    {row.role === "admin" ? (
                      <>
                        <User className="h-3.5 w-3.5" /> Jadikan user
                      </>
                    ) : (
                      <>
                        <Shield className="h-3.5 w-3.5" /> Jadikan admin
                      </>
                    )}
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                  Tidak ada pengguna yang cocok.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
