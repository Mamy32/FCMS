import { useState, type FormEvent } from "react";
import { Download, Search, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import ConfirmDialog from "@/components/ConfirmDialog";
import FormField from "@/components/FormField";
import MemberPicker from "@/components/MemberPicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useApiMutation, useList } from "@/hooks/useApi";
import { downloadCsv } from "@/lib/csv";
import { formatDate, formatIDR, fullName, toDateInput } from "@/lib/format";
import { PAYMENT_METHODS, type Payment } from "@/types";

const emptyForm = { memberId: "", amount: "", method: "QRIS", status: "Completed", date: toDateInput(), note: "" };

const Payments = () => {
  const { isAdmin } = useAuth();
  const { data: payments = [], isLoading, error } = useList<Payment>("/payments");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null);

  const create = useApiMutation((body: typeof form) => ({ path: "/payments", method: "POST", body }), {
    invalidate: ["/payments", "/members"],
    success: "Payment recorded",
  });
  const remove = useApiMutation((id: string) => ({ path: `/payments/${id}`, method: "DELETE" }), {
    invalidate: ["/payments", "/members"],
    success: "Payment deleted",
  });

  const filtered = payments.filter(
    (p) =>
      `${fullName(p.member)} ${p.method} ${p.note || ""}`.toLowerCase().includes(search.toLowerCase()) &&
      (!month || toDateInput(p.date).startsWith(month))
  );
  const total = filtered.filter((p) => p.status === "Completed").reduce((sum, p) => sum + p.amount, 0);

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
      <PageHeader title="Payments" description="All money received from members" actionLabel="Record payment" onAction={() => setDialogOpen(true)}>
        <Button
          variant="outline"
          className="h-9 gap-2 px-4"
          disabled={!filtered.length}
          onClick={() =>
            downloadCsv(
              `payments${month ? "-" + month : ""}.csv`,
              filtered.map((p) => ({
                Date: formatDate(p.date),
                Member: fullName(p.member),
                "Amount (IDR)": p.amount,
                Method: p.method,
                Status: p.status,
                Note: p.note || "",
              }))
            )
          }
        >
          <Download className="h-4 w-4" /> Export
        </Button>
      </PageHeader>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search member, method or note..." className="h-10 pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Input type="month" className="h-10 sm:w-48" value={month} onChange={(e) => setMonth(e.target.value)} />
        <div className="rounded-lg border bg-card px-4 py-2 text-sm">
          Total: <span className="font-semibold text-primary">{formatIDR(total)}</span>
        </div>
      </div>

      <DataTable
        loading={isLoading}
        error={error}
        data={filtered}
        emptyMessage="No payments found"
        columns={[
          { key: "date", header: "Date", render: (p: Payment) => formatDate(p.date) },
          { key: "member", header: "Member", render: (p: Payment) => <span className="font-medium">{fullName(p.member)}</span> },
          { key: "amount", header: "Amount", render: (p: Payment) => formatIDR(p.amount) },
          { key: "method", header: "Method" },
          { key: "note", header: "Note", render: (p: Payment) => <span className="text-muted-foreground">{p.note || "-"}</span> },
          { key: "status", header: "Status", render: (p: Payment) => <StatusBadge status={p.status} /> },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (p: Payment) =>
              isAdmin && (
                <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(p)} aria-label="Delete">
                  <Trash2 />
                </Button>
              ),
          },
        ]}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            <FormField label="Member">
              <MemberPicker value={form.memberId} onChange={(memberId) => setForm({ ...form, memberId })} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Amount (Rp)" hint={form.amount ? formatIDR(Number(form.amount)) : undefined}>
                <Input type="number" required min={1} step={1000} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </FormField>
              <FormField label="Date">
                <Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Method">
                <Select value={form.method} onValueChange={(method) => setForm({ ...form, method })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Status">
                <Select value={form.status} onValueChange={(status) => setForm({ ...form, status })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <FormField label="Note (optional)">
              <Input placeholder="e.g. Personal training 4 sessions" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </FormField>
            <Button type="submit" className="h-10 w-full" disabled={create.isPending || !form.memberId}>
              {create.isPending ? "Saving..." : "Save payment"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete payment?"
        description={`Remove the ${formatIDR(deleteTarget?.amount)} payment from ${fullName(deleteTarget?.member)}? This affects revenue reports.`}
        loading={remove.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
      />
    </div>
  );
};

export default Payments;
