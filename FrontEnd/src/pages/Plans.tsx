import { useState, type FormEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ConfirmDialog from "@/components/ConfirmDialog";
import FormField from "@/components/FormField";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useApiMutation, useList } from "@/hooks/useApi";
import { formatIDR } from "@/lib/format";
import type { Plan } from "@/types";

const emptyForm = { planName: "", price: "", durationMonths: "1" };

const Plans = () => {
  const { isAdmin } = useAuth();
  const { data: plans = [], isLoading, error } = useList<Plan>("/plans");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);

  const save = useApiMutation(
    (body: { planName: string; price: number; durationMonths: number }) =>
      editing ? { path: `/plans/${editing.id}`, method: "PUT", body } : { path: "/plans", method: "POST", body },
    { invalidate: ["/plans"], success: editing ? "Plan updated" : "Plan created" }
  );
  const remove = useApiMutation((id: string) => ({ path: `/plans/${id}`, method: "DELETE" }), {
    invalidate: ["/plans"],
    success: "Plan deleted",
  });

  const openForm = (plan: Plan | null) => {
    setEditing(plan);
    setForm(plan ? { planName: plan.planName, price: String(plan.price), durationMonths: String(plan.durationMonths) } : emptyForm);
    setDialogOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate(
      { planName: form.planName, price: Number(form.price), durationMonths: Number(form.durationMonths) },
      { onSuccess: () => setDialogOpen(false) }
    );
  };

  return (
    <div>
      <PageHeader
        title="Membership plans"
        description={isAdmin ? "Set the packages and prices you sell" : "Packages available at the gym"}
        actionLabel={isAdmin ? "Add plan" : undefined}
        onAction={() => openForm(null)}
      />

      {error && <p className="text-destructive">{(error as Error).message}</p>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)
          : plans.map((plan) => (
              <div key={plan.id} className="flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold">{plan.planName}</h3>
                  {isAdmin && (
                    <div className="-mr-2 -mt-1 flex">
                      <Button size="icon-sm" variant="ghost" onClick={() => openForm(plan)} aria-label="Edit"><Pencil /></Button>
                      <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(plan)} aria-label="Delete"><Trash2 /></Button>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-2xl font-bold text-primary">{formatIDR(plan.price)}</p>
                <p className="text-sm text-muted-foreground">
                  for {plan.durationMonths} month{plan.durationMonths > 1 ? "s" : ""}
                  {plan.durationMonths > 1 && ` · ${formatIDR(Math.round(plan.price / plan.durationMonths))}/mo`}
                </p>
                <p className="mt-auto pt-4 text-xs text-muted-foreground">
                  {plan._count?.subscriptions ?? 0} subscription{plan._count?.subscriptions === 1 ? "" : "s"} sold
                </p>
              </div>
            ))}
        {!isLoading && plans.length === 0 && (
          <p className="col-span-full rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            No plans yet.{isAdmin && " Create your first membership package."}
          </p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit plan" : "New plan"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            <FormField label="Plan name">
              <Input required placeholder="e.g. Monthly, Student, Annual" value={form.planName} onChange={(e) => setForm({ ...form, planName: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Price (Rp)" hint={form.price ? formatIDR(Number(form.price)) : undefined}>
                <Input type="number" required min={0} step={1000} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </FormField>
              <FormField label="Duration (months)">
                <Input type="number" required min={1} max={60} value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: e.target.value })} />
              </FormField>
            </div>
            <Button type="submit" disabled={save.isPending} className="h-10 w-full">
              {save.isPending ? "Saving..." : editing ? "Save changes" : "Create plan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete plan?"
        description={`"${deleteTarget?.planName}" will be removed. Plans that were already sold cannot be deleted.`}
        loading={remove.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
      />
    </div>
  );
};

export default Plans;
