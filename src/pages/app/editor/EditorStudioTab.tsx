import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, GripVertical, Save } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { getThemeTokens } from "../../../lib/theme-tokens";
import {
  parseContent,
  type CoverStyle,
  type InvitationContent,
  type SectionBackground,
  type SectionConfig,
  type SectionKey,
  type SectionVariant,
} from "../../../lib/types";
import { cn } from "../../../lib/utils";
import { useToast } from "../../../hooks/useToast";
import { Button } from "../../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../../components/ui/Card";
import { FieldWrapper, Select } from "../../../components/ui/Field";
import ThemeRenderer from "../../public/invitation/ThemeRenderer";
import type { EditorTabProps } from "./types";

const SECTION_LABELS: Record<SectionKey, string> = {
  opening: "Pembuka / Salam",
  couple: "Mempelai",
  social: "Sosial Media",
  events: "Waktu & Tempat",
  story: "Cerita Cinta",
  gallery: "Galeri Foto",
  gift: "Amplop Digital",
  rsvp: "Konfirmasi Kehadiran",
  wishes: "Ucapan & Doa",
  closing: "Penutup",
};

const SECTION_VARIANTS: Partial<
  Record<SectionKey, Array<{ value: SectionVariant; label: string }>>
> = {
  events: [
    { value: "cards", label: "Kartu" },
    { value: "timeline", label: "Timeline" },
    { value: "list", label: "Daftar" },
  ],
  gallery: [
    { value: "grid", label: "Grid rapi" },
    { value: "masonry", label: "Masonry" },
  ],
};

const COVER_OPTIONS: Array<{ value: CoverStyle; label: string }> = [
  { value: "centered", label: "Tengah (klasik)" },
  { value: "minimal", label: "Minimalis" },
  { value: "full", label: "Foto penuh" },
  { value: "framed", label: "Bingkai" },
  { value: "split", label: "Foto panel besar" },
  { value: "panel", label: "Foto panel bingkai" },
  { value: "arch", label: "Arch" },
];

const BACKGROUND_OPTIONS: Array<{ value: SectionBackground; label: string }> = [
  { value: "auto", label: "Latar: tema" },
  { value: "none", label: "Latar: halaman" },
  { value: "soft", label: "Latar: lembut" },
  { value: "dark", label: "Latar: gelap" },
];

export default function EditorStudioTab({ invitation, update }: EditorTabProps) {
  const toast = useToast();
  const [, setSearchParams] = useSearchParams();
  const [content, setContent] = useState<InvitationContent>(() => parseContent(invitation.content));
  const [saving, setSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [preview, setPreview] = useState(false);

  const sections = content.layout.sections;
  const themeCover = getThemeTokens(invitation.theme?.key).coverStyle ?? "centered";
  const defaultLabel = COVER_OPTIONS.find((option) => option.value === themeCover)?.label ?? "";

  const setSections = (next: SectionConfig[]) =>
    setContent((current) => ({ ...current, layout: { ...current.layout, sections: next } }));

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...sections];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setSections(next);
  };

  const toggle = (index: number) =>
    setSections(
      sections.map((section, i) => (i === index ? { ...section, enabled: !section.enabled } : section)),
    );

  const setVariant = (index: number, variant: SectionVariant | "") =>
    setSections(
      sections.map((section, i) =>
        i === index ? { ...section, variant: variant === "" ? undefined : variant } : section,
      ),
    );

  const setBackground = (index: number, background: SectionBackground) =>
    setSections(
      sections.map((section, i) =>
        i === index
          ? { ...section, background: background === "auto" ? undefined : background }
          : section,
      ),
    );

  const setCover = (cover: CoverStyle | "") =>
    setContent((current) => ({
      ...current,
      layout: { ...current.layout, cover: cover === "" ? undefined : cover },
    }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await update({ content });
      toast.success("Studio disimpan.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Gaya cover" description="Tampilan halaman pembuka sebelum tamu masuk." />
        <CardBody>
          <FieldWrapper label="Cover" hint={`Default tema: ${defaultLabel || "tengah"}`}>
            <Select
              value={content.layout.cover ?? ""}
              onChange={(e) => setCover(e.target.value as CoverStyle | "")}
            >
              <option value="">Ikut tema ({defaultLabel || "tengah"})</option>
              {COVER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FieldWrapper>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Urutan & section"
          description="Aktifkan, urutkan, dan pilih gaya tiap bagian."
          action={
            <Button size="sm" variant="soft" onClick={() => setSearchParams({ tab: "konten" })}>
              Edit isi konten
            </Button>
          }
        />
        <CardBody className="space-y-2">
          {sections.map((section, index) => {
            const variants = SECTION_VARIANTS[section.id];
            return (
              <div
                key={section.id}
                onDragOver={(event) => event.preventDefault()}
                onDragEnter={() => setOverIndex(index)}
                onDrop={(event) => {
                  event.preventDefault();
                  if (dragIndex !== null) reorder(dragIndex, index);
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2.5",
                  section.enabled
                    ? "border-slate-200 bg-white"
                    : "border-slate-200 bg-slate-50 opacity-70",
                  dragIndex === index && "opacity-50",
                  overIndex === index && dragIndex !== null && dragIndex !== index
                    ? "ring-2 ring-slate-900/20"
                    : "",
                )}
              >
                <span
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setOverIndex(null);
                  }}
                  className="cursor-grab text-slate-400 active:cursor-grabbing"
                  title="Geser untuk mengurutkan"
                >
                  <GripVertical className="h-4 w-4" />
                </span>
                <div className="flex items-center gap-0.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    title="Naik"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={index === sections.length - 1}
                    onClick={() => move(index, 1)}
                    title="Turun"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>

                <span className="min-w-[9rem] flex-1 text-sm font-medium text-slate-800">
                  {SECTION_LABELS[section.id]}
                </span>

                {variants ? (
                  <div className="w-36">
                    <Select
                      value={section.variant ?? ""}
                      onChange={(e) => setVariant(index, e.target.value as SectionVariant | "")}
                    >
                      <option value="">Gaya tema</option>
                      {variants.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                ) : null}

                <div className="w-32">
                  <Select
                    value={section.background ?? "auto"}
                    onChange={(e) => setBackground(index, e.target.value as SectionBackground)}
                  >
                    {BACKGROUND_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={section.enabled}
                  onClick={() => toggle(index)}
                  className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full transition",
                    section.enabled ? "bg-slate-900" : "bg-slate-300",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                      section.enabled ? "left-[22px]" : "left-0.5",
                    )}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setSearchParams({ tab: "konten" })}
                  className="flex items-center gap-1 text-xs text-slate-500 transition hover:text-slate-800"
                >
                  <Eye className="h-3.5 w-3.5" /> Isi
                </button>
              </div>
            );
          })}
          <p className="pt-1 text-xs text-slate-500">
            Bagian yang dimatikan tidak tampil di undangan. Gaya &quot;Ikut tema&quot; mengikuti
            arketipe tema.
          </p>
        </CardBody>
      </Card>

      <div className="sticky bottom-4 flex justify-end gap-2">
        <Button variant="outline" size="lg" onClick={() => setPreview(true)}>
          <Eye className="h-4 w-4" /> Pratinjau
        </Button>
        <Button onClick={handleSave} loading={saving} size="lg" className="shadow-lg">
          <Save className="h-4 w-4" /> Simpan studio
        </Button>
      </div>

      {preview ? (
        <div className="fixed inset-0 z-[100] bg-black/70">
          <div className="absolute inset-0 overflow-y-auto">
            <ThemeRenderer
              demo
              invitation={invitation}
              content={content}
              guestName="Bapak/Ibu Tamu Undangan"
              guestId={null}
              wishes={[]}
              onNewWish={() => undefined}
              onRsvpDone={() => undefined}
            />
          </div>
          <button
            type="button"
            onClick={() => setPreview(false)}
            className="fixed right-4 top-4 z-[110] rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-lg transition hover:bg-slate-100"
          >
            Tutup pratinjau
          </button>
        </div>
      ) : null}
    </div>
  );
}
