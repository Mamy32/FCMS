import { useState, type FormEvent } from "react";
import { Check, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import ConfirmDialog from "@/components/ConfirmDialog";
import FormField from "@/components/FormField";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useApiMutation, useList } from "@/hooks/useApi";
import { formatDate, formatDateTime } from "@/lib/format";
import type { User } from "@/types";

const roleLabel = { OWNER: "Owner", ADMIN: "Admin", STAFF: "Staff" };
const emptyForm = { name: "", email: "", password: "", role: "STAFF" };

const Staff = () => {
  const { user: me } = useAuth();
  const { data: users = [], isLoading, error } = useList<User>("/users");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const create = useApiMutation((body: typeof form) => ({ path: "/users", method: "POST", body }), {
    invalidate: ["/users"],
    success: "Staff account created",
  });
  const update = useApiMutation(
    ({ id, ...body }: { id: string; role?: string; status?: string }) => ({ path: `/users/${id}`, method: "PATCH", body }),
    { invalidate: ["/users"], success: "Account updated" }
  );
  const remove = useApiMutation((id: string) => ({ path: `/users/${id}`, method: "DELETE" }), {
    invalidate: ["/users"],
    success: "Account removed",
  });

  const pending = users.filter((u) => u.status === "PENDING").length;
  // Only the owner manages admins; nobody edits the owner or themselves here.
  const canManage = (u: User) => u.id !== me?.id && u.role !== "OWNER" && (u.role !== "ADMIN" || me?.role === "OWNER");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate(form, {
      onSuccess: () => {
        setDialogOpen(false);
        setForm(emptyForm);
      },
    });
  };

  return (
    <div>
      <PageHeader
        title="Staff accounts"
        description={pending ? `${pending} account${pending > 1 ? "s" : ""} waiting for approval` : "Who can sign in to this dashboard"}
        actionLabel="Add staff"
        onAction={() => setDialogOpen(true)}
      />

      <DataTable
        loading={isLoading}
        error={error}
        data={users}
        columns={[
          {
            key: "name",
            header: "Name",
            render: (u: User) => (
              <div>
                <p className="font-medium">{u.name}{u.id === me?.id && <span className="text-muted-foreground"> (you)</span>}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
            ),
          },
          {
            key: "role",
            header: "Role",
            render: (u: User) =>
              canManage(u) && me?.role === "OWNER" ? (
                <Select value={u.role} onValueChange={(role) => update.mutate({ id: u.id, role })}>
                  <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                roleLabel[u.role]
              ),
          },
          { key: "status", header: "Status", render: (u: User) => <StatusBadge status={u.status} /> },
          { key: "createdAt", header: "Created", render: (u: User) => formatDate(u.createdAt) },
          { key: "lastLoginAt", header: "Last sign-in", render: (u: User) => (u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Never") },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (u: User) =>
              canManage(u) && (
                <div className="flex justify-end gap-2">
                  {u.status === "PENDING" && (
                    <Button className="h-8 gap-1 px-3" onClick={() => update.mutate({ id: u.id, status: "ACTIVE" })}>
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                  )}
                  {u.status === "ACTIVE" && (
                    <Button variant="outline" className="h-8 px-3" onClick={() => update.mutate({ id: u.id, status: "DISABLED" })}>
                      Disable
                    </Button>
                  )}
                  {u.status === "DISABLED" && (
                    <Button variant="outline" className="h-8 px-3" onClick={() => update.mutate({ id: u.id, status: "ACTIVE" })}>
                      Enable
                    </Button>
                  )}
                  <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(u)} aria-label="Delete">
                    <Trash2 />
                  </Button>
                </div>
              ),
          },
        ]}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add staff account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            <FormField label="Full name">
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </FormField>
            <FormField label="Email">
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </FormField>
            <FormField label="Temporary password" hint="At least 8 characters. Ask them to change it after signing in.">
              <Input type="text" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </FormField>
            {me?.role === "OWNER" && (
              <FormField label="Role" hint="Admins can manage plans, prices, trainers and delete records.">
                <Select value={form.role} onValueChange={(role) => setForm({ ...form, role })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAFF">Staff (front desk)</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            )}
            <Button type="submit" className="h-10 w-full" disabled={create.isPending}>
              {create.isPending ? "Creating..." : "Create account"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove account?"
        description={`${deleteTarget?.name} will no longer be able to sign in.`}
        loading={remove.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
      />
    </div>
  );
};

export default Staff;
