import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  CalendarDays,
  Clock,
  Copy,
  Facebook,
  Globe,
  Heart,
  Instagram,
  Link as LinkIcon,
  Linkedin,
  MapPin,
  Music,
  Music2,
  Pause,
  Send,
  Twitter,
  Volume2,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { submitRsvp, submitWish } from "../../../lib/api";
import type {
  CoverStyle,
  EventItem,
  InvitationContent,
  InvitationFull,
  RsvpRow,
  SectionVariant,
  SocialLink,
  WishRow,
} from "../../../lib/types";
import { ATTENDANCE_LABELS } from "../../../lib/constants";
import { cn, formatDate, formatDateTime } from "../../../lib/utils";
import { useToast } from "../../../hooks/useToast";
import {
  THEMES,
  type NameFont,
  type OrnamentKind,
  type ThemeTokens,
} from "../../../lib/theme-tokens";
import { Ornament } from "./ornaments";

/* -------------------------------------------------------------------------- */
/* Premium — pembatas antar section untuk tema eksklusif                      */
/* -------------------------------------------------------------------------- */

const ThemeContext = createContext<ThemeTokens>(THEMES[0]);

export function ThemeProvider({ value, children }: { value: ThemeTokens; children: ReactNode }) {
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Font script untuk nama mempelai pada tema tertentu. */
const SCRIPT_FONT = "'Great Vibes', cursive";

/** Link "Save the Date" ke Google Calendar (acara seharian). */
function calendarUrl(invitation: InvitationFull): string | null {
  if (!invitation.event_date) return null;
  const date = invitation.event_date.replace(/-/g, "");
  if (date.length !== 8) return null;
  const names = [invitation.groom_name, invitation.bride_name].filter(Boolean).join(" & ");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: names ? `Pernikahan ${names}` : "Pernikahan",
    dates: `${date}/${date}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function SectionDivider({
  className,
  kind = "diamond",
}: {
  className?: string;
  kind?: "line" | "diamond";
}) {
  if (kind === "line") {
    return (
      <div aria-hidden className={cn("flex justify-center text-current", className)}>
        <span className="h-px w-16 bg-current opacity-40 sm:w-24" />
      </div>
    );
  }
  return (
    <div
      aria-hidden
      className={cn("flex items-center justify-center gap-3 text-current opacity-60", className)}
    >
      <span className="h-px w-12 bg-current sm:w-16" />
      <span className="h-1.5 w-1.5 rotate-45 bg-current" />
      <span className="h-px w-12 bg-current sm:w-16" />
    </div>
  );
}

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
  coverStyle = "centered",
  eventDate = null,
  nameFont = "heading",
}: {
  invitation: InvitationFull;
  guestName: string | null;
  onOpen: () => void;
  accentClass: string;
  bgClass: string;
  ornamentKind?: OrnamentKind;
  coverStyle?: CoverStyle;
  eventDate?: string | null;
  nameFont?: NameFont;
}) {
  const full = coverStyle === "full";
  const framed = coverStyle === "framed";
  const split = coverStyle === "split";
  const panel = coverStyle === "panel";
  const arch = coverStyle === "arch";
  const minimal = coverStyle === "minimal";
  const inlineImage = invitation.cover_image && (split || panel || arch);
  const backgroundImage = invitation.cover_image && !inlineImage;
  const calendar = calendarUrl(invitation);
  return (
    <div
      className={cn(
        "fixed inset-0 z-40 flex flex-col items-center px-6 text-center",
        full ? "justify-end pb-16" : "justify-center",
        bgClass,
      )}
    >
      {backgroundImage ? (
        <div
          className={cn("absolute inset-0 bg-cover bg-center", full ? "opacity-60" : "opacity-25")}
          style={{ backgroundImage: `url(${invitation.cover_image})` }}
        />
      ) : null}
      {full ? (
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/75" />
      ) : null}
      {ornamentKind ? <Ornament kind={ornamentKind} /> : null}
      <div
        className={cn(
          "relative flex flex-col items-center animate-fade-up",
          framed && "border border-current/30 bg-black/5 px-8 py-10 sm:px-12",
        )}
      >
        {inlineImage ? (
          <div
            className={cn(
              "mb-6 bg-cover bg-center",
              split && "h-40 w-64 rounded-3xl shadow-lg sm:h-48 sm:w-72",
              panel && "h-44 w-64 rounded-2xl border border-current/30 sm:h-52 sm:w-72",
              arch && "h-48 w-36 rounded-t-full border border-current/30 sm:h-56 sm:w-40",
            )}
            style={{ backgroundImage: `url(${invitation.cover_image})` }}
          />
        ) : null}
        <p className="text-xs uppercase tracking-[0.3em] opacity-70">Undangan Pernikahan</p>
        <h1
          className={cn(
            "mt-4 font-semibold",
            minimal ? "text-2xl sm:text-4xl" : "text-3xl sm:text-5xl",
          )}
          style={
            nameFont === "script"
              ? { fontFamily: SCRIPT_FONT, fontWeight: 400, lineHeight: 1.1 }
              : undefined
          }
        >
          {invitation.groom_name || "Mempelai"}
          <span className="mx-3 opacity-60">&amp;</span>
          {invitation.bride_name || "Mempelai"}
        </h1>
        {coverStyle !== "centered" && coverStyle !== "minimal" ? (
          <SectionDivider className="mt-5" />
        ) : null}
        <p className="mt-3 text-sm opacity-80">{formatDate(invitation.event_date)}</p>

        {guestName ? (
          <div className="mt-8 rounded-xl border border-current/20 bg-white/10 px-6 py-3 backdrop-blur">
            <p className="text-xs uppercase tracking-widest opacity-70">Kepada</p>
            <p className="mt-1 text-lg font-medium">{guestName}</p>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onOpen}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium transition hover:scale-[1.03]",
              accentClass,
            )}
          >
            <Heart className="h-4 w-4" /> Buka Undangan
          </button>
          {calendar ? (
            <a
              href={calendar}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-current/40 px-7 py-3 text-sm font-medium transition hover:bg-current/10"
            >
              <CalendarDays className="h-4 w-4" /> Save the Date
            </a>
          ) : null}
        </div>
        {eventDate ? <Countdown date={eventDate} className="mx-auto mt-8 w-full max-w-xs" /> : null}
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
  divider,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  divider?: boolean;
}) {
  const theme = useContext(ThemeContext);
  const dividerKind = theme.divider ?? "diamond";
  const showDivider = divider ?? dividerKind !== "none";
  const header = theme.header ?? "center";
  return (
    <section className={cn("px-5 py-12", className)}>
      <div className="mx-auto max-w-2xl">
        {showDivider ? (
          <SectionDivider className="mb-8" kind={dividerKind === "line" ? "line" : "diamond"} />
        ) : null}
        {title ? (
          <div className={cn("mb-7", header === "left" ? "text-left" : "text-center")}>
            {header === "eyebrow" ? (
              <span className="mx-auto mb-3 flex items-center justify-center gap-2">
                <span className="h-px w-6 bg-current opacity-50" />
                <span className="h-1 w-1 rotate-45 bg-current opacity-60" />
                <span className="h-px w-6 bg-current opacity-50" />
              </span>
            ) : null}
            <h2 className="[font-family:var(--font-heading)] text-2xl font-semibold sm:text-3xl">{title}</h2>
            {header === "left" || header === "rule" ? (
              <span
                className={cn(
                  "mt-3 block h-px w-14 bg-current opacity-40",
                  header === "rule" && "mx-auto",
                )}
              />
            ) : null}
            {subtitle ? <p className="mt-2 text-sm opacity-70">{subtitle}</p> : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export function OpeningBlock({ content }: { content: InvitationContent }) {
  const theme = useContext(ThemeContext);
  const style = theme.opening ?? "plain";
  const { opening } = content;
  if (!opening.greeting && !opening.quote) return null;

  const body = (
    <>
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
    </>
  );

  if (style === "quote") {
    return (
      <Section divider={false}>
        <div className="relative text-center">
          <span className="[font-family:var(--font-heading)] text-6xl leading-none opacity-25">
            “
          </span>
          <div className="-mt-4">{body}</div>
        </div>
      </Section>
    );
  }

  if (style === "framed" || style === "boxed") {
    return (
      <Section divider={false}>
        <div
          className={cn(
            "rounded-3xl px-6 py-9",
            style === "framed"
              ? "border border-current/35"
              : "border border-current/20 bg-white/5 backdrop-blur-sm",
          )}
        >
          {body}
        </div>
      </Section>
    );
  }

  return <Section divider={false}>{body}</Section>;
}

export function CoupleBlock({
  invitation,
  initial,
  groomPhoto = "",
  bridePhoto = "",
}: {
  invitation: InvitationFull;
  initial: string;
  groomPhoto?: string;
  bridePhoto?: string;
}) {
  const theme = useContext(ThemeContext);
  const style = theme.couple ?? "circles";
  const groom = invitation.groom_name || "?";
  const bride = invitation.bride_name || "?";
  const people = [
    { role: "Mempelai Pria", name: groom, photo: groomPhoto },
    { role: "Mempelai Wanita", name: bride, photo: bridePhoto },
  ];

  if (style === "monogram") {
    return (
      <Section>
        <div className="flex flex-col items-center">
          <div className="flex h-40 w-64 items-center justify-center rounded-t-full border border-current/25 bg-white/5 [font-family:var(--font-heading)] text-5xl font-semibold tracking-wide">
            {groom.charAt(0)}
            <span className="mx-3 opacity-50">&amp;</span>
            {bride.charAt(0)}
          </div>
          <div className="mt-7 grid w-full max-w-lg gap-6 text-center sm:grid-cols-2">
            {people.map((person) => (
              <div key={person.role}>
                <p className="text-xs uppercase tracking-[0.2em] opacity-60">{person.role}</p>
                <p className="mt-1 [font-family:var(--font-heading)] text-xl font-semibold">
                  {person.name}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs uppercase tracking-[0.2em] opacity-60">{initial}</p>
        </div>
      </Section>
    );
  }

  if (style === "portrait") {
    return (
      <Section>
        <div className="grid gap-6 sm:grid-cols-2">
          {people.map((person) => (
            <div key={person.role} className="text-center">
              <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl border border-current/20 bg-white/5">
                {person.photo ? (
                  <img src={person.photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center [font-family:var(--font-heading)] text-6xl opacity-40">
                    {person.name.charAt(0)}
                  </div>
                )}
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.25em] opacity-60">{person.role}</p>
              <p className="mt-1 [font-family:var(--font-heading)] text-2xl font-semibold">
                {person.name}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs uppercase tracking-[0.2em] opacity-60">{initial}</p>
      </Section>
    );
  }

  if (style === "arch") {
    return (
      <Section>
        <div className="flex flex-col items-center">
          <p className="text-xs uppercase tracking-[0.4em] opacity-60">The Wedding Of</p>
          <div className="mt-8 grid w-full max-w-lg gap-8 sm:grid-cols-2">
            {people.map((person) => (
              <div key={person.role} className="flex flex-col items-center">
                <div className="h-56 w-44 overflow-hidden rounded-t-full border border-current/25 bg-white/5">
                  {person.photo ? (
                    <img src={person.photo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-end justify-center pb-6 [font-family:var(--font-heading)] text-4xl font-semibold opacity-70">
                      {person.name.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="mt-4 [font-family:var(--font-heading)] text-2xl font-semibold">
                  {person.name}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] opacity-60">{person.role}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.2em] opacity-60">{initial}</p>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className="grid gap-8 text-center sm:grid-cols-2">
        {people.map((person) => (
          <div key={person.role} className="flex flex-col items-center">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-current/20 bg-white/10 [font-family:var(--font-heading)] text-3xl">
              {person.photo ? (
                <img src={person.photo} alt="" className="h-full w-full object-cover" />
              ) : (
                person.name.charAt(0)
              )}
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] opacity-60">{person.role}</p>
            <p className="mt-1 [font-family:var(--font-heading)] text-xl font-semibold">{person.name}</p>
            <p className="mt-1 text-xs opacity-60">{initial}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function safeHref(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : null;
  } catch {
    return null;
  }
}

const PLATFORM_ICONS: Record<string, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music2,
  "x (twitter)": Twitter,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  website: Globe,
};

function platformIcon(platform: string): LucideIcon {
  return PLATFORM_ICONS[platform.trim().toLowerCase()] ?? LinkIcon;
}

export function SocialBlock({ socials }: { socials: SocialLink[] }) {
  const links = socials
    .map((social) => ({ ...social, href: safeHref(social.url.trim()) }))
    .filter((social): social is SocialLink & { href: string } => Boolean(social.href));
  if (links.length === 0) return null;

  const groups: Array<{ owner: SocialLink["owner"]; label: string }> = [
    { owner: "pria", label: "Mempelai Pria" },
    { owner: "wanita", label: "Mempelai Wanita" },
  ];

  return (
    <Section title="Sosial Media">
      <div className="space-y-6">
        {groups.map((group) => {
          const items = links.filter((social) => social.owner === group.owner);
          if (items.length === 0) return null;
          return (
            <div key={group.owner} className="text-center">
              <p className="text-xs uppercase tracking-[0.25em] opacity-60">{group.label}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-3">
                {items.map((social) => {
                  const Icon = platformIcon(social.platform);
                  const label = social.platform.trim() || "Link";
                  return (
                    <a
                      key={social.id}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      title={label}
                      aria-label={label}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-current/25 transition hover:bg-current/10"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

export function StoryBlock({ content }: { content: InvitationContent }) {
  const theme = useContext(ThemeContext);
  const style = theme.story ?? "timeline";
  if (content.story.length === 0) return null;

  if (style === "list") {
    return (
      <Section title="Cerita Kami">
        <div className="space-y-5">
          {content.story.map((item) => (
            <div key={item.id} className="border-t border-current/15 pt-5 first:border-t-0 first:pt-0">
              <p className="text-xs uppercase tracking-widest opacity-60">{item.time}</p>
              <p className="mt-1 [font-family:var(--font-heading)] text-lg font-semibold">{item.title}</p>
              {item.description ? (
                <p className="mt-1 text-sm leading-relaxed opacity-80">{item.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      </Section>
    );
  }

  if (style === "cards") {
    return (
      <Section title="Cerita Kami">
        <div className="grid gap-4 sm:grid-cols-2">
          {content.story.map((item) => (
            <div key={item.id} className="rounded-2xl border border-current/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-widest opacity-60">{item.time}</p>
              <p className="mt-1 [font-family:var(--font-heading)] text-lg font-semibold">{item.title}</p>
              {item.description ? (
                <p className="mt-1.5 text-sm leading-relaxed opacity-80">{item.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      </Section>
    );
  }

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

function EventCard({
  event,
  variant = "card",
  cardClass,
}: {
  event: EventItem;
  variant?: "card" | "plain" | "framed";
  cardClass?: string;
}) {
  const base =
    variant === "plain"
      ? "border-l-2 border-current/25 pl-5"
      : variant === "framed"
        ? "rounded-2xl border border-current/40 bg-white/10 p-5 backdrop-blur"
        : "rounded-2xl border border-current/15 bg-white/10 p-5 backdrop-blur";
  return (
    <div className={cn(base, cardClass)}>
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
        {event.entertainment ? (
          <p className="flex items-center gap-2">
            <Music className="h-4 w-4 shrink-0" /> Hiburan: {event.entertainment}
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
  );
}

export function EventsBlock({
  content,
  eventDate,
  cardClass,
  variant,
}: {
  content: InvitationContent;
  eventDate: string | null;
  cardClass?: string;
  variant?: SectionVariant;
}) {
  const theme = useContext(ThemeContext);
  if (content.events.length === 0 && !eventDate) return null;
  const effective: SectionVariant = variant ?? theme.events ?? "cards";
  const events: EventItem[] = content.events.length
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
          entertainment: "",
        },
      ];

  if (effective === "timeline") {
    return (
      <Section title="Waktu & Tempat">
        <ol className="relative space-y-6 border-l border-current/25 pl-6">
          {events.map((event) => (
            <li key={event.id} className="relative">
              <span className="absolute -left-[31px] top-3 h-3 w-3 rounded-full bg-current opacity-70" />
              <EventCard event={event} cardClass={cardClass} />
            </li>
          ))}
        </ol>
        <Countdown date={eventDate} className="mt-8" />
      </Section>
    );
  }

  if (effective === "list") {
    return (
      <Section title="Waktu & Tempat">
        <div className="space-y-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} variant="plain" cardClass={cardClass} />
          ))}
        </div>
        <Countdown date={eventDate} className="mt-8" />
      </Section>
    );
  }

  return (
    <Section title="Waktu & Tempat">
      <div className="space-y-4">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            variant={theme.layout === "framed" ? "framed" : "card"}
            cardClass={cardClass}
          />
        ))}
      </div>
      <Countdown date={eventDate} className="mt-8" />
    </Section>
  );
}

export function GalleryBlock({
  photos,
  columns = 3,
  variant = "grid",
}: {
  photos: string[];
  columns?: number;
  variant?: "grid" | "masonry";
}) {
  const [active, setActive] = useState<string | null>(null);
  if (photos.length === 0) return null;
  return (
    <Section title="Galeri">
      {variant === "masonry" ? (
        <div className="columns-2 gap-2 sm:columns-3">
          {photos.map((photo) => (
            <button
              type="button"
              key={photo}
              onClick={() => setActive(photo)}
              className="mb-2 block w-full break-inside-avoid overflow-hidden rounded-xl"
            >
              <img
                src={photo}
                alt=""
                loading="lazy"
                className="w-full transition duration-500 hover:scale-105"
              />
            </button>
          ))}
        </div>
      ) : (
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
      )}
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
  const theme = useContext(ThemeContext);
  const toast = useToast();
  if (content.gift.length === 0) return null;
  const list = theme.gift === "list";
  return (
    <Section title="Amplop Digital" subtitle="Tanpa mengurangi rasa hormat, kado bisa dikirim ke:">
      <div className={cn(list ? "divide-y divide-current/15" : "space-y-3")}>
        {content.gift.map((account) => (
          <div
            key={account.id}
            className={cn(
              "flex items-center justify-between gap-3",
              list
                ? "py-4 first:pt-0 last:pb-0"
                : "rounded-2xl border border-current/15 bg-white/10 p-4 backdrop-blur",
            )}
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

function WishItem({ wish, plain = false }: { wish: WishRow; plain?: boolean }) {
  return (
    <div
      className={cn(
        plain
          ? "border-t border-current/15 pt-4 first:border-t-0 first:pt-0"
          : "rounded-2xl border border-current/15 bg-white/10 p-4 backdrop-blur",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{wish.guest_name}</p>
        <p className="text-[11px] opacity-50">{formatDateTime(wish.created_at)}</p>
      </div>
      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed opacity-85">
        {wish.message}
      </p>
    </div>
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
  const theme = useContext(ThemeContext);
  const cardStyle = theme.rsvp !== "plain";

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
          <select
            disabled
            value="hadir"
            className="w-full rounded-xl border border-current/20 bg-white/10 px-4 py-3 text-sm outline-none opacity-70"
          >
            {options.map((option) => (
              <option key={option} value={option} className="text-slate-900">
                {ATTENDANCE_LABELS[option]}
              </option>
            ))}
          </select>
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
        <form
          onSubmit={submit}
          className={cn(
            "space-y-4",
            cardStyle && "rounded-2xl border border-current/15 bg-white/10 p-5 backdrop-blur",
          )}
        >
          <select
            value={attendance}
            onChange={(e) => setAttendance(e.target.value as RsvpRow["attendance"])}
            className="w-full rounded-xl border border-current/20 bg-white/10 px-4 py-3 text-sm outline-none"
          >
            {options.map((option) => (
              <option key={option} value={option} className="text-slate-900">
                {ATTENDANCE_LABELS[option]}
              </option>
            ))}
          </select>
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
  const theme = useContext(ThemeContext);
  const plain = theme.wishes === "plain";

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
            <WishItem key={wish.id} wish={wish} plain={plain} />
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
            <WishItem key={wish.id} wish={wish} plain={plain} />
          ))
        )}
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* Music                                                                      */
/* -------------------------------------------------------------------------- */

export function MusicPlayer({
  url,
  className,
  autoPlay = false,
}: {
  url: string;
  className?: string;
  autoPlay?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!url || !autoPlay || !audio) return;
    void audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [autoPlay, url]);

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
  const theme = useContext(ThemeContext);
  const style = theme.closing ?? "plain";
  if (!content.closing) return null;
  const big = style === "big";
  const text = (
    <p
      className={cn(
        "text-center leading-relaxed",
        big
          ? "[font-family:var(--font-heading)] text-lg opacity-90 sm:text-xl"
          : "text-sm opacity-85",
      )}
    >
      {content.closing}
    </p>
  );
  if (style === "framed") {
    return (
      <Section>
        <div className="rounded-3xl border border-current/25 px-6 py-8">{text}</div>
      </Section>
    );
  }
  return <Section>{text}</Section>;
}

export function Footer({ names }: { names: string }) {
  return (
    <footer className="border-t border-current/15 px-5 py-8 text-center text-xs opacity-60">
      <p>{names}</p>
      <p className="mt-1">Dibuat dengan Invite</p>
    </footer>
  );
}
