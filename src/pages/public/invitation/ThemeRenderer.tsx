import { Fragment, useState, type CSSProperties } from "react";
import { ChevronLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { getThemeTokens, type ThemeLayout } from "../../../lib/theme-tokens";
import { DEFAULT_MUSIC } from "../../../lib/constants";
import { planHasFeature, type CoverStyle, type SectionBackground, type SectionConfig, type SectionKey } from "../../../lib/types";
import { cn } from "../../../lib/utils";
import {
  ClosingBlock,
  CoupleBlock,
  CoverGate,
  EventsBlock,
  Footer,
  GalleryBlock,
  GiftBlock,
  ThemeProvider,
  MusicPlayer,
  OpeningBlock,
  RsvpBlock,
  SocialBlock,
  StoryBlock,
  WishesBlock,
} from "./common";
import { Ornament } from "./ornaments";
import type { ThemeProps } from "./theme-types";

function defaultCover(layout: ThemeLayout): CoverStyle {
  if (layout === "editorial") return "full";
  if (layout === "framed") return "framed";
  return "centered";
}

function defaultBackground(id: SectionKey): SectionBackground {
  if (id === "events" || id === "wishes") return "dark";
  if (id === "gift" || id === "rsvp") return "soft";
  return "none";
}

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
  const canCouplePhoto = planHasFeature(invitation.plan, "foto_mempelai");
  const canSocial = planHasFeature(invitation.plan, "sosial_media");
  const layout = tokens.layout ?? "floral";
  const cover: CoverStyle = content.layout.cover ?? tokens.coverStyle ?? defaultCover(layout);
  const names = [invitation.groom_name, invitation.bride_name].filter(Boolean).join(" & ");

  const style = {
    "--font-heading": tokens.heading,
  } as CSSProperties;

  const renderSection = (section: SectionConfig) => {
    switch (section.id) {
      case "opening":
        return <OpeningBlock content={content} />;
      case "couple":
        return (
          <CoupleBlock
            invitation={invitation}
            initial="Putra & Putri"
            groomPhoto={canCouplePhoto ? content.groom_photo : ""}
            bridePhoto={canCouplePhoto ? content.bride_photo : ""}
          />
        );
      case "social":
        return canSocial && content.socials.length > 0 ? (
          <SocialBlock socials={content.socials} />
        ) : null;
      case "events":
        return (
          <EventsBlock content={content} eventDate={invitation.event_date} variant={section.variant} />
        );
      case "story":
        return <StoryBlock content={content} />;
      case "gallery":
        return canGallery ? (
          <GalleryBlock
            photos={content.photos}
            columns={tokens.galleryColumns}
            variant={
              section.variant === "masonry"
                ? "masonry"
                : section.variant === "grid"
                  ? "grid"
                  : tokens.gallery ?? "grid"
            }
          />
        ) : null;
      case "gift":
        return canGift ? <GiftBlock content={content} /> : null;
      case "rsvp":
        return (
          <RsvpBlock
            invitationId={invitation.id}
            guestId={guestId}
            onDone={onRsvpDone}
            buttonClass={tokens.cta}
            demo={demo}
          />
        );
      case "wishes":
        return (
          <WishesBlock
            invitationId={invitation.id}
            guestName={guestName}
            wishes={wishes}
            onNewWish={onNewWish}
            buttonClass={tokens.cta}
            demo={demo}
          />
        );
      case "closing":
        return <ClosingBlock content={content} />;
      default:
        return null;
    }
  };

  const sectionBackground = (section: SectionConfig) => {
    const value =
      section.background && section.background !== "auto"
        ? section.background
        : defaultBackground(section.id);
    if (value === "dark") return tokens.darkSection;
    if (value === "soft") return tokens.softSection;
    return "";
  };

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

      {layout === "framed" ? (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-2 z-20 border border-current/25 sm:inset-4"
        />
      ) : null}
      {tokens.decor === "frame" ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none fixed inset-2 z-20 border border-current/30 sm:inset-4"
          />
          <div
            aria-hidden
            className="pointer-events-none fixed inset-3 z-20 border border-current/15 sm:inset-6"
          />
        </>
      ) : null}
      {tokens.decor === "vignette" ? (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]"
        />
      ) : null}

      {content.music_enabled ? (
        <MusicPlayer
          url={canMusic ? content.music_url : DEFAULT_MUSIC.url}
          autoPlay={opened}
          className="text-current"
        />
      ) : null}

      {!opened ? (
        <CoverGate
          invitation={invitation}
          guestName={guestName}
          onOpen={() => setOpened(true)}
          bgClass={tokens.cover}
          accentClass={tokens.coverButton}
          ornamentKind={tokens.ornament}
          coverStyle={cover}
          eventDate={invitation.event_date}
          nameFont={tokens.nameFont}
        />
      ) : null}

      {demo && !opened ? <DemoBar themeName={tokens.name} category={tokens.category} /> : null}
      {demo && opened ? <DemoBar themeName={tokens.name} category={tokens.category} compact /> : null}

      <main className={cn("relative", demo && "pt-14", opened ? "animate-fade-in" : "hidden")}>
        <ThemeProvider value={tokens}>
          {content.layout.sections
            .filter((section) => section.enabled)
            .map((section) => {
              const node = renderSection(section);
              const bg = sectionBackground(section);
              return bg ? (
                <div key={section.id} className={bg}>
                  {node}
                </div>
              ) : (
                <Fragment key={section.id}>{node}</Fragment>
              );
            })}
          <Footer names={names} />
        </ThemeProvider>
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
