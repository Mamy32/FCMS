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
const Payments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({
    memberId: "",
    amount: "",
    method: "",
    date: "",
  });

  // ✅ FETCH
  useEffect(() => {
    fetch(`${API_URL}/payments`)
      .then(res => res.json())
      .then(setPayments);

    fetch(`${API_URL}/members`)
      .then(res => res.json())
      .then(setMembers);
  }, []);

  // ✅ CREATE
  const handleAdd = async () => {
    if (!form.memberId || !form.amount || !form.method || !form.date) {
      toast.error("Fill all fields");
      return;
    }

    await fetch(`${API_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const updated = await fetch(`${API_URL}/payments`)
      .then(res => res.json());

    setPayments(updated);

    setDialogOpen(false);

    toast.success("Payment recorded 💰");
  };

  const columns = [
    { key: "id", header: "ID" },
    {
      key: "member",
      header: "Member",
      render: (item: any) =>
        `${item.member.firstName} ${item.member.lastName}`,
    },
    { key: "amount", header: "Amount" },
    { key: "method", header: "Method" },
    { key: "date", header: "Date" },
    {
      key: "status",
      header: "Status",
      render: (item: any) => (
        <Badge>{item.status}</Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Track member payments"
        actionLabel="Add Payment"
        onAction={() => setDialogOpen(true)}
      />

      <DataTable columns={columns} data={payments} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">

            {/* MEMBER */}
            <Select onValueChange={(v) => setForm({ ...form, memberId: v })}>
              <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.firstName} {m.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Amount"
              type="number"
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />

            <Select onValueChange={(v) => setForm({ ...form, method: v })}>
              <SelectTrigger><SelectValue placeholder="Payment method" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="Transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            <Button onClick={handleAdd}>Save Payment</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payments;