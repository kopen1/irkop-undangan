import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAdmin, RequireAuth } from "./components/auth/RouteGuards";
import { PageLoader } from "./components/ui/Spinner";
import { SetupNotice } from "./components/SetupNotice";
import { isSupabaseConfigured } from "./lib/supabase";

const DashboardLayout = lazy(() =>
  import("./layouts/DashboardLayout").then((m) => ({ default: m.DashboardLayout })),
);
const AdminLayout = lazy(() =>
  import("./layouts/AdminLayout").then((m) => ({ default: m.AdminLayout })),
);

const LandingPage = lazy(() => import("./pages/LandingPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const DashboardHome = lazy(() => import("./pages/app/DashboardHome"));
const NewInvitationPage = lazy(() => import("./pages/app/NewInvitationPage"));
const InvitationEditor = lazy(() => import("./pages/app/InvitationEditor"));
const ProfilePage = lazy(() => import("./pages/app/ProfilePage"));
const DashboardPricing = lazy(() => import("./pages/app/DashboardPricing"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminThemes = lazy(() => import("./pages/admin/AdminThemes"));
const AdminPlans = lazy(() => import("./pages/admin/AdminPlans"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const PublicInvitation = lazy(() => import("./pages/public/PublicInvitation"));
const DemoInvitation = lazy(() => import("./pages/public/DemoInvitation"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

export default function App() {
  if (!isSupabaseConfigured) return <SetupNotice />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/app"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="invitations/new" element={<NewInvitationPage />} />
          <Route path="invitations/:id" element={<InvitationEditor />} />
          <Route path="pricing" element={<DashboardPricing />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="themes" element={<AdminThemes />} />
          <Route path="plans" element={<AdminPlans />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        <Route path="/app/*" element={<Navigate to="/app" replace />} />
        <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

        <Route path="/demo/:themeKey" element={<DemoInvitation />} />
        <Route path="/:slug" element={<PublicInvitation />} />
        <Route path="/:slug/:guestSlug" element={<PublicInvitation />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
