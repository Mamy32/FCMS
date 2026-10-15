import { useState, type FormEvent } from "react";
import PageHeader from "@/components/PageHeader";
import FormField from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApiMutation } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Account = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const change = useApiMutation(
    (body: { currentPassword: string; newPassword: string }) => ({ path: "/auth/password", method: "PATCH", body }),
    { success: "Password updated" }
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return toast.error("New passwords do not match");
    change.mutate(
      { currentPassword: form.currentPassword, newPassword: form.newPassword },
      { onSuccess: () => setForm({ currentPassword: "", newPassword: "", confirm: "" }) }
    );
  };

  return (
    <div className="max-w-lg">
      <PageHeader title="My account" description={`${user?.name} · ${user?.email}`} />
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="font-semibold">Change password</h2>
        <FormField label="Current password">
          <Input type="password" required autoComplete="current-password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
        </FormField>
        <FormField label="New password" hint="At least 8 characters">
          <Input type="password" required minLength={8} autoComplete="new-password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
        </FormField>
        <FormField label="Confirm new password">
          <Input type="password" required autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        </FormField>
        <Button type="submit" className="h-10 px-5" disabled={change.isPending}>
          {change.isPending ? "Saving..." : "Update password"}
        </Button>
      </form>
    </div>
  );
};

export default Account;
