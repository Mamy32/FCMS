import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { API_URL } from "@/api";
interface ClassType {
  id: string;
  className: string;
  schedule: string;
  capacity: number;
}

const Classes = () => {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({
    className: "",
    schedule: "",
    capacity: "",
  });

  // ✅ FETCH
  useEffect(() => {
    fetch(`${API_URL}/classes`)
      .then(res => res.json())
      .then(setClasses);
  }, []);

  // ✅ CREATE
  const handleAdd = async () => {
    if (!form.className || !form.schedule) {
      toast.error("Fill all fields");
      return;
    }

    const res = await fetch(`${API_URL}/classes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        className: form.className,
        schedule: form.schedule,
        capacity: parseInt(form.capacity) || 0,
      }),
    });

    const newClass = await res.json();

    setClasses(prev => [...prev, newClass]);

    setForm({
      className: "",
      schedule: "",
      capacity: "",
    });

    setDialogOpen(false);

    toast.success("Class created 🎉");
  };

  const columns = [
    { key: "id", header: "ID" },
    { key: "className", header: "Class Name" },
    { key: "schedule", header: "Schedule" },
    { key: "capacity", header: "Capacity" },
  ];
// 🔥 REUSE THIS FOR OTHER PAGES
  return (
    <div>
      <PageHeader
        title="Classes"
        description="Manage gym classes"
        actionLabel="Add Class"
        onAction={() => setDialogOpen(true)}
      />

      <DataTable columns={columns} data={classes} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Class</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label>Class Name</Label>
              <Input
                value={form.className}
                onChange={(e) =>
                  setForm({ ...form, className: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Schedule</Label>
              <Input
                value={form.schedule}
                onChange={(e) =>
                  setForm({ ...form, schedule: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Capacity</Label>
              <Input
                type="number"
                value={form.capacity}
                onChange={(e) =>
                  setForm({ ...form, capacity: e.target.value })
                }
              />
            </div>

            <Button onClick={handleAdd} className="w-full">
              Add Class
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Classes;