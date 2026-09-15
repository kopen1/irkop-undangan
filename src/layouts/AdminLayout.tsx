import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Layers,
  LayoutDashboard,
  LogOut,
  Palette,
  Shield,
  Users,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../lib/utils";

const ADMIN_NAV = [
  { to: "/admin", label: "Ringkasan", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Verifikasi Order", icon: BadgeCheck, end: false },
  { to: "/admin/users", label: "Pengguna", icon: Users, end: false },
  { to: "/admin/themes", label: "Tema", icon: Palette, end: false },
  { to: "/admin/plans", label: "Plan", icon: Layers, end: false },
];

export function AdminLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-800 bg-slate-900 text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-rose-400" />
            <Link to="/admin" className="flex items-baseline gap-2">
              <span className="font-display text-lg font-semibold">Invite</span>
              <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-rose-300">
                Admin
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-300 sm:block">{profile?.full_name || "Admin"}</span>
            <Link
              to="/app"
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-slate-800"
            >
              Dashboard user
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-rose-300 transition hover:bg-rose-500/10"
            >
              <LogOut className="h-3.5 w-3.5" /> Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {ADMIN_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:bg-white/60 hover:text-slate-900",
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 pb-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
