import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { Button } from "../../components/ui/Button";
import { FieldWrapper, Input } from "../../components/ui/Field";
import { GoogleSignInButton } from "../../components/auth/GoogleSignInButton";
import { AuthShell } from "./AuthShell";

export default function LoginPage() {
  const { signIn, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      toast.success("Berhasil masuk.");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Masuk ke Invite"
      subtitle="Kelola undangan digitalmu dari satu dashboard."
      footer={
        <>
          Belum punya akun?{" "}
          <Link to="/register" className="font-medium text-rose-600 hover:text-rose-500">
            Daftar gratis
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FieldWrapper label="Email" required>
          <Input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@email.com"
          />
        </FieldWrapper>
        <FieldWrapper label="Password" required>
          <Input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />
        </FieldWrapper>
        <Button type="submit" className="w-full" loading={loading}>
          Masuk
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        atau
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleSignInButton text="signin_with" />
    </AuthShell>
  );
}
