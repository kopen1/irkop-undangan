import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Eye } from "lucide-react";
import { THEMES, type ThemeCategory, type ThemeTokens } from "../../lib/theme-tokens";
import { cn } from "../../lib/utils";

type Filter = "semua" | ThemeCategory;

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: "semua", label: "Semua tema" },
  { key: "basic", label: "Basic" },
  { key: "eksklusif", label: "Eksklusif" },
];

export function ThemeGallery({
  showFilter = true,
  limit,
  className,
}: {
  showFilter?: boolean;
  limit?: number;
  className?: string;
}) {
  const [filter, setFilter] = useState<Filter>("semua");

  const themes = useMemo(() => {
    const list = filter === "semua" ? THEMES : THEMES.filter((t) => t.category === filter);
    return limit ? list.slice(0, limit) : list;
  }, [filter, limit]);

  return (
    <div className={className}>
      {showFilter ? (
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                filter === item.key
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-600 hover:border-slate-400",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {themes.map((theme) => (
          <ThemeCard key={theme.key} theme={theme} />
        ))}
      </div>
    </div>
  );
}

function ThemeCard({ theme }: { theme: ThemeTokens }) {
  const { preview } = theme;
  const locked = theme.category === "eksklusif";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-xl"
        style={{ background: preview.bg }}
      >
        <div
          className="absolute inset-3 rounded-lg border"
          style={{ borderColor: preview.accent, opacity: 0.35 }}
        />
        <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
          <p
            className="text-[9px] uppercase tracking-[0.35em]"
            style={{ color: preview.muted }}
          >
            Undangan
          </p>
          <p
            className="mt-3 text-lg font-semibold leading-tight"
            style={{ color: preview.text, fontFamily: theme.heading }}
          >
            Ahmad
            <span className="mx-1.5 opacity-60">&amp;</span>
            Siti
          </p>
          <span
            className="my-3 block h-px w-12"
            style={{ background: preview.accent }}
          />
          <p className="text-[10px]" style={{ color: preview.muted }}>
            12 Desember 2026
          </p>
        </div>
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            locked ? "bg-black/70 text-amber-300" : "bg-black/45 text-white",
          )}
        >
          {locked ? "Eksklusif" : "Basic"}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-3">
        <h3 className="text-sm font-semibold text-slate-900" style={{ fontFamily: theme.heading }}>
          {theme.name}
        </h3>
        <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500">{theme.tagline}</p>

        <Link
          to={`/demo/${theme.key}`}
          className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
        >
          <Eye className="h-3.5 w-3.5" />
          Lihat demo
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
