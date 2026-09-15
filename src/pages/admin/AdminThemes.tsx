import { useEffect, useState } from "react";
import { Palette, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteTheme, listThemes, upsertTheme } from "../../lib/api";
import type { ThemeRow } from "../../lib/types";
import { slugify } from "../../lib/utils";
import { useToast } from "../../hooks/useToast";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { FieldWrapper, Input, Select } from "../../components/ui/Field";
import { Modal } from "../../components/ui/Modal";
import { PageLoader } from "../../components/ui/Spinner";

interface FormState {
  id?: string;
  key: string;
  name: string;
  category: "basic" | "eksklusif";
  preview_image: string;
  is_active: boolean;
}

const EMPTY: FormState = {
  key: "",
  name: "",
  category: "basic",
  preview_image: "",
  is_active: true,
};

export default function AdminThemes() {
  const toast = useToast();
  const [rows, setRows] = useState<ThemeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ThemeRow | null>(null);

  useEffect(() => {
    listThemes()
      .then(setRows)
      .catch((error) => toast.error((error as Error).message))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleSave = async () => {
    if (!form) return;
    if (!form.key || !form.name) {
      toast.error("Key dan nama wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      const saved = await upsertTheme({
        id: form.id,
        key: form.key,
        name: form.name,
        category: form.category,
        preview_image: form.preview_image || null,
        is_active: form.is_active,
      });
      setRows((current) => {
        const exists = current.some((row) => row.id === saved.id);
        return exists
          ? current.map((row) => (row.id === saved.id ? saved : row))
          : [...current, saved];
      });
      toast.success("Tema disimpan.");
      setForm(null);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteTheme(pendingDelete.id);
      setRows((current) => current.filter((row) => row.id !== pendingDelete.id));
      toast.success("Tema dihapus.");
      setPendingDelete(null);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  if (loading) return <PageLoader label="Memuat tema..." />;

  return (
    <>
      <Card>
        <CardHeader
          title="Tema"
          description={`${rows.length} tema`}
          action={
            <Button size="sm" onClick={() => setForm({ ...EMPTY })}>
              <Plus className="h-4 w-4" /> Tema baru
            </Button>
          }
        />
        <CardBody>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((theme) => (
              <div
                key={theme.id}
                className="flex flex-col rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{theme.name}</p>
                    <p className="text-xs text-slate-400">{theme.key}</p>
                  </div>
                  <Badge tone={theme.is_active ? "green" : "slate"}>
                    {theme.is_active ? "aktif" : "nonaktif"}
                  </Badge>
                </div>
                <p className="mt-2 text-xs capitalize text-slate-500">
                  Kategori: {theme.category ?? "-"}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setForm({
                        id: theme.id,
                        key: theme.key,
                        name: theme.name,
                        category: theme.category ?? "basic",
                        preview_image: theme.preview_image ?? "",
                        is_active: theme.is_active,
                      })
                    }
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setPendingDelete(theme)}>
                    <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            <Palette className="mr-1 inline h-3.5 w-3.5" />
            Key tema dipetakan ke komponen React di frontend. Menambah key baru perlu komponen tema
            baru agar tampil.
          </p>
        </CardBody>
      </Card>

      <Modal
        open={Boolean(form)}
        onClose={() => setForm(null)}
        title={form?.id ? "Edit tema" : "Tema baru"}
        footer={
          <>
            <Button variant="outline" onClick={() => setForm(null)}>
              Batal
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Simpan
            </Button>
          </>
        }
      >
        {form ? (
          <div className="space-y-4">
            <FieldWrapper label="Nama tema" required>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                    key: form.id ? form.key : slugify(e.target.value),
                  })
                }
              />
            </FieldWrapper>
            <FieldWrapper label="Key" hint="Huruf kecil, dipetakan ke komponen tema." required>
              <Input
                value={form.key}
                onChange={(e) => setForm({ ...form, key: slugify(e.target.value) })}
              />
            </FieldWrapper>
            <FieldWrapper label="Kategori">
              <Select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as FormState["category"] })
                }
              >
                <option value="basic">Basic</option>
                <option value="eksklusif">Eksklusif</option>
              </Select>
            </FieldWrapper>
            <FieldWrapper label="URL gambar preview">
              <Input
                value={form.preview_image}
                onChange={(e) => setForm({ ...form, preview_image: e.target.value })}
                placeholder="https://..."
              />
            </FieldWrapper>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300"
              />
              Aktifkan tema
            </label>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Hapus tema ini?"
        description={`Tema "${pendingDelete?.name ?? ""}" akan dihapus dan dilepas dari semua plan.`}
        confirmLabel="Hapus tema"
      />
    </>
  );
}
