import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { listPlans, listPlanThemes, listThemes } from "../lib/api";
import type { PlanRow, ThemeRow } from "../lib/types";
import { PlanCards } from "../components/plans/PlanCards";
import { PageLoader } from "../components/ui/Spinner";

export default function PricingPage() {
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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Coba gratis
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            Paket yang tumbuh bersama kebutuhanmu
          </h1>
          <p className="mt-3 text-slate-600">
            Saat ini semua fitur dibuka gratis. Struktur paket sudah siap kalau nanti kami
            mengaktifkan paket berbayar.
          </p>
        </div>

        <div className="mt-10">
          {loading ? (
            <PageLoader label="Memuat paket..." />
          ) : (
            <PlanCards
              plans={plans}
              themes={themes}
              planThemes={planThemes}
              renderCta={() => (
                <Link
                  to="/register"
                  className="block w-full rounded-lg bg-slate-900 py-2.5 text-center text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Mulai gratis
                </Link>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}
