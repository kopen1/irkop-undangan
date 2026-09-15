import { useRef, useState } from "react";
import { GripVertical, ImagePlus, Lock, Music, Plus, Save, Trash2, Upload } from "lucide-react";
import { removeStorageObject, uploadInvitationImage } from "../../../lib/api";
import {
  CLOSING_PRESETS,
  DEFAULT_MUSIC,
  EVENT_PRESETS,
  MUSIC_PRESETS,
  OPENING_PRESETS,
  SOCIAL_PLATFORMS,
} from "../../../lib/constants";
import { assertImageWithinLimit, compressImage } from "../../../lib/image";
import { cn } from "../../../lib/utils";
import { parseContent, planHasFeature, type InvitationContent } from "../../../lib/types";
import { useToast } from "../../../hooks/useToast";
import { Button } from "../../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../../components/ui/Card";
import { FieldWrapper, Input, Select, Textarea } from "../../../components/ui/Field";
import type { EditorTabProps } from "./types";

function newId() {
  return crypto.randomUUID();
}

function pathFromUrl(url: string, bucket: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : url.slice(index + marker.length);
}

function LockedFeature({ feature }: { feature: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <p className="text-xs text-amber-900">
        <strong>{feature}</strong> tidak tersedia di plan ini. Upgrade plan dari tab{" "}
        <strong>Plan</strong> untuk membukanya.
      </p>
    </div>
  );
}

export default function EditorContentTab({ invitation, update }: EditorTabProps) {
  const toast = useToast();
  const canMusic = planHasFeature(invitation.plan, "custom_music");
  const canGift = planHasFeature(invitation.plan, "amplop_digital");
  const canCouplePhoto = planHasFeature(invitation.plan, "foto_mempelai");
  const canSocial = planHasFeature(invitation.plan, "sosial_media");
  const [content, setContent] = useState<InvitationContent>(() => parseContent(invitation.content));
  const [saving, setSaving] = useState(false);
  const [usage, setUsage] = useState(invitation.storage_used_bytes);
  const [uploadingField, setUploadingField] = useState<"groom_photo" | "bride_photo" | null>(null);
  const groomInput = useRef<HTMLInputElement>(null);
  const brideInput = useRef<HTMLInputElement>(null);

  const patch = (partial: Partial<InvitationContent>) =>
    setContent((current) => ({ ...current, ...partial }));

  const handleCouplePhoto = async (
    field: "groom_photo" | "bride_photo",
    file: File | undefined,
  ) => {
    if (!file) return;
    setUploadingField(field);
    try {
      assertImageWithinLimit(file);
      const compressed = await compressImage(file, { maxWidth: 1200, maxHeight: 1200 });
      const { url, size } = await uploadInvitationImage(
        "photos",
        invitation.id,
        compressed.blob,
        compressed.ext,
      );
      const nextContent = { ...content, [field]: url };
      const nextUsage = usage + size;
      await update({ content: nextContent, storage_used_bytes: nextUsage });
      setContent(nextContent);
      setUsage(nextUsage);
      toast.success("Foto mempelai disimpan.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploadingField(null);
      if (groomInput.current) groomInput.current.value = "";
      if (brideInput.current) brideInput.current.value = "";
    }
  };

  const handleRemoveCouplePhoto = async (field: "groom_photo" | "bride_photo") => {
    try {
      const url = content[field];
      const nextContent = { ...content, [field]: "" };
      await update({ content: nextContent });
      setContent(nextContent);
      const path = url ? pathFromUrl(url, "photos") : null;
      if (path) await removeStorageObject("photos", path);
      toast.success("Foto dihapus.");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const addSocial = () =>
    patch({
      socials: [...content.socials, { id: newId(), platform: "", owner: "pria", url: "" }],
    });

  const updateSocial = (
    id: string,
    partial: Partial<{ platform: string; owner: "pria" | "wanita"; url: string }>,
  ) =>
    patch({
      socials: content.socials.map((item) => (item.id === id ? { ...item, ...partial } : item)),
    });

  const removeSocial = (id: string) =>
    patch({ socials: content.socials.filter((item) => item.id !== id) });

  const handleSave = async () => {
    setSaving(true);
    try {
      await update({ content });
      toast.success("Konten undangan disimpan.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Pembuka" description="Sapaan dan kutipan yang muncul di awal undangan." />
        <CardBody className="space-y-4">
          <FieldWrapper
            label="Rekomendasi"
            hint="Pilih preset, lalu sesuaikan kata-katanya secara manual bila perlu."
          >
            <Select
              value=""
              onChange={(event) => {
                const preset = OPENING_PRESETS.find((item) => item.label === event.target.value);
                if (preset) {
                  patch({
                    opening: {
                      greeting: preset.greeting,
                      quote: preset.quote,
                      quote_source: preset.quote_source,
                    },
                  });
                }
              }}
            >
              <option value="">Pilih rekomendasi...</option>
              {OPENING_PRESETS.map((preset) => (
                <option key={preset.label} value={preset.label}>
                  {preset.label}
                </option>
              ))}
            </Select>
          </FieldWrapper>
          <FieldWrapper label="Salam pembuka" hint="Contoh: Assalamualaikum Warahmatullahi Wabarakatuh">
            <Input
              value={content.opening.greeting}
              onChange={(e) =>
                patch({ opening: { ...content.opening, greeting: e.target.value } })
              }
            />
          </FieldWrapper>
          <FieldWrapper label="Kutipan / ayat">
            <Textarea
              rows={3}
              value={content.opening.quote}
              onChange={(e) => patch({ opening: { ...content.opening, quote: e.target.value } })}
              placeholder="Dan di antara tanda-tanda kekuasaan-Nya..."
            />
          </FieldWrapper>
          <FieldWrapper label="Sumber kutipan">
            <Input
              value={content.opening.quote_source}
              onChange={(e) =>
                patch({ opening: { ...content.opening, quote_source: e.target.value } })
              }
              placeholder="QS. Ar-Rum: 21"
            />
          </FieldWrapper>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Cerita cinta"
          description="Linimasa perjalanan kalian."
          action={
            <Button
              size="sm"
              variant="soft"
              onClick={() =>
                patch({
                  story: [...content.story, { id: newId(), time: "", title: "", description: "" }],
                })
              }
            >
              <Plus className="h-4 w-4" /> Tambah
            </Button>
          }
        />
        <CardBody className="space-y-3">
          {content.story.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada cerita. Tambahkan momen penting.</p>
          ) : (
            content.story.map((item, index) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <GripVertical className="h-4 w-4" /> Cerita {index + 1}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      patch({ story: content.story.filter((row) => row.id !== item.id) })
                    }
                  >
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FieldWrapper label="Waktu">
                    <Input
                      value={item.time}
                      onChange={(e) =>
                        patch({
                          story: content.story.map((row) =>
                            row.id === item.id ? { ...row, time: e.target.value } : row,
                          ),
                        })
                      }
                      placeholder="2019"
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Judul">
                    <Input
                      value={item.title}
                      onChange={(e) =>
                        patch({
                          story: content.story.map((row) =>
                            row.id === item.id ? { ...row, title: e.target.value } : row,
                          ),
                        })
                      }
                      placeholder="Pertama bertemu"
                    />
                  </FieldWrapper>
                </div>
                <div className="mt-3">
                  <FieldWrapper label="Deskripsi">
                    <Textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) =>
                        patch({
                          story: content.story.map((row) =>
                            row.id === item.id ? { ...row, description: e.target.value } : row,
                          ),
                        })
                      }
                    />
                  </FieldWrapper>
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Jadwal acara"
          description="Rangkaian acara dan lokasinya."
          action={
            <Button
              size="sm"
              variant="soft"
              onClick={() =>
                patch({
                  events: [
                    ...content.events,
                    {
                      id: newId(),
                      name: "",
                      date: "",
                      time: "",
                      location: "",
                      address: "",
                      maps_url: "",
                      entertainment: "",
                    },
                  ],
                })
              }
            >
              <Plus className="h-4 w-4" /> Tambah
            </Button>
          }
        />
        <CardBody className="space-y-3">
          <FieldWrapper
            label="Rekomendasi acara"
            hint="Pilih untuk menambah acara cepat, lalu sesuaikan detailnya."
          >
            <Select
              value=""
              onChange={(event) => {
                const preset = EVENT_PRESETS.find((item) => item.label === event.target.value);
                if (preset) {
                  patch({
                    events: [
                      ...content.events,
                      {
                        id: newId(),
                        name: preset.name,
                        date: "",
                        time: preset.time,
                        location: "",
                        address: "",
                        maps_url: "",
                        entertainment: "",
                      },
                    ],
                  });
                }
              }}
            >
              <option value="">Pilih rekomendasi...</option>
              {EVENT_PRESETS.map((preset) => (
                <option key={preset.label} value={preset.label}>
                  {preset.label}
                </option>
              ))}
            </Select>
          </FieldWrapper>
          {content.events.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada acara. Tambahkan akad/resepsi.</p>
          ) : (
            content.events.map((item, index) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Acara {index + 1}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      patch({ events: content.events.filter((row) => row.id !== item.id) })
                    }
                  >
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <FieldWrapper label="Nama acara">
                    <Input
                      value={item.name}
                      onChange={(e) =>
                        patch({
                          events: content.events.map((row) =>
                            row.id === item.id ? { ...row, name: e.target.value } : row,
                          ),
                        })
                      }
                      placeholder="Akad Nikah"
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Tanggal">
                    <Input
                      type="date"
                      value={item.date}
                      onChange={(e) =>
                        patch({
                          events: content.events.map((row) =>
                            row.id === item.id ? { ...row, date: e.target.value } : row,
                          ),
                        })
                      }
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Waktu">
                    <Input
                      value={item.time}
                      onChange={(e) =>
                        patch({
                          events: content.events.map((row) =>
                            row.id === item.id ? { ...row, time: e.target.value } : row,
                          ),
                        })
                      }
                      placeholder="09.00 - 11.00 WIB"
                    />
                  </FieldWrapper>
                </div>
                <div className="mt-3 grid gap-3">
                  <FieldWrapper label="Nama tempat">
                    <Input
                      value={item.location}
                      onChange={(e) =>
                        patch({
                          events: content.events.map((row) =>
                            row.id === item.id ? { ...row, location: e.target.value } : row,
                          ),
                        })
                      }
                      placeholder="Gedung Serbaguna"
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Alamat">
                    <Textarea
                      rows={2}
                      value={item.address}
                      onChange={(e) =>
                        patch({
                          events: content.events.map((row) =>
                            row.id === item.id ? { ...row, address: e.target.value } : row,
                          ),
                        })
                      }
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Link Google Maps">
                    <Input
                      value={item.maps_url}
                      onChange={(e) =>
                        patch({
                          events: content.events.map((row) =>
                            row.id === item.id ? { ...row, maps_url: e.target.value } : row,
                          ),
                        })
                      }
                      placeholder="https://maps.app.goo.gl/..."
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Hiburan" hint="Opsional. Kosongkan bila tidak ada.">
                    <Input
                      value={item.entertainment}
                      onChange={(e) =>
                        patch({
                          events: content.events.map((row) =>
                            row.id === item.id
                              ? { ...row, entertainment: e.target.value }
                              : row,
                          ),
                        })
                      }
                      placeholder="mis. Dangdut (Romansa)"
                    />
                  </FieldWrapper>
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Foto mempelai & sosial media"
          description="Opsional. Bagian yang kosong tidak ditampilkan di undangan."
        />
        <CardBody className="space-y-5">
          {canCouplePhoto ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { field: "groom_photo" as const, label: "Foto mempelai pria", ref: groomInput },
                { field: "bride_photo" as const, label: "Foto mempelai wanita", ref: brideInput },
              ].map((item) => (
                <div key={item.field}>
                  <p className="mb-1.5 text-sm font-medium text-slate-700">{item.label}</p>
                  <div className="flex items-center gap-3">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      {content[item.field] ? (
                        <img src={content[item.field]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          <ImagePlus className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        ref={item.ref}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleCouplePhoto(item.field, e.target.files?.[0])}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        loading={uploadingField === item.field}
                        onClick={() => item.ref.current?.click()}
                      >
                        <Upload className="h-4 w-4" /> {content[item.field] ? "Ganti" : "Unggah"}
                      </Button>
                      {content[item.field] ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveCouplePhoto(item.field)}
                        >
                          Hapus
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <LockedFeature feature="Foto mempelai" />
          )}

          {canSocial ? (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Sosial media</p>
                <Button size="sm" variant="soft" onClick={addSocial}>
                  <Plus className="h-4 w-4" /> Tambah
                </Button>
              </div>
              {content.socials.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada sosial media.</p>
              ) : (
                <div className="space-y-3">
                  {content.socials.map((item) => {
                    const custom = !(SOCIAL_PLATFORMS as readonly string[]).includes(item.platform);
                    return (
                      <div
                        key={item.id}
                        className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-[12rem_1fr_auto] sm:items-end"
                      >
                        <div className="space-y-3">
                          <FieldWrapper label="Untuk">
                            <Select
                              value={item.owner}
                              onChange={(e) =>
                                updateSocial(item.id, {
                                  owner: e.target.value === "wanita" ? "wanita" : "pria",
                                })
                              }
                            >
                              <option value="pria">Mempelai pria</option>
                              <option value="wanita">Mempelai wanita</option>
                            </Select>
                          </FieldWrapper>
                          <FieldWrapper label="Platform">
                            <Select
                              value={custom ? "Lainnya" : item.platform}
                              onChange={(e) =>
                                updateSocial(item.id, {
                                  platform: e.target.value === "Lainnya" ? "" : e.target.value,
                                })
                              }
                            >
                              <option value="">Pilih...</option>
                              {SOCIAL_PLATFORMS.map((platform) => (
                                <option key={platform} value={platform}>
                                  {platform}
                                </option>
                              ))}
                              <option value="Lainnya">Lainnya</option>
                            </Select>
                          </FieldWrapper>
                          {custom ? (
                            <FieldWrapper label="Nama platform">
                              <Input
                                value={item.platform}
                                onChange={(e) => updateSocial(item.id, { platform: e.target.value })}
                                placeholder="mis. Pinterest"
                              />
                            </FieldWrapper>
                          ) : null}
                        </div>
                        <FieldWrapper label="Link">
                          <Input
                            value={item.url}
                            onChange={(e) => updateSocial(item.id, { url: e.target.value })}
                            placeholder="https://instagram.com/..."
                          />
                        </FieldWrapper>
                        <Button variant="ghost" size="icon" onClick={() => removeSocial(item.id)}>
                          <Trash2 className="h-4 w-4 text-rose-500" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <LockedFeature feature="Sosial media" />
          )}
        </CardBody>
      </Card>

      {canGift ? (
      <Card>
        <CardHeader
          title="Amplop digital"
          description="Info rekening atau e-wallet untuk kado."
          action={
            <Button
              size="sm"
              variant="soft"
              onClick={() =>
                patch({
                  gift: [
                    ...content.gift,
                    { id: newId(), bank: "", account_number: "", account_name: "" },
                  ],
                })
              }
            >
              <Plus className="h-4 w-4" /> Tambah
            </Button>
          }
        />
        <CardBody className="space-y-3">
          {content.gift.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada rekening.</p>
          ) : (
            content.gift.map((item) => (
              <div key={item.id} className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
                <FieldWrapper label="Bank / e-wallet">
                  <Input
                    value={item.bank}
                    onChange={(e) =>
                      patch({
                        gift: content.gift.map((row) =>
                          row.id === item.id ? { ...row, bank: e.target.value } : row,
                        ),
                      })
                    }
                    placeholder="BCA"
                  />
                </FieldWrapper>
                <FieldWrapper label="Nomor rekening">
                  <Input
                    value={item.account_number}
                    onChange={(e) =>
                      patch({
                        gift: content.gift.map((row) =>
                          row.id === item.id ? { ...row, account_number: e.target.value } : row,
                        ),
                      })
                    }
                  />
                </FieldWrapper>
                <FieldWrapper label="Atas nama">
                  <Input
                    value={item.account_name}
                    onChange={(e) =>
                      patch({
                        gift: content.gift.map((row) =>
                          row.id === item.id ? { ...row, account_name: e.target.value } : row,
                        ),
                      })
                    }
                  />
                </FieldWrapper>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => patch({ gift: content.gift.filter((row) => row.id !== item.id) })}
                >
                  <Trash2 className="h-4 w-4 text-rose-500" />
                </Button>
              </div>
            ))
          )}
        </CardBody>
      </Card>
      ) : (
        <LockedFeature feature="Amplop digital" />
      )}

      <Card>
        <CardHeader title="Penutup & musik" description="Ucapan terima kasih dan backsound." />
        <CardBody className="space-y-4">
          <FieldWrapper
            label="Rekomendasi penutup"
            hint="Pilih preset, lalu sesuaikan kalimatnya bila perlu."
          >
            <Select
              value=""
              onChange={(event) => {
                const preset = CLOSING_PRESETS.find((item) => item.label === event.target.value);
                if (preset) patch({ closing: preset.text });
              }}
            >
              <option value="">Pilih rekomendasi...</option>
              {CLOSING_PRESETS.map((preset) => (
                <option key={preset.label} value={preset.label}>
                  {preset.label}
                </option>
              ))}
            </Select>
          </FieldWrapper>
          <FieldWrapper label="Kalimat penutup">
            <Textarea
              rows={3}
              value={content.closing}
              onChange={(e) => patch({ closing: e.target.value })}
            />
          </FieldWrapper>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Musik latar</p>
              <p className="text-xs text-slate-500">
                {content.music_enabled ? "Aktif di undangan" : "Dimatikan"}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={content.music_enabled}
              onClick={() => patch({ music_enabled: !content.music_enabled })}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition",
                content.music_enabled ? "bg-slate-900" : "bg-slate-300",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                  content.music_enabled ? "left-[22px]" : "left-0.5",
                )}
              />
            </button>
          </div>
          {content.music_enabled ? (
            canMusic ? (
              <>
                <FieldWrapper
                  label="Rekomendasi musik"
                  hint="Pilih lagu, atau isi link sendiri di bawah."
                >
                  <Select
                    value={
                      MUSIC_PRESETS.some((item) => item.url === content.music_url)
                        ? content.music_url
                        : ""
                    }
                    onChange={(e) => patch({ music_url: e.target.value })}
                  >
                    <option value="">Tidak ada musik</option>
                    {MUSIC_PRESETS.map((item) => (
                      <option key={item.url} value={item.url}>
                        {item.label}
                      </option>
                    ))}
                  </Select>
                </FieldWrapper>
                <FieldWrapper
                  label="Link musik latar"
                  hint="Tempel link file audio (mp3) yang bisa diakses publik. Musik tidak di-hosting Invite."
                >
                  <Input
                    value={content.music_url}
                    onChange={(e) => patch({ music_url: e.target.value })}
                    placeholder="https://.../lagu.mp3"
                  />
                </FieldWrapper>
                {content.music_url ? (
                  <audio controls src={content.music_url} className="w-full">
                    Browser Anda tidak mendukung pemutar audio.
                  </audio>
                ) : null}
              </>
            ) : (
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Music className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <p className="text-xs text-slate-600">
                  Plan Free memakai musik default <strong>{DEFAULT_MUSIC.label}</strong>. Upgrade plan
                  untuk memilih lagu lain atau memakai link sendiri.
                </p>
              </div>
            )
          ) : null}
        </CardBody>
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg" className="shadow-lg">
          <Save className="h-4 w-4" /> Simpan konten
        </Button>
      </div>
    </div>
  );
}
