import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookHeart,
  Check,
  Gift,
  Heart,
  Images,
  MessageSquareHeart,
  MousePointerClick,
  Music,
  Palette,
  PenLine,
  Send,
  ShieldCheck,
  Sparkles,
  Share2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { listPlans, listPlanThemes, listThemes } from "../lib/api";
import type { PlanRow, ThemeRow } from "../lib/types";
import { ThemeGallery } from "../components/themes/ThemeGallery";
import { PlanCards } from "../components/plans/PlanCards";
import { THEMES } from "../lib/theme-tokens";

const FEATURES = [
  {
    icon: Palette,
    title: "12 tema siap pakai",
    body: "Dari minimalis modern sampai luxury gold. Ganti tema kapan saja tanpa input ulang.",
  },
  {
    icon: Send,
    title: "Link personal per tamu",
    body: "Nama tamu muncul otomatis dari link. Cukup edit namanya, tanpa daftar tamu.",
  },
  {
    icon: Images,
    title: "Galeri foto",
    body: "Unggah momen terbaik, otomatis dikompres di perangkatmu supaya hemat kuota.",
  },
  {
    icon: BookHeart,
    title: "Ucapan & doa",
    body: "Tamu mengirim doa lewat undangan, kamu bisa menyaring mana yang tampil.",
  },
  {
    icon: Gift,
    title: "Amplop digital",
    body: "Cantumkan rekening atau e-wallet tanpa perlu membalas chat satu per satu.",
  },
  {
    icon: Music,
    title: "Musik latar",
    body: "Tempel tautan lagu favorit sebagai backsound saat tamu membuka undangan.",
  },
];

const STEPS = [
  {
    icon: MousePointerClick,
    title: "Pilih tema",
    body: "Lihat demo tiap tema dulu, lalu pilih yang paling cocok dengan acaramu.",
  },
  {
    icon: PenLine,
    title: "Isi detail",
    body: "Nama mempelai, jadwal acara, lokasi, cerita, dan galeri — semuanya dari dashboard.",
  },
  {
    icon: Share2,
    title: "Bagikan",
    body: "Kirim link ke tamu lewat WhatsApp. Nama mereka otomatis muncul di undangan.",
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [themes, setThemes] = useState<ThemeRow[]>([]);
  const [planThemes, setPlanThemes] = useState<Array<{ plan_id: string; theme_id: string }>>([]);

  useEffect(() => {
    Promise.all([listPlans(true), listThemes(true), listPlanThemes()])
      .then(([planRows, themeRows, links]) => {
        setPlans(planRows);
        setThemes(themeRows);
        setPlanThemes(links);
      })
      .catch(() => undefined);
  }, []);

  const primaryCta = user ? "/app/invitations/new" : "/register";

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 font-display text-sm font-bold text-white">
              In
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">Invite</span>
          </Link>

          <nav className="hidden items-center gap-1 text-sm md:flex">
            <a href="#tema" className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-100">
              Tema
            </a>
            <a href="#fitur" className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-100">
              Fitur
            </a>
            <a href="#harga" className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-100">
              Harga
            </a>
            <a
              href="#cara"
              className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-100"
            >
              Cara kerja
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <Link
                to="/app"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 sm:block"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Coba gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-rose-50 via-white to-white" />
        <div className="absolute inset-0 -z-10 opacity-[0.35] [background-image:linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:pb-24 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-medium text-rose-700">
              <Sparkles className="h-3.5 w-3.5" />
              Semua tema gratis di fase awal
            </span>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 text-balance sm:text-6xl">
              Undangan digital yang kamu buat sendiri, selesai dalam hitungan menit.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Pilih tema, isi cerita dan jadwal acara, lalu bagikan link personal ke setiap tamu.
              Tanpa jasa desain, tanpa antre revisi.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to={primaryCta}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 font-medium text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 sm:w-auto"
              >
                Buat undangan sekarang <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#tema"
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
              >
                Lihat {THEMES.length} tema
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
              {["Tanpa kartu kredit", "Gratis untuk undangan pertama", "Data terpisah per pengguna"].map(
                (item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: `${THEMES.length}`, label: "Tema siap pakai" },
              { value: "3", label: "Pilihan paket" },
              { value: "1 menit", label: "Bikin undangan" },
              { value: "∞", label: "Link tamu" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-5 text-center backdrop-blur"
              >
                <p className="font-display text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tema" className="scroll-mt-20 border-b border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Galeri tema</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              Coba dulu, baru pilih
            </h2>
            <p className="mt-3 text-slate-600">
              Setiap tema punya halaman demo dengan isi contoh yang lengkap. Klik salah satu untuk
              melihat tampilan aslinya di HP.
            </p>
          </div>

          <ThemeGallery className="mt-10" />

          <p className="mt-6 text-center text-xs text-slate-500">
            Ketersediaan mengikuti paket: <strong>Free</strong> 1 tema basic, <strong>Medium</strong>{" "}
            8 tema, <strong>Premium</strong> semua tema.{" "}
            <Link to="/pricing" className="font-medium text-rose-600 hover:text-rose-500">
              Lihat perbandingan
            </Link>
          </p>
        </div>
      </section>

      <section id="fitur" className="scroll-mt-20 border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Fitur</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              Semua yang dibutuhkan, tanpa ribet
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cara" className="scroll-mt-20 border-b border-slate-100 bg-slate-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">Cara kerja</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Tiga langkah, undangan siap dibagikan
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="relative rounded-2xl border border-white/10 bg-white/5 p-6">
                <span className="font-display text-4xl font-bold text-white/15">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <step.icon className="mt-3 h-6 w-6 text-rose-400" />
                <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="harga" className="scroll-mt-20 border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Harga</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              Mulai gratis, upgrade kalau perlu
            </h2>
            <p className="mt-3 text-slate-600">
              Setiap paket punya kuota undangan, jumlah tema, dan fitur yang berbeda.
            </p>
          </div>

          <div className="mt-12">
            {plans.length > 0 ? (
              <PlanCards
                plans={plans}
                themes={themes}
                planThemes={planThemes}
                renderCta={() => (
                  <Link
                    to={primaryCta}
                    className="block w-full rounded-lg bg-slate-900 py-2.5 text-center text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Mulai sekarang
                  </Link>
                )}
              />
            ) : (
              <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
            )}
          </div>

          <div className="mt-8 text-center">
            <Link to="/pricing" className="text-sm font-medium text-rose-600 hover:text-rose-500">
              Lihat perbandingan lengkap →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-white to-rose-50">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 py-20 text-center">
          <Heart className="h-8 w-8 text-rose-500" />
          <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            Mulai dari satu link, akhiri dengan kenangan
          </h2>
          <p className="max-w-xl text-slate-600">
            Gratis untuk undangan pertama. Tidak perlu kartu kredit, tidak perlu keahlian desain.
          </p>
          <Link
            to={primaryCta}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-7 py-3.5 font-medium text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-500"
          >
            Buat undangan gratis <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 font-display text-sm font-bold text-white">
                In
              </span>
              <span className="font-display text-base font-semibold">Invite</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Platform undangan digital self-service. Buat, atur, dan bagikan undanganmu sendiri.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Produk</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <a href="#tema" className="hover:text-slate-900">
                  Galeri tema
                </a>
              </li>
              <li>
                <a href="#fitur" className="hover:text-slate-900">
                  Fitur
                </a>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-slate-900">
                  Harga
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Mulai</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/register" className="hover:text-slate-900">
                  Daftar gratis
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-slate-900">
                  Masuk
                </Link>
              </li>
              <li>
                <Link to={`/demo/${THEMES[0].key}`} className="hover:text-slate-900">
                  Contoh undangan
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Keamanan</p>
            <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              Data undangan terpisah per pengguna dengan aturan akses ketat.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row">
            <p>© {new Date().getFullYear()} Invite. Dibuat untuk memudahkan.</p>
            <p className="inline-flex items-center gap-1.5">
              <MessageSquareHeart className="h-3.5 w-3.5" /> invite.irkop.eu.org
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
