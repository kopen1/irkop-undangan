import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { Button } from "../../components/ui/Button";
import { FieldWrapper, Input } from "../../components/ui/Field";
import { GoogleSignInButton } from "../../components/auth/GoogleSignInButton";
import { AuthShell } from "./AuthShell";

export default function RegisterPage() {
  const { signUp, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/app" replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 6) {
      toast.error("Password minimal 6 karakter.");
      return;
    }
    setLoading(true);
    try {
      const { needsEmailConfirm } = await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: phone.trim(),
      });
      if (needsEmailConfirm) {
        toast.info("Cek email kamu untuk konfirmasi akun, lalu masuk.");
        navigate("/login", { replace: true });
      } else {
        toast.success("Akun dibuat. Selamat datang!");
        navigate("/app", { replace: true });
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Buat akun Invite"
      subtitle="Gratis. Tidak perlu kartu kredit."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link to="/login" className="font-medium text-rose-600 hover:text-rose-500">
            Masuk
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FieldWrapper label="Nama lengkap" required>
          <Input
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Nama kamu"
          />
        </FieldWrapper>
        <FieldWrapper label="Nomor WhatsApp">
          <Input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="08xxxxxxxxxx"
          />
        </FieldWrapper>
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
        <FieldWrapper label="Password" hint="Minimal 6 karakter." required>
          <Input
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />
        </FieldWrapper>
        <Button type="submit" className="w-full" loading={loading}>
          Daftar
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        atau
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleSignInButton text="signup_with" />
    </AuthShell>
  );
}
