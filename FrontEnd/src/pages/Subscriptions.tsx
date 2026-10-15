import { useState, type FormEvent } from "react";
import { Ban, Download, Search, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import ConfirmDialog from "@/components/ConfirmDialog";
import FormField from "@/components/FormField";
import MemberPicker from "@/components/MemberPicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useApiMutation, useList } from "@/hooks/useApi";
import { downloadCsv } from "@/lib/csv";
import { daysUntil, formatDate, formatIDR, fullName, toDateInput } from "@/lib/format";
import { PAYMENT_METHODS, type Plan, type Subscription } from "@/types";

const emptyForm = { memberId: "", planId: "", startDate: toDateInput(), recordPayment: true, paymentMethod: "QRIS" };

const Subscriptions = () => {
  const { isAdmin } = useAuth();
  const { data: subs = [], isLoading, error } = useList<Subscription>("/subscriptions");
  const { data: plans = [] } = useList<Plan>("/plans");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cancelTarget, setCancelTarget] = useState<Subscription | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null);

  const invalidate = ["/subscriptions", "/members", "/payments", "/plans"];
  const create = useApiMutation((body: typeof form) => ({ path: "/subscriptions", method: "POST", body }), {
    invalidate,
    success: "Membership activated",
  });
  const cancel = useApiMutation((id: string) => ({ path: `/subscriptions/${id}`, method: "PATCH", body: { status: "Cancelled" } }), {
    invalidate,
    success: "Subscription cancelled",
  });
  const remove = useApiMutation((id: string) => ({ path: `/subscriptions/${id}`, method: "DELETE" }), {
    invalidate,
    success: "Subscription deleted",
  });

  const plan = plans.find((p) => p.id === form.planId);
  const endPreview = plan
    ? (() => {
        const d = new Date(`${form.startDate}T00:00:00`);
        d.setMonth(d.getMonth() + plan.durationMonths);
        return formatDate(d);
      })()
    : null;

  const filtered = subs.filter((s) => {
    if (!`${fullName(s.member)} ${s.plan.planName}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === "expiring") return s.status === "Active" && daysUntil(s.endDate) <= 7;
    return statusFilter === "all" || s.status === statusFilter;
  });

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
      <PageHeader title="Subscriptions" description="Sell and renew memberships" actionLabel="New subscription" onAction={() => setDialogOpen(true)}>
        <Button
          variant="outline"
          className="h-9 gap-2 px-4"
          disabled={!filtered.length}
          onClick={() =>
            downloadCsv(
              "subscriptions.csv",
              filtered.map((s) => ({
                Member: fullName(s.member),
                Plan: s.plan.planName,
                Start: formatDate(s.startDate),
                End: formatDate(s.endDate),
                Status: s.status,
              }))
            )
          }
        >
          <Download className="h-4 w-4" /> Export
        </Button>
      </PageHeader>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search member or plan..." className="h-10 pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-10 sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="expiring">Expiring in 7 days</SelectItem>
            <SelectItem value="Upcoming">Upcoming</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        loading={isLoading}
        error={error}
        data={filtered}
        emptyMessage="No subscriptions found"
        columns={[
          { key: "member", header: "Member", render: (s: Subscription) => <span className="font-medium">{fullName(s.member)}</span> },
          { key: "plan", header: "Plan", render: (s: Subscription) => s.plan.planName },
          { key: "startDate", header: "Start", render: (s: Subscription) => formatDate(s.startDate) },
          { key: "endDate", header: "End", render: (s: Subscription) => formatDate(s.endDate) },
          {
            key: "status",
            header: "Status",
            render: (s: Subscription) => {
              const days = daysUntil(s.endDate);
              return s.status === "Active" && days <= 7 ? (
                <StatusBadge status="Expiring soon" label={`${days}d left`} />
              ) : (
                <StatusBadge status={s.status} />
              );
            },
          },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (s: Subscription) => (
              <div className="flex justify-end gap-1">
                {(s.status === "Active" || s.status === "Upcoming") && (
                  <Button size="icon-sm" variant="ghost" onClick={() => setCancelTarget(s)} aria-label="Cancel" title="Cancel membership">
                    <Ban />
                  </Button>
                )}
                {isAdmin && (
                  <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(s)} aria-label="Delete">
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
            <DialogTitle>New subscription</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            <FormField label="Member">
              <MemberPicker value={form.memberId} onChange={(memberId) => setForm({ ...form, memberId })} />
            </FormField>
            <FormField label="Plan">
              <Select value={form.planId} onValueChange={(planId) => setForm({ ...form, planId })}>
                <SelectTrigger><SelectValue placeholder="Choose a plan" /></SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.planName} — {formatIDR(p.price)} / {p.durationMonths} mo
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Start date" hint={endPreview ? `Membership valid until ${endPreview}` : undefined}>
              <Input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </FormField>

            <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox checked={form.recordPayment} onCheckedChange={(v) => setForm({ ...form, recordPayment: v === true })} />
                Record payment now{plan ? ` (${formatIDR(plan.price)})` : ""}
              </label>
              {form.recordPayment && (
                <Select value={form.paymentMethod} onValueChange={(paymentMethod) => setForm({ ...form, paymentMethod })}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Button type="submit" className="h-10 w-full" disabled={create.isPending || !form.memberId || !form.planId}>
              {create.isPending ? "Saving..." : "Activate membership"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel membership?"
        description={`${fullName(cancelTarget?.member)} will no longer be able to check in with this plan.`}
        confirmLabel="Cancel membership"
        loading={cancel.isPending}
        onCancel={() => setCancelTarget(null)}
        onConfirm={() => cancelTarget && cancel.mutate(cancelTarget.id, { onSuccess: () => setCancelTarget(null) })}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete subscription?"
        description="This removes the record entirely. Use Cancel instead if you want to keep history."
        loading={remove.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
      />
    </div>
  );
};

export default Subscriptions;
