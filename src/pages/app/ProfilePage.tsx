import { useState } from "react";
import { Save } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { FieldWrapper, Input } from "../../components/ui/Field";

export default function ProfilePage() {
  const { profile, user, updateProfile } = useAuth();
  const toast = useToast();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ full_name: fullName.trim(), phone: phone.trim() });
      toast.success("Profil diperbarui.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-2xl font-semibold text-slate-900">Profil</h1>
      <p className="mt-1 text-sm text-slate-500">Info ini dipakai untuk kebutuhan akunmu.</p>

      <Card className="mt-6">
        <CardHeader title="Data akun" />
        <CardBody className="space-y-4">
          <FieldWrapper label="Email">
            <Input value={user?.email ?? ""} disabled />
          </FieldWrapper>
          <FieldWrapper label="Nama lengkap">
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="Nomor WhatsApp">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </FieldWrapper>
          <div className="flex justify-end">
            <Button onClick={handleSave} loading={saving}>
              <Save className="h-4 w-4" /> Simpan
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
