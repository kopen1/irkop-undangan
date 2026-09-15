import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { PageLoader } from "../ui/Spinner";
import { EmptyState } from "../ui/EmptyState";
import { ShieldAlert } from "lucide-react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Memeriksa sesi..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <PageLoader label="Memeriksa akses..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role !== "admin") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          icon={ShieldAlert}
          title="Akses ditolak"
          description="Halaman ini khusus admin. Hubungi pemilik platform jika kamu merasa ini keliru."
        />
      </div>
    );
  }
  return <>{children}</>;
}
