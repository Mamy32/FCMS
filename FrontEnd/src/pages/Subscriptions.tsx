import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { API_URL } from "@/api";
interface Subscription {
  id: string;
  member: {
    firstName: string;
    lastName: string;
  };
  plan: {
    planName: string;
  };
  startDate: string;
  endDate: string;
  status: string;
}

const Subscriptions = () => {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({
    memberId: "",
    planId: "",
    startDate: "",
    endDate: "",
  });

  // ✅ FETCH DATA
  useEffect(() => {
    fetch(`${API_URL}/subscriptions`)
      .then(res => res.json())
      .then(setSubs);

    fetch(`${API_URL}/members`)
      .then(res => res.json())
      .then(setMembers);

    fetch(`${API_URL}/plans`)
      .then(res => res.json())
      .then(setPlans);
  }, []);

  // ✅ CREATE SUBSCRIPTION
  const handleAdd = async () => {
    if (!form.memberId || !form.planId || !form.startDate || !form.endDate) {
      toast.error("Please fill in all fields");
      return;
    }

    const res = await fetch(`${API_URL}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const newSub = await res.json();

    // 🔥 re-fetch for correct relations
    const updated = await fetch(`${API_URL}/subscriptions`)
      .then(res => res.json());

    setSubs(updated);

    setForm({
      memberId: "",
      planId: "",
      startDate: "",
      endDate: "",
    });

    setDialogOpen(false);

    toast.success("Subscription created 🎉");
  };

  const columns = [
    { key: "id", header: "ID" },
    {
      key: "member",
      header: "Member",
      render: (item: Subscription) =>
        `${item.member.firstName} ${item.member.lastName}`,
    },
    {
      key: "plan",
      header: "Plan",
      render: (item: Subscription) => item.plan.planName,
    },
    { key: "startDate", header: "Start Date" },
    { key: "endDate", header: "End Date" },
    {
      key: "status",
      header: "Status",
      render: (item: Subscription) => (
        <Badge variant={item.status === "Active" ? "default" : "secondary"}>
          {item.status}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        description="Manage member subscriptions"
        actionLabel="Add Subscription"
        onAction={() => setDialogOpen(true)}
      />

      <DataTable columns={columns} data={subs} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subscription</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">

            {/* MEMBER */}
            <div>
              <Label>Member</Label>
              <Select onValueChange={(v) => setForm({ ...form, memberId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.firstName} {m.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* PLAN */}
            <div>
              <Label>Plan</Label>
              <Select onValueChange={(v) => setForm({ ...form, planId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.planName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* DATES */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            <Button onClick={handleAdd} className="w-full">
              Create Subscription
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subscriptions;