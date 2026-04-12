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

const Attendance = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({
    memberId: "",
    classId: "",
    date: "",
    status: "Present",
  });

  // ✅ FETCH
  useEffect(() => {
    fetch(`${API_URL}/attendance`)
      .then(res => res.json())
      .then(setRecords);

    fetch(`${API_URL}/members`)
      .then(res => res.json())
      .then(setMembers);

    fetch(`${API_URL}/classes`)
      .then(res => res.json())
      .then(setClasses);
  }, []);

  // ✅ CREATE
  const handleAdd = async () => {
    if (!form.memberId || !form.classId || !form.date) {
      toast.error("Fill all fields");
      return;
    }

    await fetch(`${API_URL}/attendance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    // 🔥 re-fetch updated data
    const updated = await fetch(`${API_URL}/attendance`)
      .then(res => res.json());

    setRecords(updated);

    setDialogOpen(false);

    toast.success("Attendance recorded 🎉");
  };

  const columns = [
    { key: "id", header: "ID" },
    {
      key: "member",
      header: "Member",
      render: (item: any) =>
        `${item.member.firstName} ${item.member.lastName}`,
    },
    {
      key: "class",
      header: "Class",
      render: (item: any) => item.class.className,
    },
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
        title="Attendance"
        description="Track class attendance"
        actionLabel="Add Record"
        onAction={() => setDialogOpen(true)}
      />

      <DataTable columns={columns} data={records} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Attendance</DialogTitle>
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

            {/* CLASS */}
            <Select onValueChange={(v) => setForm({ ...form, classId: v })}>
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input type="date" onChange={(e) => setForm({ ...form, date: e.target.value })} />

            <Select onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleAdd}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Attendance;