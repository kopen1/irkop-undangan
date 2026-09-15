import { useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { removeStorageObject, uploadInvitationImage } from "../../../lib/api";
import { compressImage } from "../../../lib/image";
import { parseContent, type InvitationContent } from "../../../lib/types";
import { formatBytes } from "../../../lib/utils";
import { useToast } from "../../../hooks/useToast";
import { Button } from "../../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../../components/ui/Card";
import type { EditorTabProps } from "./types";

function pathFromUrl(url: string, bucket: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : url.slice(index + marker.length);
}

export default function EditorGalleryTab({ invitation, update }: EditorTabProps) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState<InvitationContent>(() => parseContent(invitation.content));
  const [usage, setUsage] = useState(invitation.storage_used_bytes);
  const [uploading, setUploading] = useState(false);

  const maxPhotos = invitation.plan?.max_photos ?? 10;
  const remaining = maxPhotos - content.photos.length;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (remaining <= 0) {
      toast.error(`Kuota foto plan ${invitation.plan?.name ?? "ini"} sudah penuh (${maxPhotos}).`);
      return;
    }

    const selected = Array.from(files).slice(0, remaining);
    if (selected.length < files.length) {
      toast.info(`Hanya ${selected.length} foto diunggah karena batas kuota plan.`);
    }

    setUploading(true);
    try {
      const uploaded: string[] = [];
      let addedBytes = 0;
      for (const file of selected) {
        const compressed = await compressImage(file, { maxWidth: 1600, maxHeight: 1600 });
        const { url, size } = await uploadInvitationImage(
          "photos",
          invitation.id,
          compressed.blob,
          compressed.ext,
        );
        uploaded.push(url);
        addedBytes += size;
      }
      const nextPhotos = [...content.photos, ...uploaded];
      const nextUsage = usage + addedBytes;
      await update({ content: { ...content, photos: nextPhotos }, storage_used_bytes: nextUsage });
      setContent((current) => ({ ...current, photos: nextPhotos }));
      setUsage(nextUsage);
      toast.success(`${uploaded.length} foto ditambahkan.`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async (url: string) => {
    try {
      const path = pathFromUrl(url, "photos");
      const nextPhotos = content.photos.filter((photo) => photo !== url);
      await update({ content: { ...content, photos: nextPhotos } });
      setContent((current) => ({ ...current, photos: nextPhotos }));
      if (path) await removeStorageObject("photos", path);
      toast.success("Foto dihapus.");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Galeri foto"
        description={`${content.photos.length}/${maxPhotos} foto · ${formatBytes(usage)} terpakai`}
        action={
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button
              size="sm"
              loading={uploading}
              disabled={remaining <= 0}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-4 w-4" /> Unggah foto
            </Button>
          </>
        }
      />
      <CardBody>
        {content.photos.length === 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 text-slate-400 transition hover:border-slate-400 hover:text-slate-600"
          >
            <ImagePlus className="h-8 w-8" />
            <span className="mt-2 text-sm">Klik untuk memilih foto</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {content.photos.map((url) => (
              <div
                key={url}
                className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200"
              >
                <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  className="absolute right-2 top-2 rounded-lg bg-white/90 p-1.5 text-rose-600 opacity-0 shadow transition group-hover:opacity-100"
                  title="Hapus foto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-slate-500">
          Setiap foto dikompres otomatis ke maks 1600px sebelum diunggah.
        </p>
      </CardBody>
    </Card>
  );
}
