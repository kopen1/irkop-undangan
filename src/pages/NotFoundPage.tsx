import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Compass className="h-7 w-7" />
      </div>
      <h1 className="mt-4 font-display text-3xl font-bold text-slate-900">404</h1>
      <p className="mt-2 text-sm text-slate-600">Halaman yang kamu cari tidak ada.</p>
      <Link
        to="/"
        className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Kembali ke beranda
      </Link>
    </div>
  );
}
