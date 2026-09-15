import { useEffect, useRef, useState } from "react";
import { Check, ImagePlus, Palette, Rocket, Undo2, Upload } from "lucide-react";
import { listPlanThemes, listThemes, publishInvitation, slugAvailable, unpublishInvitation, uploadInvitationImage } from "../../../lib/api";
import { assertImageWithinLimit, compressImage } from "../../../lib/image";
import type { ThemeRow } from "../../../lib/types";
import { isReservedSlug, slugify, toDateInput } from "../../../lib/utils";
import { useToast } from "../../../hooks/useToast";
import { cn, formatDate } from "../../../lib/utils";
import { Button } from "../../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../../components/ui/Card";
import { FieldWrapper, Input } from "../../../components/ui/Field";
import type { EditorTabProps } from "./types";

export default function EditorDetailTab({ invitation, reload, update }: EditorTabProps) {
  const toast = useToast();
  const coverInput = useRef<HTMLInputElement>(null);

  const [groomName, setGroomName] = useState(invitation.groom_name ?? "");
  const [brideName, setBrideName] = useState(invitation.bride_name ?? "");
  const [eventDate, setEventDate] = useState(toDateInput(invitation.event_date));
  const [slug, setSlug] = useState(invitation.slug);
  const [themeId, setThemeId] = useState(invitation.theme_id);
  const [themes, setThemes] = useState<ThemeRow[]>([]);
  const [allowed, setAllowed] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [themeRows, links] = await Promise.all([listThemes(true), listPlanThemes()]);
        setThemes(themeRows);
        setAllowed(
          new Set(
            links.filter((link) => link.plan_id === invitation.plan_id).map((link) => link.theme_id),
          ),
        );
      } catch (error) {
        toast.error((error as Error).message);
      }
    })();
  }, [invitation.plan_id, toast]);

  useEffect(() => {
    setGroomName(invitation.groom_name ?? "");
    setBrideName(invitation.bride_name ?? "");
    setEventDate(toDateInput(invitation.event_date));
    setSlug(invitation.slug);
    setThemeId(invitation.theme_id);
  }, [invitation]);

  const availableThemes = themes.filter(
    (theme) => allowed.has(theme.id) || allowed.size === 0,
  );

  const validateSlug = (value: string): string | null => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      return "Slug hanya boleh huruf kecil, angka, dan tanda hubung.";
    }
    if (value.length < 3) return "Slug minimal 3 karakter.";
    if (isReservedSlug(value)) return "Slug ini dipakai sistem, pilih yang lain.";
    return null;
  };

  const handleSave = async () => {
    const slugError = validateSlug(slug);
    if (slugError) {
      toast.error(slugError);
      return;
    }
    setSaving(true);
    try {
      if (slug !== invitation.slug) {
        const available = await slugAvailable(slug, invitation.id);
        if (!available) {
          toast.error("Slug sudah dipakai undangan lain.");
          return;
        }
      }
      await update({
        groom_name: groomName.trim() || null,
        bride_name: brideName.trim() || null,
        event_date: eventDate || null,
        slug,
        theme_id: themeId,
      });
      toast.success("Perubahan disimpan.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleCover = async (file: File | undefined) => {
    if (!file) return;
    setUploadingCover(true);
    try {
      assertImageWithinLimit(file);
      const compressed = await compressImage(file, { maxWidth: 1600, maxHeight: 1600 });
      const { url, size } = await uploadInvitationImage(
        "covers",
        invitation.id,
        compressed.blob,
        compressed.ext,
      );
      await update({
        cover_image: url,
        storage_used_bytes: invitation.storage_used_bytes + size,
      });
      toast.success("Cover diperbarui.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploadingCover(false);
      if (coverInput.current) coverInput.current.value = "";
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      if (invitation.status === "published") {
        await unpublishInvitation(invitation.id);
        toast.info("Undangan ditarik ke draft.");
      } else {
        const duration = invitation.plan?.active_duration_days ?? 30;
        await publishInvitation(invitation.id, duration);
        toast.success(`Undangan terbit selama ${duration} hari.`);
      }
      await reload();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Info dasar" description="Nama mempelai, tanggal, dan link undangan." />
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldWrapper label="Nama mempelai pria">
              <Input value={groomName} onChange={(e) => setGroomName(e.target.value)} />
            </FieldWrapper>
            <FieldWrapper label="Nama mempelai wanita">
              <Input value={brideName} onChange={(e) => setBrideName(e.target.value)} />
            </FieldWrapper>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldWrapper label="Tanggal acara">
              <Input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </FieldWrapper>
            <FieldWrapper
              label="Link undangan (slug)"
              error={validateSlug(slug) ?? undefined}
            >
              <Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
            </FieldWrapper>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} loading={saving} disabled={Boolean(validateSlug(slug))}>
              Simpan perubahan
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Cover undangan"
          description="Dipakai untuk preview saat link dibagikan ke WhatsApp."
        />
        <CardBody>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative h-40 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:w-64">
              {invitation.cover_image ? (
                <img src={invitation.cover_image} alt="Cover" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  <ImagePlus className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600">
                Rasio ideal 16:9 atau 4:5. Gambar otomatis dikompres sebelum diunggah.
              </p>
              <input
                ref={coverInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleCover(e.target.files?.[0])}
              />
              <Button
                variant="outline"
                className="mt-3"
                loading={uploadingCover}
                onClick={() => coverInput.current?.click()}
              >
                <Upload className="h-4 w-4" /> Unggah cover
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Tema" description="Ganti tampilan undangan kapan saja." />
        <CardBody>
          <div className="grid gap-3 sm:grid-cols-3">
            {availableThemes.map((theme) => (
              <button
                type="button"
                key={theme.id}
                onClick={() => setThemeId(theme.id)}
                className={cn(
                  "relative rounded-xl border p-4 text-left transition",
                  themeId === theme.id
                    ? "border-slate-900 ring-2 ring-slate-900/10"
                    : "border-slate-200 hover:border-slate-400",
                )}
              >
                {themeId === theme.id ? (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                ) : null}
                <Palette className="h-5 w-5 text-rose-500" />
                <p className="mt-2 text-sm font-medium text-slate-800">{theme.name}</p>
                <p className="text-xs capitalize text-slate-400">{theme.category ?? "tema"}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={handleSave} loading={saving}>
              Simpan tema
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Publikasi"
          description={
            invitation.status === "published"
              ? `Terbit sejak ${formatDate(invitation.published_at)} · berakhir ${formatDate(invitation.expires_at)}`
              : "Undangan hanya bisa dibuka tamu setelah diterbitkan."
          }
        />
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Status saat ini: <strong>{invitation.status}</strong>
          </p>
          <Button
            variant={invitation.status === "published" ? "outline" : "primary"}
            loading={publishing}
            onClick={handlePublish}
          >
            {invitation.status === "published" ? (
              <>
                <Undo2 className="h-4 w-4" /> Tarik ke draft
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" /> Terbitkan undangan
              </>
            )}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
