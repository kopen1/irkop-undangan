import { Check, X } from "lucide-react";
import type { ReactNode } from "react";
import type { PlanRow, ThemeRow } from "../../lib/types";
import { formatRupiah } from "../../lib/utils";
import { cn } from "../../lib/utils";

const ALL_FEATURES: Array<{ key: string; label: string }> = [
  { key: "rsvp", label: "RSVP tamu" },
  { key: "galeri", label: "Galeri foto" },
  { key: "amplop_digital", label: "Amplop digital" },
  { key: "custom_music", label: "Musik latar custom" },
  { key: "tanpa_watermark", label: "Tanpa watermark" },
  { key: "domain_custom", label: "Domain custom" },
];

export function PlanCards({
  plans,
  themes,
  planThemes,
  renderCta,
  highlightKey = "free",
}: {
  plans: PlanRow[];
  themes: ThemeRow[];
  planThemes: Array<{ plan_id: string; theme_id: string }>;
  renderCta?: (plan: PlanRow) => ReactNode;
  highlightKey?: string;
}) {
  const themeMap = new Map(themes.map((theme) => [theme.id, theme]));
  const activePlans = plans.filter((plan) => plan.is_active);

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {activePlans.map((plan) => {
        const assigned = planThemes
          .filter((row) => row.plan_id === plan.id)
          .map((row) => themeMap.get(row.theme_id)?.name)
          .filter(Boolean) as string[];
        const features = (plan.features ?? {}) as Record<string, boolean>;

        return (
          <div
            key={plan.id}
            className={cn(
              "flex flex-col rounded-2xl border bg-white p-6",
              plan.key === highlightKey
                ? "border-rose-300 shadow-lg shadow-rose-100"
                : "border-slate-200 shadow-sm",
            )}
          >
            {plan.key === highlightKey ? (
              <span className="mb-3 inline-flex w-fit rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                Fase gratis
              </span>
            ) : null}
            <h3 className="font-display text-xl font-semibold text-slate-900">{plan.name}</h3>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {plan.price === 0 ? "Gratis" : formatRupiah(plan.price)}
              {plan.price > 0 ? (
                <span className="ml-1 text-sm font-normal text-slate-500">/undangan</span>
              ) : null}
            </p>

            <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-600">
              <PlanItem>
                {plan.max_invitations} undangan
              </PlanItem>
              <PlanItem>
                {plan.theme_quota
                  ? `${plan.theme_quota} tema pilihan`
                  : `${assigned.length || themes.length} tema tersedia`}
              </PlanItem>
              <PlanItem>Maks {plan.max_guests} tamu</PlanItem>
              <PlanItem>Maks {plan.max_photos} foto galeri</PlanItem>
              <PlanItem>Aktif {plan.active_duration_days} hari</PlanItem>
              {ALL_FEATURES.map((feature) =>
                features[feature.key] ? (
                  <PlanItem key={feature.key}>{feature.label}</PlanItem>
                ) : (
                  <MissingItem key={feature.key}>{feature.label}</MissingItem>
                ),
              )}
            </ul>

            {assigned.length ? (
              <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Tema: {assigned.join(", ")}
              </p>
            ) : null}

            {renderCta ? <div className="mt-5">{renderCta(plan)}</div> : null}
          </div>
        );
      })}
    </div>
  );
}

function PlanItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
      <span>{children}</span>
    </li>
  );
}

function MissingItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-slate-400">
      <X className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
      <span className="line-through decoration-slate-300">{children}</span>
    </li>
  );
}
