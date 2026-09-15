import { useState } from "react";
import { GripVertical, Lock, Plus, Save, Trash2 } from "lucide-react";
import { parseContent, planHasFeature, type InvitationContent } from "../../../lib/types";
import { useToast } from "../../../hooks/useToast";
import { Button } from "../../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../../components/ui/Card";
import { FieldWrapper, Input, Textarea } from "../../../components/ui/Field";
import type { EditorTabProps } from "./types";

function newId() {
  return crypto.randomUUID();
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
  const [content, setContent] = useState<InvitationContent>(() => parseContent(invitation.content));
  const [saving, setSaving] = useState(false);

  const patch = (partial: Partial<InvitationContent>) =>
    setContent((current) => ({ ...current, ...partial }));

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
                </div>
              </div>
            ))
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
          <FieldWrapper label="Kalimat penutup">
            <Textarea
              rows={3}
              value={content.closing}
              onChange={(e) => patch({ closing: e.target.value })}
            />
          </FieldWrapper>
          {canMusic ? (
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
          ) : (
            <LockedFeature feature="Musik latar custom" />
          )}
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
