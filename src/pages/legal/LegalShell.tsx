import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export const LEGAL_CONTACT_EMAIL = "halo@irkop.eu.org";

export function LegalShell({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 font-display text-sm font-bold text-white">
              In
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">Invite</span>
          </Link>
          <Link to="/" className="text-sm text-slate-600 transition hover:text-slate-900">
            Kembali
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">Terakhir diperbarui: {updatedAt}</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-600">{children}</div>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          Ada pertanyaan tentang dokumen ini? Hubungi{" "}
          <a
            href={`mailto:${LEGAL_CONTACT_EMAIL}`}
            className="font-medium text-rose-600 hover:text-rose-500"
          >
            {LEGAL_CONTACT_EMAIL}
          </a>
          .
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Invite.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-slate-900">
              Kebijakan Privasi
            </Link>
            <Link to="/terms" className="hover:text-slate-900">
              Syarat &amp; Ketentuan
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
