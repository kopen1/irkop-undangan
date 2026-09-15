import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { listPlans, listPlanThemes, listThemes, setPlanThemes, upsertPlan } from "../../lib/api";
import type { PlanRow, ThemeRow } from "../../lib/types";
import { formatRupiah } from "../../lib/utils";
import { useToast } from "../../hooks/useToast";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { FieldWrapper, Input, Select } from "../../components/ui/Field";
import { Modal } from "../../components/ui/Modal";
import { PageLoader } from "../../components/ui/Spinner";

const FEATURE_KEYS = [
  "amplop_digital",
  "custom_music",
  "galeri",
  "rsvp",
  "tanpa_watermark",
  "domain_custom",
  "foto_mempelai",
  "sosial_media",
];

interface FormState {
  id: string;
  key: string;
  name: string;
  price: number;
  max_invitations: number;
  max_guests: number;
  max_photos: number;
  active_duration_days: number;
  theme_quota: string;
  is_active: boolean;
  features: Record<string, boolean>;
}

export default function AdminPlans() {
  const toast = useToast();
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [themes, setThemes] = useState<ThemeRow[]>([]);
  const [links, setLinks] = useState<Array<{ plan_id: string; theme_id: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [selectedThemeIds, setSelectedThemeIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [planRows, themeRows, linkRows] = await Promise.all([
      listPlans(),
      listThemes(),
      listPlanThemes(),
    ]);
    setPlans(planRows);
    setThemes(themeRows);
    setLinks(linkRows);
  };

  useEffect(() => {
    load()
      .catch((error) => toast.error((error as Error).message))
      .finally(() => setLoading(false));
  }, [toast]);

  const openEdit = (plan: PlanRow) => {
    setForm({
      id: plan.id,
      key: plan.key,
      name: plan.name,
      price: plan.price,
      max_invitations: plan.max_invitations,
      max_guests: plan.max_guests,
      max_photos: plan.max_photos,
      active_duration_days: plan.active_duration_days,
      theme_quota: plan.theme_quota === null ? "" : String(plan.theme_quota),
      is_active: plan.is_active,
      features: (plan.features ?? {}) as Record<string, boolean>,
    });
    setSelectedThemeIds(
      new Set(links.filter((link) => link.plan_id === plan.id).map((link) => link.theme_id)),
    );
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await upsertPlan({
        id: form.id,
        key: form.key,
        name: form.name,
        price: Number(form.price) || 0,
        max_invitations: Number(form.max_invitations) || 0,
        max_guests: Number(form.max_guests) || 0,
        max_photos: Number(form.max_photos) || 0,
        active_duration_days: Number(form.active_duration_days) || 0,
        theme_quota: form.theme_quota === "" ? null : Number(form.theme_quota),
        is_active: form.is_active,
        features: form.features,
      });
      await setPlanThemes(form.id, [...selectedThemeIds]);
      await load();
      toast.success("Plan diperbarui.");
      setForm(null);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader label="Memuat plan..." />;

  return (
    <>
      <Card>
        <CardHeader title="Plan" description="Atur kuota, harga, dan tema yang tersedia." />
        <CardBody className="overflow-x-auto px-0">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Harga</th>
                <th className="px-5 py-3 font-medium">Undangan</th>
                <th className="px-5 py-3 font-medium">Tamu</th>
                <th className="px-5 py-3 font-medium">Foto</th>
                <th className="px-5 py-3 font-medium">Durasi</th>
                <th className="px-5 py-3 font-medium">Tema</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => {
                const themeCount = links.filter((link) => link.plan_id === plan.id).length;
                return (
                  <tr key={plan.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">{plan.name}</p>
                      <p className="text-xs text-slate-400">{plan.key}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {plan.price === 0 ? "Gratis" : formatRupiah(plan.price)}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{plan.max_invitations}</td>
                    <td className="px-5 py-3 text-slate-600">{plan.max_guests}</td>
                    <td className="px-5 py-3 text-slate-600">{plan.max_photos}</td>
                    <td className="px-5 py-3 text-slate-600">{plan.active_duration_days} hari</td>
                    <td className="px-5 py-3 text-slate-600">
                      {plan.theme_quota ?? themeCount}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={plan.is_active ? "green" : "slate"}>
                        {plan.is_active ? "aktif" : "nonaktif"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => openEdit(plan)}>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <Modal
        open={Boolean(form)}
        onClose={() => setForm(null)}
        title={`Edit plan ${form?.name ?? ""}`}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setForm(null)}>
              Batal
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Simpan plan
            </Button>
          </>
        }
      >
        {form ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldWrapper label="Nama plan">
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </FieldWrapper>
              <FieldWrapper label="Key">
                <Input value={form.key} disabled />
              </FieldWrapper>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <FieldWrapper label="Harga (Rp)">
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </FieldWrapper>
              <FieldWrapper label="Maks undangan">
                <Input
                  type="number"
                  value={form.max_invitations}
                  onChange={(e) => setForm({ ...form, max_invitations: Number(e.target.value) })}
                />
              </FieldWrapper>
              <FieldWrapper label="Maks tamu">
                <Input
                  type="number"
                  value={form.max_guests}
                  onChange={(e) => setForm({ ...form, max_guests: Number(e.target.value) })}
                />
              </FieldWrapper>
              <FieldWrapper label="Maks foto">
                <Input
                  type="number"
                  value={form.max_photos}
                  onChange={(e) => setForm({ ...form, max_photos: Number(e.target.value) })}
                />
              </FieldWrapper>
              <FieldWrapper label="Durasi (hari)">
                <Input
                  type="number"
                  value={form.active_duration_days}
                  onChange={(e) =>
                    setForm({ ...form, active_duration_days: Number(e.target.value) })
                  }
                />
              </FieldWrapper>
            </div>
            <FieldWrapper label="Kuota tema" hint="Kosongkan bila mengikuti jumlah tema di-assign.">
              <Input
                type="number"
                value={form.theme_quota}
                onChange={(e) => setForm({ ...form, theme_quota: e.target.value })}
                placeholder="bebas"
              />
            </FieldWrapper>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Tema tersedia</p>
              <div className="flex flex-wrap gap-2">
                {themes.map((theme) => {
                  const checked = selectedThemeIds.has(theme.id);
                  return (
                    <button
                      type="button"
                      key={theme.id}
                      onClick={() =>
                        setSelectedThemeIds((current) => {
                          const next = new Set(current);
                          if (next.has(theme.id)) next.delete(theme.id);
                          else next.add(theme.id);
                          return next;
                        })
                      }
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${
                        checked
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 text-slate-600 hover:border-slate-400"
                      }`}
                    >
                      {theme.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Fitur</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {FEATURE_KEYS.map((key) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={Boolean(form.features[key])}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          features: { ...form.features, [key]: e.target.checked },
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    {key.replace(/_/g, " ")}
                  </label>
                ))}
              </div>
            </div>

            <FieldWrapper label="Status">
              <Select
                value={form.is_active ? "active" : "inactive"}
                onChange={(e) => setForm({ ...form, is_active: e.target.value === "active" })}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </Select>
            </FieldWrapper>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
