import { useState, type CSSProperties } from "react";
import { ChevronLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { getThemeTokens } from "../../../lib/theme-tokens";
import { planHasFeature } from "../../../lib/types";
import { cn } from "../../../lib/utils";
import {
  ClosingBlock,
  CoupleBlock,
  CoverGate,
  EventsBlock,
  Footer,
  GalleryBlock,
  GiftBlock,
  MusicPlayer,
  OpeningBlock,
  RsvpBlock,
  StoryBlock,
  WishesBlock,
} from "./common";
import { Ornament } from "./ornaments";
import type { ThemeProps } from "./theme-types";

export default function ThemeRenderer({
  invitation,
  content,
  guestName,
  guestId,
  wishes,
  onNewWish,
  onRsvpDone,
  demo = false,
}: ThemeProps) {
  const [opened, setOpened] = useState(false);
  const tokens = getThemeTokens(invitation.theme?.key);

  const canMusic = planHasFeature(invitation.plan, "custom_music");
  const canGift = planHasFeature(invitation.plan, "amplop_digital");
  const canGallery = planHasFeature(invitation.plan, "galeri");
  const names = [invitation.groom_name, invitation.bride_name].filter(Boolean).join(" & ");

  const style = {
    "--font-heading": tokens.heading,
  } as CSSProperties;

  return (
    <div
      style={style}
      className={cn(
        "relative min-h-screen",
        tokens.page,
        tokens.uppercaseHeading && "[&_h1]:uppercase [&_h2]:uppercase [&_h1]:tracking-[0.08em]",
      )}
    >
      <Ornament kind={tokens.ornament} />

      {canMusic ? <MusicPlayer url={content.music_url} className="text-current" /> : null}

      {!opened ? (
        <CoverGate
          invitation={invitation}
          guestName={guestName}
          onOpen={() => setOpened(true)}
          bgClass={cn(tokens.cover, "relative")}
          accentClass={tokens.coverButton}
          ornamentKind={tokens.ornament}
        />
      ) : null}

      {demo && !opened ? <DemoBar themeName={tokens.name} category={tokens.category} /> : null}
      {demo && opened ? <DemoBar themeName={tokens.name} category={tokens.category} compact /> : null}

      <main className={cn("relative", opened ? "animate-fade-in" : "invisible")}>
        <OpeningBlock content={content} />
        <CoupleBlock
          invitation={invitation}
          initial={tokens.uppercaseHeading ? "Putra & Putri" : "Putra & Putri"}
        />

        <div className={tokens.darkSection}>
          <EventsBlock content={content} eventDate={invitation.event_date} />
        </div>

        <StoryBlock content={content} />

        {canGallery ? (
          <GalleryBlock photos={content.photos} columns={tokens.galleryColumns} />
        ) : null}

        {canGift ? (
          <div className={tokens.softSection}>
            <GiftBlock content={content} />
          </div>
        ) : null}

        <div className={tokens.softSection}>
          <RsvpBlock
            invitationId={invitation.id}
            guestId={guestId}
            onDone={onRsvpDone}
            buttonClass={tokens.cta}
            demo={demo}
          />
        </div>

        <div className={tokens.darkSection}>
          <WishesBlock
            invitationId={invitation.id}
            guestName={guestName}
            wishes={wishes}
            onNewWish={onNewWish}
            buttonClass={tokens.cta}
            demo={demo}
          />
        </div>

        <ClosingBlock content={content} />
        <Footer names={names} />
      </main>
    </div>
  );
}

function DemoBar({
  themeName,
  category,
  compact = false,
}: {
  themeName: string;
  category: "basic" | "eksklusif";
  compact?: boolean;
}) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-3 border-b border-white/10 bg-slate-950/90 px-3 py-2 text-white backdrop-blur sm:px-5">
      <Link
        to="/#tema"
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" /> Semua tema
      </Link>
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-xs font-medium sm:text-sm">{themeName}</span>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            category === "eksklusif"
              ? "bg-amber-400/20 text-amber-300"
              : "bg-emerald-400/20 text-emerald-300",
          )}
        >
          {category}
        </span>
      </div>
      <span className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
        <Sparkles className="h-3.5 w-3.5" />
        {compact ? "Mode pratinjau" : "Klik \u201cBuka Undangan\u201d untuk melihat isinya"}
      </span>
    </div>
  );
}
