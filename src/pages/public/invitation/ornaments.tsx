import type { OrnamentKind } from "../../../lib/theme-tokens";

/**
 * Ornamen dekoratif per tema. Semua elemen `pointer-events-none` dan hanya
 * memakai arus warna `currentColor` supaya otomatis ikut palet temanya.
 */
export function Ornament({ kind }: { kind: OrnamentKind }) {
  if (kind === "none") return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {kind === "minimal" ? <Minimal /> : null}
      {kind === "floral" ? <Floral /> : null}
      {kind === "boho" ? <Boho /> : null}
      {kind === "batik" ? <Batik /> : null}
      {kind === "gold" ? <Gold /> : null}
      {kind === "marble" ? <Marble /> : null}
      {kind === "arabesque" ? <Arabesque /> : null}
      {kind === "tropical" ? <Tropical /> : null}
      {kind === "geometric" ? <Geometric /> : null}
      {kind === "sakura" ? <Sakura /> : null}
      {kind === "cinematic" ? <Cinematic /> : null}
    </div>
  );
}

function Corner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor">
      <path d="M2 2h50M2 2v50" strokeWidth="1" opacity="0.5" />
      <path d="M8 8h30M8 8v30" strokeWidth="0.6" opacity="0.35" />
      <circle cx="2" cy="2" r="2.5" fill="currentColor" stroke="none" opacity="0.6" />
    </svg>
  );
}

function DecoCorner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor">
      <path d="M2 60C2 28 28 2 60 2" strokeWidth="1" opacity="0.5" />
      <path d="M10 60C10 34 34 10 60 10" strokeWidth="0.7" opacity="0.35" />
      <path d="M2 60h26M60 2v26" strokeWidth="0.7" opacity="0.4" />
      <path d="M22 22l14 6-6 14z" strokeWidth="0.8" opacity="0.5" />
      <circle cx="60" cy="2" r="2" fill="currentColor" stroke="none" opacity="0.6" />
      <circle cx="2" cy="60" r="2" fill="currentColor" stroke="none" opacity="0.6" />
    </svg>
  );
}

function LeafBranch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 160" className={className} fill="none" stroke="currentColor">
      <path d="M40 0c18 50 18 110 0 160" strokeWidth="1" opacity="0.45" />
      {[24, 52, 80, 108, 136].map((y) => (
        <g key={y} opacity="0.35">
          <path d={`M40 ${y}c-12 4-20 12-24 24`} strokeWidth="0.7" />
          <path d={`M40 ${y}c12 4 20 12 24 24`} strokeWidth="0.7" />
        </g>
      ))}
    </svg>
  );
}

function SakuraBranch({ className }: { className?: string }) {
  const blooms: Array<[number, number]> = [
    [34, 34],
    [74, 56],
    [116, 88],
    [142, 120],
  ];
  return (
    <svg viewBox="0 0 200 160" className={className} fill="none" stroke="currentColor">
      <path d="M0 20c40 10 80 30 130 80" strokeWidth="1" opacity="0.4" />
      <path
        d="M30 30c10 2 18 8 24 16M70 52c10 2 18 8 24 16M110 84c10 2 18 8 24 16"
        strokeWidth="0.8"
        opacity="0.35"
      />
      {blooms.map(([x, y], index) => (
        <g key={index} transform={`translate(${x} ${y})`} fill="currentColor" opacity="0.5">
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse key={angle} cx="0" cy="-6" rx="3.2" ry="5.5" transform={`rotate(${angle})`} />
          ))}
        </g>
      ))}
    </svg>
  );
}

function Minimal() {
  return (
    <>
      <Corner className="absolute left-4 top-4 h-16 w-16 opacity-60 sm:h-24 sm:w-24" />
      <Corner className="absolute bottom-4 right-4 h-16 w-16 rotate-180 opacity-60 sm:h-24 sm:w-24" />
    </>
  );
}

function Flower({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" className={className} fill="none" stroke="currentColor">
      <g strokeWidth="0.8" opacity="0.5">
        <circle cx="42" cy="42" r="6" />
        <circle cx="42" cy="42" r="16" />
        <circle cx="42" cy="42" r="26" />
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse
            key={angle}
            cx="42"
            cy="42"
            rx="9"
            ry="22"
            transform={`rotate(${angle} 42 42)`}
          />
        ))}
      </g>
      <path d="M42 60c0 30 10 50 30 70" strokeWidth="1" opacity="0.4" />
      <path d="M60 96c-8-2-14 2-18 10 8 2 14-2 18-10z" fill="currentColor" opacity="0.25" />
      <path d="M70 112c8-2 14 2 18 10-8 2-14-2-18-10z" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

function Floral() {
  return (
    <>
      <Flower className="absolute -left-6 -top-4 h-40 w-40 opacity-40 sm:h-56 sm:w-56" />
      <Flower className="absolute -bottom-6 -right-6 h-40 w-40 rotate-180 opacity-40 sm:h-56 sm:w-56" />
      <LeafBranch className="absolute right-2 top-8 h-40 w-16 rotate-12 opacity-25" />
      <div className="absolute left-1/4 top-1/3 h-24 w-24 rounded-full bg-current opacity-[0.04] blur-2xl" />
    </>
  );
}

function Leaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 200" className={className} fill="none" stroke="currentColor">
      <path d="M60 0c40 60 40 120 0 200C20 120 20 60 60 0z" strokeWidth="1" opacity="0.45" />
      <path d="M60 10v180" strokeWidth="0.8" opacity="0.35" />
      {[30, 60, 90, 120, 150].map((y) => (
        <g key={y} opacity="0.3">
          <path d={`M60 ${y}l-22 14`} strokeWidth="0.7" />
          <path d={`M60 ${y}l22 14`} strokeWidth="0.7" />
        </g>
      ))}
    </svg>
  );
}

function Boho() {
  return (
    <>
      <Leaf className="absolute -left-8 top-0 h-56 w-36 -rotate-12 opacity-50" />
      <Leaf className="absolute -right-10 bottom-10 h-64 w-40 rotate-12 opacity-50" />
      <svg viewBox="0 0 200 40" className="absolute left-1/2 top-8 h-8 w-40 -translate-x-1/2" fill="none" stroke="currentColor">
        <path d="M0 20h70M130 20h70" strokeWidth="0.8" opacity="0.4" />
        <path d="M85 20a15 15 0 0130 0 15 15 0 01-30 0z" strokeWidth="0.8" opacity="0.5" />
      </svg>
    </>
  );
}

function Batik() {
  return (
    <>
      <div className="pattern-batik absolute inset-0 opacity-70" />
      <svg viewBox="0 0 120 120" className="absolute left-3 top-3 h-20 w-20 opacity-40 sm:h-28 sm:w-28" fill="none" stroke="currentColor">
        <g strokeWidth="0.9">
          <circle cx="60" cy="60" r="10" />
          <circle cx="60" cy="24" r="10" />
          <circle cx="60" cy="96" r="10" />
          <circle cx="24" cy="60" r="10" />
          <circle cx="96" cy="60" r="10" />
          <path d="M60 34l8 18-8 18-8-18z" opacity="0.6" />
        </g>
      </svg>
      <svg viewBox="0 0 120 120" className="absolute bottom-3 right-3 h-20 w-20 rotate-180 opacity-40 sm:h-28 sm:w-28" fill="none" stroke="currentColor">
        <g strokeWidth="0.9">
          <circle cx="60" cy="60" r="10" />
          <circle cx="60" cy="24" r="10" />
          <circle cx="60" cy="96" r="10" />
          <circle cx="24" cy="60" r="10" />
          <circle cx="96" cy="60" r="10" />
          <path d="M60 34l8 18-8 18-8-18z" opacity="0.6" />
        </g>
      </svg>
    </>
  );
}

function Gold() {
  return (
    <>
      <div className="absolute inset-3 border border-current opacity-25 sm:inset-5" />
      <div className="absolute inset-5 border border-current opacity-10 sm:inset-8" />
      <DecoCorner className="absolute left-3 top-3 h-14 w-14 opacity-50 sm:h-20 sm:w-20" />
      <DecoCorner className="absolute right-3 top-3 h-14 w-14 rotate-90 opacity-50 sm:h-20 sm:w-20" />
      <DecoCorner className="absolute bottom-3 right-3 h-14 w-14 rotate-180 opacity-50 sm:h-20 sm:w-20" />
      <DecoCorner className="absolute bottom-3 left-3 h-14 w-14 -rotate-90 opacity-50 sm:h-20 sm:w-20" />
      <svg viewBox="0 0 200 60" className="absolute left-1/2 top-6 h-10 w-44 -translate-x-1/2 opacity-50" fill="none" stroke="currentColor">
        <path d="M0 30h70M130 30h70" strokeWidth="0.8" />
        <path d="M100 16l10 14-10 14-10-14z" strokeWidth="0.8" />
        <circle cx="100" cy="30" r="3" fill="currentColor" stroke="none" />
      </svg>
      <svg viewBox="0 0 200 60" className="absolute bottom-6 left-1/2 h-10 w-44 -translate-x-1/2 rotate-180 opacity-50" fill="none" stroke="currentColor">
        <path d="M0 30h70M130 30h70" strokeWidth="0.8" />
        <path d="M100 16l10 14-10 14-10-14z" strokeWidth="0.8" />
        <circle cx="100" cy="30" r="3" fill="currentColor" stroke="none" />
      </svg>
    </>
  );
}

function Marble() {
  return (
    <>
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-current opacity-[0.05] blur-3xl" />
      <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-current opacity-[0.06] blur-3xl" />
      <div className="absolute left-1/3 top-1/2 h-56 w-56 rounded-full bg-current opacity-[0.04] blur-3xl" />
    </>
  );
}

function Arabesque() {
  return (
    <>
      <svg viewBox="0 0 200 260" className="absolute left-1/2 top-6 h-48 w-40 -translate-x-1/2 opacity-30" fill="none" stroke="currentColor">
        <path d="M10 250V90C10 40 50 10 100 10s90 30 90 80v160" strokeWidth="1" />
        <path d="M26 250V96c0-42 33-70 74-70s74 28 74 70v154" strokeWidth="0.7" opacity="0.7" />
      </svg>
      <svg viewBox="0 0 80 80" className="absolute bottom-4 left-4 h-16 w-16 opacity-30" fill="none" stroke="currentColor">
        <g strokeWidth="0.8">
          {[0, 45, 90, 135].map((angle) => (
            <rect key={angle} x="26" y="26" width="28" height="28" transform={`rotate(${angle} 40 40)`} />
          ))}
        </g>
      </svg>
      <svg viewBox="0 0 80 80" className="absolute bottom-4 right-4 h-16 w-16 rotate-45 opacity-30" fill="none" stroke="currentColor">
        <g strokeWidth="0.8">
          {[0, 45, 90, 135].map((angle) => (
            <rect key={angle} x="26" y="26" width="28" height="28" transform={`rotate(${angle} 40 40)`} />
          ))}
        </g>
      </svg>
    </>
  );
}

function Tropical() {
  return (
    <>
      <svg viewBox="0 0 200 200" className="absolute -left-12 -top-10 h-64 w-64 -rotate-12 opacity-35" fill="currentColor">
        <path d="M100 10c30 30 40 90 20 150-30-20-45-60-45-100 0-20 10-40 25-50z" opacity="0.5" />
        <path d="M100 10c-25 30-35 90-15 150 25-25 35-70 30-110-2-18-8-32-15-40z" opacity="0.3" />
      </svg>
      <svg viewBox="0 0 200 200" className="absolute -bottom-14 -right-14 h-72 w-72 rotate-12 opacity-35" fill="currentColor">
        <path d="M100 10c30 30 40 90 20 150-30-20-45-60-45-100 0-20 10-40 25-50z" opacity="0.5" />
        <path d="M100 10c-25 30-35 90-15 150 25-25 35-70 30-110-2-18-8-32-15-40z" opacity="0.3" />
      </svg>
    </>
  );
}

function Geometric() {
  return (
    <>
      <div className="pattern-weave absolute inset-0 opacity-60" />
      <div className="absolute left-1/2 top-4 h-4 w-40 -translate-x-1/2 opacity-40">
        <svg viewBox="0 0 160 16" className="h-full w-full" fill="currentColor">
          {[0, 20, 40, 60, 80, 100, 120, 140].map((x) => (
            <path key={x} d={`M${x} 0l10 8-10 8-10-8z`} opacity="0.6" />
          ))}
        </svg>
      </div>
      <div className="absolute bottom-4 left-1/2 h-4 w-40 -translate-x-1/2 rotate-180 opacity-40">
        <svg viewBox="0 0 160 16" className="h-full w-full" fill="currentColor">
          {[0, 20, 40, 60, 80, 100, 120, 140].map((x) => (
            <path key={x} d={`M${x} 0l10 8-10 8-10-8z`} opacity="0.6" />
          ))}
        </svg>
      </div>
      <div className="absolute inset-x-6 top-12 border-t border-current opacity-20" />
      <DecoCorner className="absolute left-2 top-2 h-12 w-12 opacity-40 sm:h-16 sm:w-16" />
      <DecoCorner className="absolute bottom-2 right-2 h-12 w-12 rotate-180 opacity-40 sm:h-16 sm:w-16" />
    </>
  );
}

function Sakura() {
  const petals = [
    { left: "8%", top: "12%", size: 26, rotate: 12 },
    { left: "82%", top: "18%", size: 20, rotate: -20 },
    { left: "18%", top: "68%", size: 22, rotate: 40 },
    { left: "72%", top: "78%", size: 30, rotate: -8 },
    { left: "46%", top: "6%", size: 16, rotate: 25 },
    { left: "88%", top: "52%", size: 18, rotate: 60 },
  ];
  return (
    <>
      {petals.map((petal, index) => (
        <svg
          key={index}
          viewBox="0 0 40 40"
          className="absolute opacity-30"
          style={{
            left: petal.left,
            top: petal.top,
            width: petal.size * 2,
            height: petal.size * 2,
            transform: `rotate(${petal.rotate}deg)`,
          }}
          fill="currentColor"
        >
          <path d="M20 4c7 6 11 12 11 18a11 11 0 11-22 0c0-6 4-12 11-18z" />
        </svg>
      ))}
      <SakuraBranch className="absolute -left-6 -top-8 h-44 w-64 opacity-40" />
      <div className="absolute -right-16 top-1/3 h-56 w-56 rounded-full bg-current opacity-[0.05] blur-3xl" />
    </>
  );
}

function Cinematic() {
  return (
    <>
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]" />
    </>
  );
}
