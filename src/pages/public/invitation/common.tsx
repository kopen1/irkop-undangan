import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  CalendarDays,
  Clock,
  Copy,
  Heart,
  MapPin,
  Music,
  Pause,
  Send,
  Volume2,
} from "lucide-react";
import { submitRsvp, submitWish } from "../../../lib/api";
import type { InvitationContent, InvitationFull, RsvpRow, WishRow } from "../../../lib/types";
import { ATTENDANCE_LABELS } from "../../../lib/constants";
import { cn, formatDate, formatDateTime } from "../../../lib/utils";
import { useToast } from "../../../hooks/useToast";
import type { OrnamentKind } from "../../../lib/theme-tokens";
import { Ornament } from "./ornaments";

/* -------------------------------------------------------------------------- */
/* Cover gate — tamu klik untuk membuka undangan                              */
/* -------------------------------------------------------------------------- */

export function CoverGate({
  invitation,
  guestName,
  onOpen,
  accentClass,
  bgClass,
  ornamentKind,
}: {
  invitation: InvitationFull;
  guestName: string | null;
  onOpen: () => void;
  accentClass: string;
  bgClass: string;
  ornamentKind?: OrnamentKind;
}) {
  return (
    <div className={cn("fixed inset-0 z-40 flex flex-col items-center justify-center px-6 text-center", bgClass)}>
      {invitation.cover_image ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${invitation.cover_image})` }}
        />
      ) : null}
      {ornamentKind ? <Ornament kind={ornamentKind} /> : null}
      <div className="relative flex flex-col items-center animate-fade-up">
        <p className="text-xs uppercase tracking-[0.3em] opacity-70">Undangan Pernikahan</p>
        <h1 className="mt-4 [font-family:var(--font-heading)] text-3xl font-semibold sm:text-5xl">
          {invitation.groom_name || "Mempelai"}
          <span className="mx-3 opacity-60">&amp;</span>
          {invitation.bride_name || "Mempelai"}
        </h1>
        <p className="mt-3 text-sm opacity-80">{formatDate(invitation.event_date)}</p>

        {guestName ? (
          <div className="mt-8 rounded-xl border border-current/20 bg-white/10 px-6 py-3 backdrop-blur">
            <p className="text-xs uppercase tracking-widest opacity-70">Kepada</p>
            <p className="mt-1 text-lg font-medium">{guestName}</p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onOpen}
          className={cn(
            "mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium transition hover:scale-[1.03]",
            accentClass,
          )}
        >
          <Heart className="h-4 w-4" /> Buka Undangan
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Countdown                                                                  */
/* -------------------------------------------------------------------------- */

export function Countdown({ date, className }: { date: string | null; className?: string }) {
  const target = useMemo(() => (date ? new Date(`${date}T08:00:00`).getTime() : null), [date]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!target || Number.isNaN(target)) return null;
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  return (
    <div className={cn("grid grid-cols-4 gap-2 text-center", className)}>
      {[
        { label: "Hari", value: days },
        { label: "Jam", value: hours },
        { label: "Menit", value: minutes },
        { label: "Detik", value: seconds },
      ].map((item) => (
        <div key={item.label} className="rounded-xl border border-current/15 bg-white/10 py-3 backdrop-blur">
          <p className="text-xl font-semibold tabular-nums sm:text-2xl">
            {String(item.value).padStart(2, "0")}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest opacity-70">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sections                                                                   */
/* -------------------------------------------------------------------------- */

export function Section({
  title,
  subtitle,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("px-5 py-12", className)}>
      <div className="mx-auto max-w-2xl">
        {title ? (
          <div className="mb-7 text-center">
            <h2 className="[font-family:var(--font-heading)] text-2xl font-semibold sm:text-3xl">{title}</h2>
            {subtitle ? <p className="mt-2 text-sm opacity-70">{subtitle}</p> : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export function OpeningBlock({ content }: { content: InvitationContent }) {
  const { opening } = content;
  if (!opening.greeting && !opening.quote) return null;
  return (
    <Section>
      {opening.greeting ? (
        <p className="text-center text-sm font-medium opacity-90">{opening.greeting}</p>
      ) : null}
      {opening.quote ? (
        <blockquote className="mt-6 text-center [font-family:var(--font-heading)] text-lg italic leading-relaxed">
          “{opening.quote}”
          {opening.quote_source ? (
            <footer className="mt-2 text-xs not-italic uppercase tracking-widest opacity-60">
              {opening.quote_source}
            </footer>
          ) : null}
        </blockquote>
      ) : null}
    </Section>
  );
}

export function CoupleBlock({ invitation, initial }: { invitation: InvitationFull; initial: string }) {
  return (
    <Section>
      <div className="grid gap-8 text-center sm:grid-cols-2">
        {[
          { role: "Mempelai Pria", name: invitation.groom_name },
          { role: "Mempelai Wanita", name: invitation.bride_name },
        ].map((person) => (
          <div key={person.role} className="flex flex-col items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-current/20 bg-white/10 [font-family:var(--font-heading)] text-3xl">
              {(person.name || "?").charAt(0)}
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] opacity-60">{person.role}</p>
            <p className="mt-1 [font-family:var(--font-heading)] text-xl font-semibold">{person.name || "-"}</p>
            <p className="mt-1 text-xs opacity-60">{initial}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function StoryBlock({ content }: { content: InvitationContent }) {
  if (content.story.length === 0) return null;
  return (
    <Section title="Cerita Kami">
      <ol className="relative space-y-6 border-l border-current/20 pl-6">
        {content.story.map((item) => (
          <li key={item.id} className="relative">
            <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-current opacity-60" />
            <p className="text-xs uppercase tracking-widest opacity-60">{item.time}</p>
            <p className="mt-1 [font-family:var(--font-heading)] text-lg font-semibold">{item.title}</p>
            {item.description ? (
              <p className="mt-1 text-sm leading-relaxed opacity-80">{item.description}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function EventsBlock({
  content,
  eventDate,
  cardClass,
}: {
  content: InvitationContent;
  eventDate: string | null;
  cardClass?: string;
}) {
  if (content.events.length === 0 && !eventDate) return null;
  const events = content.events.length
    ? content.events
    : [
        {
          id: "default",
          name: "Acara Pernikahan",
          date: eventDate ?? "",
          time: "",
          location: "",
          address: "",
          maps_url: "",
        },
      ];

  return (
    <Section title="Waktu & Tempat">
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className={cn("rounded-2xl border border-current/15 bg-white/10 p-5 backdrop-blur", cardClass)}>
            <p className="[font-family:var(--font-heading)] text-lg font-semibold">{event.name || "Acara"}</p>
            <div className="mt-3 space-y-2 text-sm opacity-85">
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 shrink-0" /> {formatDate(event.date)}
              </p>
              {event.time ? (
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0" /> {event.time}
                </p>
              ) : null}
              {event.location || event.address ? (
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {event.location}
                    {event.address ? (
                      <>
                        <br />
                        <span className="opacity-80">{event.address}</span>
                      </>
                    ) : null}
                  </span>
                </p>
              ) : null}
            </div>
            {event.maps_url ? (
              <a
                href={event.maps_url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-current/30 px-4 py-1.5 text-xs font-medium transition hover:bg-current/10"
              >
                <MapPin className="h-3.5 w-3.5" /> Lihat lokasi
              </a>
            ) : null}
          </div>
        ))}
      </div>
      <Countdown date={eventDate} className="mt-8" />
    </Section>
  );
}

export function GalleryBlock({ photos, columns = 3 }: { photos: string[]; columns?: number }) {
  const [active, setActive] = useState<string | null>(null);
  if (photos.length === 0) return null;
  return (
    <Section title="Galeri">
      <div
        className={cn(
          "grid gap-2",
          columns === 2 ? "grid-cols-2" : columns === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3",
        )}
      >
        {photos.map((photo) => (
          <button
            type="button"
            key={photo}
            onClick={() => setActive(photo)}
            className="aspect-square overflow-hidden rounded-xl"
          >
            <img
              src={photo}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 hover:scale-105"
            />
          </button>
        ))}
      </div>
      {active ? (
        <button
          type="button"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setActive(null)}
          aria-label="Tutup"
        >
          <img src={active} alt="" className="max-h-full max-w-full rounded-xl object-contain" />
        </button>
      ) : null}
    </Section>
  );
}

export function GiftBlock({ content }: { content: InvitationContent }) {
  const toast = useToast();
  if (content.gift.length === 0) return null;
  return (
    <Section title="Amplop Digital" subtitle="Tanpa mengurangi rasa hormat, kado bisa dikirim ke:">
      <div className="space-y-3">
        {content.gift.map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-current/15 bg-white/10 p-4 backdrop-blur"
          >
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest opacity-60">{account.bank}</p>
              <p className="mt-0.5 [font-family:var(--font-heading)] text-lg font-semibold tracking-wide">
                {account.account_number}
              </p>
              <p className="text-xs opacity-70">a.n. {account.account_name}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(account.account_number);
                toast.success("Nomor rekening disalin.");
              }}
              className="shrink-0 rounded-full border border-current/30 p-2.5 transition hover:bg-current/10"
              title="Salin nomor"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* RSVP                                                                       */
/* -------------------------------------------------------------------------- */

export function DemoNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-current/20 bg-current/5 px-4 py-2.5 text-center text-xs opacity-75">
      {children}
    </p>
  );
}

export function RsvpBlock({
  invitationId,
  guestId,
  onDone,
  buttonClass,
  demo = false,
}: {
  invitationId: string;
  guestId: string | null;
  onDone: () => void;
  buttonClass?: string;
  demo?: boolean;
}) {
  const [attendance, setAttendance] = useState<RsvpRow["attendance"]>("hadir");
  const [guestCount, setGuestCount] = useState(1);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    setError("");
    try {
      await submitRsvp({ invitationId, guestId, attendance, guestCount });
      setDone(true);
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const options: Array<RsvpRow["attendance"]> = ["hadir", "tidak_hadir", "masih_ragu"];

  if (demo) {
    return (
      <Section title="Konfirmasi Kehadiran">
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-3">
            {options.map((option, index) => (
              <div
                key={option}
                className={cn(
                  "rounded-xl border px-4 py-3 text-center text-sm font-medium",
                  index === 0 ? "border-current bg-current/15" : "border-current/20",
                )}
              >
                {ATTENDANCE_LABELS[option]}
              </div>
            ))}
          </div>
          <DemoNote>Tamu bisa mengisi konfirmasi kehadiran di undangan asli.</DemoNote>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Konfirmasi Kehadiran">
      {done ? (
        <div className="rounded-2xl border border-current/15 bg-white/10 p-6 text-center backdrop-blur">
          <p className="[font-family:var(--font-heading)] text-lg font-semibold">Terima kasih!</p>
          <p className="mt-1 text-sm opacity-75">Konfirmasi kehadiranmu sudah kami terima.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-3">
            {options.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => setAttendance(option)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-sm font-medium transition",
                  attendance === option
                    ? "border-current bg-current/15"
                    : "border-current/20 hover:border-current/40",
                )}
              >
                {ATTENDANCE_LABELS[option]}
              </button>
            ))}
          </div>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-current/20 px-4 py-3 text-sm">
            Jumlah orang
            <input
              type="number"
              min={0}
              max={20}
              value={guestCount}
              onChange={(e) => setGuestCount(Math.max(0, Number(e.target.value)))}
              className="w-20 rounded-lg border border-current/20 bg-white/20 px-3 py-1.5 text-center outline-none"
            />
          </label>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <button
            type="submit"
            disabled={sending}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition disabled:opacity-60",
              buttonClass,
            )}
          >
            <Send className="h-4 w-4" /> {sending ? "Mengirim..." : "Kirim konfirmasi"}
          </button>
        </form>
      )}
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* Wishes                                                                     */
/* -------------------------------------------------------------------------- */

export function WishesBlock({
  invitationId,
  guestName,
  wishes,
  onNewWish,
  buttonClass,
  demo = false,
}: {
  invitationId: string;
  guestName: string | null;
  wishes: WishRow[];
  onNewWish: (wish: WishRow) => void;
  buttonClass?: string;
  demo?: boolean;
}) {
  const [name, setName] = useState(guestName ?? "");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError("Nama dan ucapan wajib diisi.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const wish = await submitWish({
        invitationId,
        guestName: name.trim(),
        message: message.trim(),
      });
      onNewWish(wish);
      setMessage("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  if (demo) {
    return (
      <Section title="Ucapan & Doa">
        <div className="space-y-3">
          <DemoNote>Tamu bisa mengirim ucapan dan doa di undangan asli.</DemoNote>
          {wishes.map((wish) => (
            <div
              key={wish.id}
              className="rounded-2xl border border-current/15 bg-white/10 p-4 backdrop-blur"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{wish.guest_name}</p>
                <p className="text-[11px] opacity-50">{formatDateTime(wish.created_at)}</p>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed opacity-85">
                {wish.message}
              </p>
            </div>
          ))}
        </div>
      </Section>
    );
  }

  return (
    <Section title="Ucapan & Doa">
      <form onSubmit={submit} className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama kamu"
          className="w-full rounded-xl border border-current/20 bg-white/10 px-4 py-3 text-sm outline-none placeholder:opacity-60"
        />
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tulis ucapan dan doa terbaikmu..."
          className="w-full rounded-xl border border-current/20 bg-white/10 px-4 py-3 text-sm outline-none placeholder:opacity-60"
        />
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <button
          type="submit"
          disabled={sending}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition disabled:opacity-60",
            buttonClass,
          )}
        >
          <Send className="h-4 w-4" /> {sending ? "Mengirim..." : "Kirim ucapan"}
        </button>
      </form>

      <div className="mt-8 space-y-3">
        {wishes.length === 0 ? (
          <p className="text-center text-sm opacity-60">Jadilah yang pertama memberi ucapan.</p>
        ) : (
          wishes.map((wish) => (
            <div
              key={wish.id}
              className="rounded-2xl border border-current/15 bg-white/10 p-4 backdrop-blur"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{wish.guest_name}</p>
                <p className="text-[11px] opacity-50">{formatDateTime(wish.created_at)}</p>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed opacity-85">
                {wish.message}
              </p>
            </div>
          ))
        )}
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* Music                                                                      */
/* -------------------------------------------------------------------------- */

export function MusicPlayer({ url, className }: { url: string; className?: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  if (!url) return null;

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  return (
    <>
      <audio ref={audioRef} src={url} loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-current/20 bg-white/15 shadow-lg backdrop-blur transition hover:scale-105",
          className,
        )}
        title={playing ? "Jeda musik" : "Putar musik"}
      >
        {playing ? <Pause className="h-5 w-5" /> : <Music className="h-5 w-5" />}
        <Volume2 className="sr-only" />
      </button>
    </>
  );
}

export function ClosingBlock({ content }: { content: InvitationContent }) {
  if (!content.closing) return null;
  return (
    <Section>
      <p className="text-center text-sm leading-relaxed opacity-85">{content.closing}</p>
    </Section>
  );
}

export function Footer({ names }: { names: string }) {
  return (
    <footer className="border-t border-current/15 px-5 py-8 text-center text-xs opacity-60">
      <p>{names}</p>
      <p className="mt-1">Dibuat dengan Invite</p>
    </footer>
  );
}
