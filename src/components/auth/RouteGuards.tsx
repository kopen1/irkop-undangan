import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { PageLoader } from "../ui/Spinner";

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
  if (!user) return <Navigate to="/" replace />;
  if (profile?.role !== "admin") return <Navigate to="/app" replace />;
  return <>{children}</>;
}
