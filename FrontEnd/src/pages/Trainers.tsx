import { useState, type FormEvent } from "react";
import { Pencil, Phone, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ConfirmDialog from "@/components/ConfirmDialog";
import FormField from "@/components/FormField";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useApiMutation, useList } from "@/hooks/useApi";
import type { Trainer } from "@/types";

const emptyForm = { trainerName: "", specialization: "", phone: "" };

const Trainers = () => {
  const { isAdmin } = useAuth();
  const { data: trainers = [], isLoading, error } = useList<Trainer>("/trainers");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Trainer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Trainer | null>(null);

  const save = useApiMutation(
    (body: typeof form) =>
      editing ? { path: `/trainers/${editing.id}`, method: "PUT", body } : { path: "/trainers", method: "POST", body },
    { invalidate: ["/trainers", "/classes"], success: editing ? "Trainer updated" : "Trainer added" }
  );
  const remove = useApiMutation((id: string) => ({ path: `/trainers/${id}`, method: "DELETE" }), {
    invalidate: ["/trainers", "/classes"],
    success: "Trainer removed",
  });

  const openForm = (t: Trainer | null) => {
    setEditing(t);
    setForm(t ? { trainerName: t.trainerName, specialization: t.specialization, phone: t.phone || "" } : emptyForm);
    setDialogOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate(form, { onSuccess: () => setDialogOpen(false) });
  };

  return (
    <div>
      <PageHeader
        title="Trainers"
        description="Your coaching team and the classes they lead"
        actionLabel={isAdmin ? "Add trainer" : undefined}
        onAction={() => openForm(null)}
      />
      {error && <p className="text-destructive">{(error as Error).message}</p>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)
          : trainers.map((t) => (
              <div key={t.id} className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                      {t.trainerName.replace(/^Coach\s+/i, "")[0]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{t.trainerName}</h3>
                      <p className="text-sm text-muted-foreground">{t.specialization}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="-mr-2 flex">
                      <Button size="icon-sm" variant="ghost" onClick={() => openForm(t)} aria-label="Edit"><Pencil /></Button>
                      <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(t)} aria-label="Delete"><Trash2 /></Button>
                    </div>
                  )}
                </div>
                {t.phone && (
                  <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {t.phone}</p>
                )}
                <div className="mt-4 border-t pt-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t.classCount} class{t.classCount === 1 ? "" : "es"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {t.classes.map((c) => (
                      <span key={c.id} className="rounded-md bg-muted px-2 py-1 text-xs">{c.className}</span>
                    ))}
                    {t.classCount === 0 && <span className="text-xs text-muted-foreground">Not assigned yet</span>}
                  </div>
                </div>
              </div>
            ))}
        {!isLoading && trainers.length === 0 && (
          <p className="col-span-full rounded-xl border border-dashed p-10 text-center text-muted-foreground">No trainers yet.</p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit trainer" : "Add trainer"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            <FormField label="Name">
              <Input required value={form.trainerName} onChange={(e) => setForm({ ...form, trainerName: e.target.value })} />
            </FormField>
            <FormField label="Specialization">
              <Input required placeholder="e.g. Yoga, Strength, Boxing" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
            </FormField>
            <FormField label="Phone / WhatsApp">
              <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </FormField>
            <Button type="submit" disabled={save.isPending} className="h-10 w-full">
              {save.isPending ? "Saving..." : editing ? "Save changes" : "Add trainer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove trainer?"
        description={`${deleteTarget?.trainerName} will be removed. Their classes stay but become unassigned.`}
        loading={remove.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
      />
    </div>
  );
};

export default Trainers;
