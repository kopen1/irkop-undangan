import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Plus, Send, Trash2, UserPlus } from "lucide-react";
import {
  addGuest,
  addGuestsBulk,
  deleteGuest,
  listGuests,
  updateGuest,
} from "../../../lib/api";
import { APP_URL } from "../../../lib/supabase";
import type { GuestRow } from "../../../lib/types";
import { formatDateTime } from "../../../lib/utils";
import { useToast } from "../../../hooks/useToast";
import { Button } from "../../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { FieldWrapper, Input, Textarea } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import { Spinner } from "../../../components/ui/Spinner";
import type { EditorTabProps } from "./types";

export default function EditorGuestsTab({ invitation }: EditorTabProps) {
  const toast = useToast();
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  const maxGuests = invitation.plan?.max_guests ?? 50;
  const remaining = maxGuests - guests.length;

  useEffect(() => {
    let active = true;
    listGuests(invitation.id)
      .then((rows) => {
        if (active) setGuests(rows);
      })
      .catch((error) => toast.error((error as Error).message))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [invitation.id, toast]);

  const guestLink = (guest: GuestRow) => `${APP_URL}/${invitation.slug}/${guest.slug}`;

  const message = useMemo(
    () =>
      (guest: GuestRow) =>
        `Kepada ${guest.name}\n\nTanpa mengurangi rasa hormat, kami mengundang Anda untuk hadir di acara pernikahan ${invitation.groom_name ?? ""} & ${invitation.bride_name ?? ""}.\n\nDetail undangan: ${guestLink(guest)}`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [invitation.groom_name, invitation.bride_name, invitation.slug],
  );

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (remaining <= 0) {
      toast.error(`Kuota tamu plan ${invitation.plan?.name ?? "ini"} sudah penuh.`);
      return;
    }
    setAdding(true);
    try {
      const created = await addGuest(invitation.id, trimmed);
      setGuests((current) => [created, ...current]);
      setName("");
      toast.success("Tamu ditambahkan.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setAdding(false);
    }
  };

  const handleBulk = async () => {
    const names = bulkText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (names.length === 0) return;
    if (names.length > remaining) {
      toast.error(`Sisa kuota hanya ${remaining} tamu.`);
      return;
    }
    setBulkLoading(true);
    try {
      const created = await addGuestsBulk(invitation.id, names);
      setGuests((current) => [...created, ...current]);
      setBulkText("");
      setBulkOpen(false);
      toast.success(`${created.length} tamu ditambahkan.`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDelete = async (guest: GuestRow) => {
    try {
      await deleteGuest(guest.id);
      setGuests((current) => current.filter((row) => row.id !== guest.id));
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleCopy = async (guest: GuestRow) => {
    await navigator.clipboard.writeText(guestLink(guest));
    toast.success("Link tamu disalin.");
  };

  const handleShare = async (guest: GuestRow) => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message(guest))}`, "_blank");
    try {
      const updated = await updateGuest(guest.id, {
        whatsapp_sent_at: new Date().toISOString(),
      });
      setGuests((current) => current.map((row) => (row.id === guest.id ? updated : row)));
    } catch {
      /* tracking distribusi opsional */
    }
  };

  return (
    <Card>
      <CardHeader
        title="Daftar tamu"
        description={`${guests.length}/${maxGuests} tamu · sisa ${remaining}`}
        action={
          <Button size="sm" variant="soft" onClick={() => setBulkOpen(true)}>
            <UserPlus className="h-4 w-4" /> Tambah massal
          </Button>
        }
      />
      <CardBody>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleAdd();
            }}
            placeholder="Nama tamu"
          />
          <Button onClick={handleAdd} loading={adding} disabled={remaining <= 0}>
            <Plus className="h-4 w-4" /> Tambah
          </Button>
        </div>

        <div className="mt-4 rounded-xl bg-sky-50 px-4 py-3 text-xs text-sky-900">
          Tamu tidak wajib didaftarkan di sini. Nama di link bisa kamu edit bebas, misal{" "}
          <code className="rounded bg-sky-100 px-1">
            {APP_URL}/{invitation.slug}/iqbal
          </code>{" "}
          akan tampil sebagai &ldquo;Kepada Iqbal&rdquo;. Daftar di bawah dipakai kalau kamu ingin
          melacak pengiriman WhatsApp dan menautkan RSVP ke tamu tertentu.
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : guests.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="Belum ada tamu"
              description="Tambahkan nama tamu satu per satu atau tempel daftar sekaligus."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {guests.map((guest) => (
                <li key={guest.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{guest.name}</p>
                    <p className="truncate text-xs text-slate-400">
                      {guest.whatsapp_sent_at
                        ? `Terkirim ${formatDateTime(guest.whatsapp_sent_at)}`
                        : `${APP_URL}/${invitation.slug}/${guest.slug}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {guest.whatsapp_sent_at ? (
                      <Check className="mr-1 h-4 w-4 text-emerald-500" />
                    ) : null}
                    <Button size="icon" variant="outline" onClick={() => handleCopy(guest)} title="Salin link">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleShare(guest)}
                      title="Kirim WhatsApp"
                    >
                      <Send className="h-4 w-4 text-emerald-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(guest)}
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4 text-rose-500" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardBody>

      <Modal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title="Tambah tamu massal"
        description="Satu nama per baris."
        footer={
          <>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleBulk} loading={bulkLoading}>
              Tambahkan
            </Button>
          </>
        }
      >
        <FieldWrapper label="Daftar nama" hint={`Sisa kuota: ${remaining} tamu`}>
          <Textarea
            rows={8}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={"Budi Santoso\nSiti Aminah\nKeluarga Wijaya"}
          />
        </FieldWrapper>
      </Modal>
    </Card>
  );
}
