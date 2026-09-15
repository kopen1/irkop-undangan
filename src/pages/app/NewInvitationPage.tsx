import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, LockKeyhole, Palette } from "lucide-react";
import {
  countInvitationsForPlan,
  createInvitation,
  getFreePlan,
  listPlanThemes,
  listThemes,
  slugAvailable,
} from "../../lib/api";
import { APP_URL } from "../../lib/supabase";
import type { PlanRow, ThemeRow } from "../../lib/types";
import { RESERVED_SLUGS } from "../../lib/constants";
import { cn, isReservedSlug, randomSuffix, slugify } from "../../lib/utils";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { Button } from "../../components/ui/Button";
import { FieldWrapper, Input } from "../../components/ui/Field";
import { PageLoader } from "../../components/ui/Spinner";

export default function NewInvitationPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [themes, setThemes] = useState<ThemeRow[]>([]);
  const [plan, setPlan] = useState<PlanRow | null>(null);
  const [allowedThemeIds, setAllowedThemeIds] = useState<Set<string>>(new Set());
  const [usedCount, setUsedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [groomName, setGroomName] = useState("");
  const [brideName, setBrideName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [themeId, setThemeId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [themeRows, freePlan, links] = await Promise.all([
          listThemes(true),
          getFreePlan(),
          listPlanThemes(),
        ]);
        if (!active) return;
        setThemes(themeRows);
        setPlan(freePlan);
        const allowed = new Set(
          links.filter((link) => link.plan_id === freePlan.id).map((link) => link.theme_id),
        );
        setAllowedThemeIds(allowed);
        const available = themeRows.filter((theme) => allowed.has(theme.id));
        setThemeId((available[0] ?? themeRows[0])?.id ?? "");
        if (user) setUsedCount(await countInvitationsForPlan(user.id, freePlan.id));
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [toast, user]);

  const suggestedSlug = useMemo(() => {
    const base = slugify(`${groomName} ${brideName}`) || "undangan";
    return `${base.slice(0, 40)}-${randomSuffix(4)}`;
  }, [groomName, brideName]);

  useEffect(() => {
    if (!slugTouched) setSlug(suggestedSlug);
  }, [suggestedSlug, slugTouched]);

  const availableThemes = useMemo(
    () => themes.filter((theme) => allowedThemeIds.has(theme.id) || allowedThemeIds.size === 0),
    [themes, allowedThemeIds],
  );

  const validateSlug = (value: string): string | null => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      return "Slug hanya boleh huruf kecil, angka, dan tanda hubung.";
    }
    if (value.length < 3) return "Slug minimal 3 karakter.";
    if (isReservedSlug(value)) return "Slug ini dipakai sistem, pilih yang lain.";
    return null;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !plan) return;

    const slugError = validateSlug(slug);
    if (slugError) {
      toast.error(slugError);
      return;
    }
    if (!themeId) {
      toast.error("Pilih tema terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    try {
      const available = await slugAvailable(slug);
      if (!available) {
        toast.error("Slug sudah dipakai undangan lain. Coba yang lain.");
        return;
      }
      const created = await createInvitation({
        ownerId: user.id,
        slug,
        planId: plan.id,
        themeId,
        groomName: groomName.trim(),
        brideName: brideName.trim(),
        eventDate: eventDate || null,
      });
      toast.success("Undangan dibuat. Lanjut isi detailnya.");
      navigate(`/app/invitations/${created.id}`, { replace: true });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader label="Menyiapkan..." />;

  const quota = plan?.max_invitations ?? 1;
  const quotaReached = usedCount >= quota;

  if (quotaReached) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>

        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-center gap-3">
            <LockKeyhole className="h-6 w-6 text-amber-600" />
            <h1 className="font-display text-xl font-semibold text-amber-900">
              Kuota plan {plan?.name ?? "Free"} sudah habis
            </h1>
          </div>
          <p className="mt-3 text-sm text-amber-900/80">
            Plan {plan?.name ?? "Free"} hanya untuk {quota} undangan, dan kamu sudah memakai{" "}
            {usedCount}. Upgrade plan untuk membuat undangan berikutnya.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/app/pricing">
              <Button>Lihat pilihan plan</Button>
            </Link>
            <Link to="/app">
              <Button variant="outline">Kembali ke dashboard</Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-amber-900/70">
            Upgrade plan dari tab <strong>Plan</strong> di undangan yang sudah ada, atau hubungi
            admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/app"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>

      <h1 className="mt-4 font-display text-2xl font-semibold text-slate-900">Buat undangan baru</h1>
      <p className="mt-1 text-sm text-slate-500">
        Isi info dasar dulu. Konten lengkap bisa kamu tambahkan setelah ini.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label="Nama mempelai pria" required>
            <Input
              required
              value={groomName}
              onChange={(event) => setGroomName(event.target.value)}
              placeholder="Budi"
            />
          </FieldWrapper>
          <FieldWrapper label="Nama mempelai wanita" required>
            <Input
              required
              value={brideName}
              onChange={(event) => setBrideName(event.target.value)}
              placeholder="Ani"
            />
          </FieldWrapper>
        </div>

        <FieldWrapper label="Tanggal acara">
          <Input
            type="date"
            value={eventDate}
            onChange={(event) => setEventDate(event.target.value)}
          />
        </FieldWrapper>

        <FieldWrapper
          label="Link undangan"
          hint={`Tamu akan membuka ${APP_URL}/${slug || "..."}`}
          error={slug ? validateSlug(slug) ?? undefined : undefined}
          required
        >
          <Input
            required
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugify(event.target.value));
            }}
            placeholder="budi-ani-x7f2"
          />
        </FieldWrapper>

        {plan ? (
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
            Plan aktif: <strong>{plan.name}</strong> · kuota {usedCount}/{quota} undangan · maks{" "}
            {plan.max_guests} tamu, {plan.max_photos} foto, aktif {plan.active_duration_days} hari.
          </div>
        ) : null}

        <FieldWrapper label="Tema" required>
          <div className="grid gap-3 sm:grid-cols-3">
            {availableThemes.map((theme) => (
              <button
                type="button"
                key={theme.id}
                onClick={() => setThemeId(theme.id)}
                className={cn(
                  "relative rounded-xl border p-4 text-left transition",
                  themeId === theme.id
                    ? "border-slate-900 ring-2 ring-slate-900/10"
                    : "border-slate-200 hover:border-slate-400",
                )}
              >
                {themeId === theme.id ? (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                ) : null}
                <Palette className="h-5 w-5 text-rose-500" />
                <p className="mt-2 text-sm font-medium text-slate-800">{theme.name}</p>
                <p className="text-xs capitalize text-slate-400">{theme.category ?? "tema"}</p>
              </button>
            ))}
          </div>
        </FieldWrapper>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Slug tidak boleh sama dengan kata sistem ({[...RESERVED_SLUGS].slice(0, 6).join(", ")}, …).
        </div>

        <div className="flex justify-end gap-2">
          <Link to="/app">
            <Button type="button" variant="outline">
              Batal
            </Button>
          </Link>
          <Button type="submit" loading={submitting} disabled={Boolean(validateSlug(slug))}>
            Buat undangan
          </Button>
        </div>
      </form>
    </div>
  );
}
