import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Pencil, Search, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import ConfirmDialog from "@/components/ConfirmDialog";
import FormField from "@/components/FormField";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { useApiMutation, useList } from "@/hooks/useApi";
import { downloadCsv } from "@/lib/csv";
import { daysUntil, formatDate, formatDateTime, formatIDR, fullName } from "@/lib/format";
import type { CheckIn, Member, Payment, Subscription } from "@/types";

const emptyForm = { firstName: "", lastName: "", email: "", phone: "", status: "Active" as Member["status"] };

const membershipLabel = (m: Member) => {
  const sub = m.activeSubscription;
  if (!sub) return { status: "No plan", label: "No active plan" };
  const days = daysUntil(sub.endDate);
  if (days <= 7) return { status: "Expiring soon", label: `${sub.plan.planName} · ${days}d left` };
  return { status: "Active", label: `${sub.plan.planName} · until ${formatDate(sub.endDate)}` };
};

type MemberDetail = Member & {
  subscriptions: Omit<Subscription, "member">[];
  payments: Payment[];
  checkIns: CheckIn[];
};

const MemberProfile = ({ id, onClose }: { id: string | null; onClose: () => void }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["/members", id],
    queryFn: () => api<MemberDetail>(`/members/${id}`),
    enabled: !!id,
  });

  return (
    <Sheet open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{data ? fullName(data) : "Member"}</SheetTitle>
        </SheetHeader>
        {isLoading || !data ? (
          <div className="mt-6 space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-40" />
          </div>
        ) : (
          <div className="mt-6 space-y-6 text-sm">
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-4">
              <div><p className="text-muted-foreground">Email</p><p className="break-all">{data.email}</p></div>
              <div><p className="text-muted-foreground">Phone</p><p>{data.phone || "-"}</p></div>
              <div><p className="text-muted-foreground">Joined</p><p>{formatDate(data.joinDate)}</p></div>
              <div><p className="text-muted-foreground">Status</p><StatusBadge status={data.status} /></div>
            </div>

            <section>
              <h3 className="mb-2 font-semibold">Memberships</h3>
              {data.subscriptions.length === 0 && <p className="text-muted-foreground">No memberships yet.</p>}
              <div className="space-y-2">
                {data.subscriptions.map((s) => {
                  const expired = new Date(s.endDate) < new Date();
                  return (
                    <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{s.plan.planName}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(s.startDate)} – {formatDate(s.endDate)}</p>
                      </div>
                      <StatusBadge status={s.status === "Cancelled" ? "Cancelled" : expired ? "Expired" : "Active"} />
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h3 className="mb-2 font-semibold">Payments</h3>
              {data.payments.length === 0 && <p className="text-muted-foreground">No payments yet.</p>}
              <div className="divide-y rounded-lg border">
                {data.payments.map((p) => (
                  <div key={p.id} className="flex justify-between p-3">
                    <span>{formatDate(p.date)} · {p.method}</span>
                    <span className="font-medium">{formatIDR(p.amount)}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-2 font-semibold">Recent visits</h3>
              {data.checkIns.length === 0 && <p className="text-muted-foreground">No visits yet.</p>}
              <div className="flex flex-wrap gap-2">
                {data.checkIns.map((c) => (
                  <span key={c.id} className="rounded-md bg-muted px-2 py-1 text-xs">{formatDateTime(c.checkedAt)}</span>
                ))}
              </div>
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

const Members = () => {
  const { isAdmin } = useAuth();
  const { data: members = [], isLoading, error } = useList<Member>("/members");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  const save = useApiMutation(
    (body: typeof form) =>
      editing ? { path: `/members/${editing.id}`, method: "PUT", body } : { path: "/members", method: "POST", body },
    { invalidate: ["/members"], success: editing ? "Member updated" : "Member added" }
  );
  const remove = useApiMutation((id: string) => ({ path: `/members/${id}`, method: "DELETE" }), {
    invalidate: ["/members", "/subscriptions", "/payments", "/attendance"],
    success: "Member deleted",
  });

  const filtered = members.filter((m) => {
    const text = `${fullName(m)} ${m.email} ${m.phone || ""}`.toLowerCase();
    if (!text.includes(search.toLowerCase())) return false;
    if (filter === "active") return !!m.activeSubscription;
    if (filter === "expiring") return !!m.activeSubscription && daysUntil(m.activeSubscription.endDate) <= 7;
    if (filter === "none") return !m.activeSubscription;
    return true;
  });

  const openForm = (member: Member | null) => {
    setEditing(member);
    setForm(
      member
        ? { firstName: member.firstName, lastName: member.lastName, email: member.email, phone: member.phone || "", status: member.status }
        : emptyForm
    );
    setDialogOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate(form, { onSuccess: () => setDialogOpen(false) });
  };

  const exportCsv = () =>
    downloadCsv(
      "members.csv",
      filtered.map((m) => ({
        "First name": m.firstName,
        "Last name": m.lastName,
        Email: m.email,
        Phone: m.phone || "",
        Joined: formatDate(m.joinDate),
        Status: m.status,
        Plan: m.activeSubscription?.plan.planName || "",
        "Valid until": m.activeSubscription ? formatDate(m.activeSubscription.endDate) : "",
      }))
    );

  return (
    <div>
      <PageHeader title="Members" description="Everyone registered at your gym" actionLabel="Add member" onAction={() => openForm(null)}>
        <Button variant="outline" className="h-9 gap-2 px-4" onClick={exportCsv} disabled={!filtered.length}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </PageHeader>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, email or phone..." className="h-10 pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-10 sm:w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All members</SelectItem>
            <SelectItem value="active">With active plan</SelectItem>
            <SelectItem value="expiring">Expiring in 7 days</SelectItem>
            <SelectItem value="none">No active plan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        loading={isLoading}
        error={error}
        data={filtered}
        onRowClick={(m) => setProfileId(m.id)}
        emptyMessage={members.length ? "No members match your filters" : "No members yet — add your first member"}
        columns={[
          {
            key: "name",
            header: "Member",
            render: (m: Member) => (
              <div>
                <p className="font-medium">{fullName(m)}</p>
                <p className="text-xs text-muted-foreground">{m.email}</p>
              </div>
            ),
          },
          { key: "phone", header: "Phone", render: (m: Member) => m.phone || "-" },
          { key: "joinDate", header: "Joined", render: (m: Member) => formatDate(m.joinDate) },
          {
            key: "membership",
            header: "Membership",
            render: (m: Member) => {
              const { status, label } = membershipLabel(m);
              return <StatusBadge status={status} label={label} />;
            },
          },
          { key: "status", header: "Account", render: (m: Member) => <StatusBadge status={m.status} /> },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (m: Member) => (
              <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <Button size="icon-sm" variant="ghost" onClick={() => openForm(m)} aria-label="Edit">
                  <Pencil />
                </Button>
                {isAdmin && (
                  <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(m)} aria-label="Delete">
                    <Trash2 />
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit member" : "Add new member"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First name">
                <Input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </FormField>
              <FormField label="Last name">
                <Input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </FormField>
            </div>
            <FormField label="Email">
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </FormField>
            <FormField label="Phone / WhatsApp">
              <Input type="tel" placeholder="+62 812..." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </FormField>
            {editing && (
              <FormField label="Account status" hint="Frozen or inactive members cannot check in.">
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Member["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Frozen">Frozen</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            )}
            <Button type="submit" disabled={save.isPending} className="h-10 w-full">
              {save.isPending ? "Saving..." : editing ? "Save changes" : "Add member"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete member?"
        description={`This permanently removes ${fullName(deleteTarget)} along with their subscriptions, payments and visit history.`}
        loading={remove.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
      />

      <MemberProfile id={profileId} onClose={() => setProfileId(null)} />
    </div>
  );
};

export default Members;
