import { useState, type FormEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import ConfirmDialog from "@/components/ConfirmDialog";
import FormField from "@/components/FormField";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useApiMutation, useList } from "@/hooks/useApi";
import type { GymClass, Trainer } from "@/types";

const NONE = "none";
const emptyForm = { className: "", schedule: "", capacity: "20", trainerId: NONE };

const Classes = () => {
  const { isAdmin } = useAuth();
  const { data: classes = [], isLoading, error } = useList<GymClass>("/classes");
  const { data: trainers = [] } = useList<Trainer>("/trainers");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GymClass | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<GymClass | null>(null);

  const save = useApiMutation(
    (body: object) =>
      editing ? { path: `/classes/${editing.id}`, method: "PUT", body } : { path: "/classes", method: "POST", body },
    { invalidate: ["/classes", "/trainers"], success: editing ? "Class updated" : "Class created" }
  );
  const remove = useApiMutation((id: string) => ({ path: `/classes/${id}`, method: "DELETE" }), {
    invalidate: ["/classes", "/trainers", "/attendance"],
    success: "Class deleted",
  });

  const openForm = (c: GymClass | null) => {
    setEditing(c);
    setForm(c ? { className: c.className, schedule: c.schedule, capacity: String(c.capacity), trainerId: c.trainerId || NONE } : emptyForm);
    setDialogOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate(
      { ...form, capacity: Number(form.capacity), trainerId: form.trainerId === NONE ? null : form.trainerId },
      { onSuccess: () => setDialogOpen(false) }
    );
  };

  return (
    <div>
      <PageHeader
        title="Classes"
        description="Group classes and their weekly schedule"
        actionLabel={isAdmin ? "Add class" : undefined}
        onAction={() => openForm(null)}
      />

      <DataTable
        loading={isLoading}
        error={error}
        data={classes}
        emptyMessage="No classes yet"
        columns={[
          { key: "className", header: "Class", render: (c: GymClass) => <span className="font-medium">{c.className}</span> },
          { key: "schedule", header: "Schedule" },
          { key: "trainer", header: "Trainer", render: (c: GymClass) => c.trainer?.trainerName || <span className="text-muted-foreground">Unassigned</span> },
          { key: "capacity", header: "Capacity", render: (c: GymClass) => `${c.capacity} people` },
          { key: "attendances", header: "Total attendance", render: (c: GymClass) => c._count?.attendances ?? 0 },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (c: GymClass) =>
              isAdmin && (
                <div className="flex justify-end gap-1">
                  <Button size="icon-sm" variant="ghost" onClick={() => openForm(c)} aria-label="Edit"><Pencil /></Button>
                  <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(c)} aria-label="Delete"><Trash2 /></Button>
                </div>
              ),
          },
        ]}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit class" : "Add class"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            <FormField label="Class name">
              <Input required value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} />
            </FormField>
            <FormField label="Schedule">
              <Input required placeholder="e.g. Mon, Wed, Fri · 18:30" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Capacity">
                <Input type="number" required min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
              </FormField>
              <FormField label="Trainer">
                <Select value={form.trainerId} onValueChange={(trainerId) => setForm({ ...form, trainerId })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Unassigned</SelectItem>
                    {trainers.map((t) => <SelectItem key={t.id} value={t.id}>{t.trainerName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <Button type="submit" disabled={save.isPending} className="h-10 w-full">
              {save.isPending ? "Saving..." : editing ? "Save changes" : "Add class"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete class?"
        description={`"${deleteTarget?.className}" and its attendance history will be removed.`}
        loading={remove.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
      />
    </div>
  );
};

export default Classes;
