import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { API_URL } from "@/api";
interface Plan {
  id: string; // ✅ Prisma uses id
  planName: string;
  price: string;
  durationMonths: number;
}

const Plans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    planName: "",
    price: "",
    durationMonths: "",
  });

  // ✅ FETCH FROM DATABASE
  useEffect(() => {
    fetch(`${API_URL}/plans`)
      .then((res) => res.json())
      .then((data) => setPlans(data));
  }, []);

  // ✅ ADD PLAN (DATABASE)
  const handleAdd = async () => {
    if (!form.planName || !form.price) {
      toast.error("Please fill in all fields");
      return;
    }

    const res = await fetch(`${API_URL}/plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        planName: form.planName,
        price: `$${form.price}`, // keep same UI format
        durationMonths: parseInt(form.durationMonths) || 1,
      }),
    });

    const newPlan = await res.json();

    setPlans((prev) => [...prev, newPlan]);

    setForm({
      planName: "",
      price: "",
      durationMonths: "",
    });

    setDialogOpen(false);

    toast.success("Plan added successfully 🎉");
  };

  const columns = [
    { key: "id", header: "ID" },
    { key: "planName", header: "Plan Name" },
    { key: "price", header: "Price" },
    { key: "durationMonths", header: "Duration (Months)" },
  ];

  return (
    <div>
      <PageHeader
        title="Membership Plans"
        description="Manage available membership plans"
        actionLabel="Add Plan"
        onAction={() => setDialogOpen(true)}
      />

      {/* ✅ CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-card-foreground">
              {plan.planName}
            </h3>
            <p className="text-3xl font-bold text-primary mt-2">
              {plan.price}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {plan.durationMonths} month
              {plan.durationMonths > 1 ? "s" : ""}
            </p>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={plans} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Plan</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label>Plan Name</Label>
              <Input
                value={form.planName}
                onChange={(e) =>
                  setForm({ ...form, planName: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Price ($)</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Duration (Months)</Label>
              <Input
                type="number"
                value={form.durationMonths}
                onChange={(e) =>
                  setForm({ ...form, durationMonths: e.target.value })
                }
              />
            </div>

            <Button onClick={handleAdd} className="w-full">
              Add Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Plans;