import { Database } from "lucide-react";

export function SetupNotice() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-center gap-3">
          <Database className="h-6 w-6 text-amber-600" />
          <h1 className="text-lg font-semibold text-amber-900">Supabase belum dikonfigurasi</h1>
        </div>
        <p className="mt-3 text-sm text-amber-900/80">
          Buat file <code className="rounded bg-amber-100 px-1">.env</code> di root project dan isi
          kredensial Supabase kamu, lalu restart dev server.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_APP_URL=http://localhost:5173`}
        </pre>
        <p className="mt-4 text-sm text-amber-900/80">
          Jalankan migrasi dengan <code className="rounded bg-amber-100 px-1">supabase link</code>{" "}
          lalu <code className="rounded bg-amber-100 px-1">npm run db:push</code>.
        </p>
      </div>
    </div>
  );
}
