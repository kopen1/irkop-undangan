import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listPlanThemes, listPlans, listThemes } from "../../lib/api";
import type { PlanRow, ThemeRow } from "../../lib/types";
import { PlanCards } from "../../components/plans/PlanCards";
import { Button } from "../../components/ui/Button";
import { PageLoader } from "../../components/ui/Spinner";

export default function DashboardPricing() {
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [themes, setThemes] = useState<ThemeRow[]>([]);
  const [planThemes, setPlanThemes] = useState<Array<{ plan_id: string; theme_id: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listPlans(true), listThemes(true), listPlanThemes()])
      .then(([planRows, themeRows, links]) => {
        setPlans(planRows);
        setThemes(themeRows);
        setPlanThemes(links);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader label="Memuat paket..." />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-900">Harga & Plan</h1>
      <p className="mt-1 text-sm text-slate-500">
        Semua fitur gratis di fase awal. Upgrade plan per undangan dari tab Plan.
      </p>

      <div className="mt-6">
        <PlanCards
          plans={plans}
          themes={themes}
          planThemes={planThemes}
          renderCta={() => (
            <Link to="/app">
              <Button variant="outline" className="w-full">
                Kelola undangan
              </Button>
            </Link>
          )}
        />
      </div>
    </div>
  );
}
