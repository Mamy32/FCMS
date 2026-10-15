import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import FormField from "@/components/FormField";
import MemberPicker from "@/components/MemberPicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApiMutation, useList } from "@/hooks/useApi";
import { formatDate, fullName, toDateInput } from "@/lib/format";
import type { Attendance as AttendanceType, GymClass } from "@/types";

const emptyForm = { memberId: "", classId: "", date: toDateInput(), status: "Present" };

const Attendance = () => {
  const { data: records = [], isLoading, error } = useList<AttendanceType>("/attendance");
  const { data: classes = [] } = useList<GymClass>("/classes");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [classFilter, setClassFilter] = useState("all");

  const create = useApiMutation((body: typeof form) => ({ path: "/attendance", method: "POST", body }), {
    invalidate: ["/attendance", "/classes"],
    success: "Attendance recorded",
  });
  const remove = useApiMutation((id: string) => ({ path: `/attendance/${id}`, method: "DELETE" }), {
    invalidate: ["/attendance", "/classes"],
    success: "Record removed",
  });

  const filtered = classFilter === "all" ? records : records.filter((r) => r.classId === classFilter);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Keep class and date selected so staff can quickly register the next member.
    create.mutate(form, { onSuccess: () => setForm({ ...form, memberId: "" }) });
  };

  return (
    <div>
      <PageHeader title="Class attendance" description="Who joined which class" actionLabel="Record attendance" onAction={() => setDialogOpen(true)}>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="h-9 w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All classes</SelectItem>
            {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.className}</SelectItem>)}
          </SelectContent>
        </Select>
      </PageHeader>

      <DataTable
        loading={isLoading}
        error={error}
        data={filtered}
        emptyMessage="No attendance recorded yet"
        columns={[
          { key: "date", header: "Date", render: (r: AttendanceType) => formatDate(r.date) },
          { key: "member", header: "Member", render: (r: AttendanceType) => <span className="font-medium">{fullName(r.member)}</span> },
          { key: "class", header: "Class", render: (r: AttendanceType) => r.class.className },
          { key: "status", header: "Status", render: (r: AttendanceType) => <StatusBadge status={r.status} /> },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (r: AttendanceType) => (
              <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => remove.mutate(r.id)} aria-label="Remove">
                <Trash2 />
              </Button>
            ),
          },
        ]}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record attendance</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            <FormField label="Class">
              <Select value={form.classId} onValueChange={(classId) => setForm({ ...form, classId })}>
                <SelectTrigger><SelectValue placeholder="Choose a class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.className} · {c.schedule}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Member">
              <MemberPicker value={form.memberId} onChange={(memberId) => setForm({ ...form, memberId })} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Date">
                <Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </FormField>
              <FormField label="Status">
                <Select value={form.status} onValueChange={(status) => setForm({ ...form, status })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Present">Present</SelectItem>
                    <SelectItem value="Late">Late</SelectItem>
                    <SelectItem value="Absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <Button type="submit" className="h-10 w-full" disabled={create.isPending || !form.memberId || !form.classId}>
              {create.isPending ? "Saving..." : "Save & add another"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Attendance;
