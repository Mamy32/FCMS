import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { API_URL } from "@/api";
interface Trainer {
  id: string;
  trainerName: string;
  specialization: string;
  classCount: number;
}

const Trainers = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    trainerName: "",
    specialization: "",
  });

  // ✅ FETCH
  useEffect(() => {
    fetch(`${API_URL}/trainers`)
      .then(res => res.json())
      .then(setTrainers);
  }, []);

  // ✅ CREATE
  const handleAdd = async () => {
    if (!form.trainerName || !form.specialization) {
      toast.error("Please fill in all fields");
      return;
    }

    const res = await fetch(`${API_URL}/trainers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trainerName: form.trainerName,
        specialization: form.specialization,
        classCount: 0,
      }),
    });

    const newTrainer = await res.json();

    setTrainers(prev => [...prev, newTrainer]);

    setForm({
      trainerName: "",
      specialization: "",
    });

    setDialogOpen(false);

    toast.success("Trainer added 🎉");
  };

  const columns = [
    { key: "id", header: "ID" },
    { key: "trainerName", header: "Name" },
    { key: "specialization", header: "Specialization" },
    { key: "classCount", header: "Classes Assigned" },
  ];

  return (
    <div>
      <PageHeader
        title="Trainers"
        description="Manage fitness trainers"
        actionLabel="Add Trainer"
        onAction={() => setDialogOpen(true)}
      />

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {trainers.map((t) => (
          <div key={t.id} className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <span className="text-lg font-bold text-primary">
                {t.trainerName[0]}
              </span>
            </div>

            <h3 className="font-semibold text-card-foreground">
              {t.trainerName}
            </h3>

            <p className="text-sm text-muted-foreground">
              {t.specialization}
            </p>

            <p className="text-xs text-muted-foreground mt-2">
              {t.classCount} classes
            </p>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={trainers} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Trainer</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label>Name</Label>
              <Input
                value={form.trainerName}
                onChange={(e) =>
                  setForm({ ...form, trainerName: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Specialization</Label>
              <Input
                value={form.specialization}
                onChange={(e) =>
                  setForm({ ...form, specialization: e.target.value })
                }
              />
            </div>

            <Button onClick={handleAdd} className="w-full">
              Add Trainer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Trainers;