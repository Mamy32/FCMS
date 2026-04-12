import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";
import { API_URL } from "@/api";
interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  joinDate: string;
  status: string;
}

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);

  // 🔥 PRO STATES
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  // ✅ FETCH
  useEffect(() => {
    fetch(`${API_URL}/members`)
      .then((res) => res.json())
      .then(setMembers);
  }, []);

  // 🔍 FILTER
  const filteredMembers = members.filter((m) =>
    `${m.firstName} ${m.lastName} ${m.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ✅ ADD
  const handleAdd = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: "Active" }),
      });

      const newMember = await res.json();
      setMembers((prev) => [...prev, newMember]);

      resetForm();
      toast.success("Member added 🎉");
    } catch {
      toast.error("Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  // ✅ EDIT
  const handleEdit = (member: Member) => {
    setEditing(member);
    setForm({
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone,
      email: member.email,
    });
    setDialogOpen(true);
  };

  // ✅ UPDATE
  const handleUpdate = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/members/${editing?.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const updated = await res.json();

      setMembers((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );

      resetForm();
      toast.success("Updated ✏️");
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ CONFIRM DELETE
  const confirmDelete = async () => {
    if (!deleteId) return;

    await fetch(`${API_URL}/members/${deleteId}`, {
      method: "DELETE",
    });

    setMembers((prev) => prev.filter((m) => m.id !== deleteId));
    setDeleteId(null);

    toast.success("Deleted 🗑️");
  };

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
    });
    setEditing(null);
    setDialogOpen(false);
  };

  const columns = [
    {
      key: "index",
      header: "ID",
      render: (_: any, index: number) => index + 1,
    },
    { key: "firstName", header: "First Name" },
    { key: "lastName", header: "Last Name" },
    { key: "phone", header: "Phone" },
    { key: "email", header: "Email" },

    {
      key: "joinDate",
      header: "Join Date",
      render: (item: Member) => formatDate(item.joinDate),
    },

    {
      key: "status",
      header: "Status",
      render: (item: Member) => (
        <Badge variant={item.status === "Active" ? "default" : "secondary"}>
          {item.status}
        </Badge>
      ),
    },

    {
      key: "actions",
      header: "Actions",
      render: (item: Member) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleEdit(item)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setDeleteId(item.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Members"
        description="Manage gym members"
        actionLabel="Add Member"
        onAction={() => {
          setEditing(null);
          setDialogOpen(true);
        }}
      />

      {/* 🔍 SEARCH */}
      <Input
        placeholder="Search members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      <DataTable columns={columns} data={filteredMembers} />

      {/* ADD / EDIT MODAL */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Member" : "Add New Member"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="First Name"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
              />
              <Input
                placeholder="Last Name"
                value={form.lastName}
                onChange={(e) =>
                  setForm({ ...form, lastName: e.target.value })
                }
              />
            </div>

            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />

            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <Button
              onClick={editing ? handleUpdate : handleAdd}
              disabled={loading}
              className="w-full"
            >
              {loading
                ? "Processing..."
                : editing
                ? "Update Member"
                : "Add Member"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
//dd
      {/* 🗑️ DELETE CONFIRM MODAL */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>

          <p>Are you sure you want to delete this member?</p>

          <div className="flex gap-2 mt-4">
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Members;