import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import { Users, CreditCard, Dumbbell, CalendarDays, DollarSign, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// 🔥 CHARTS
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { API_URL } from "@/api";
const Dashboard = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  // ✅ FETCH
  useEffect(() => {
    fetch(`${API_URL}/members`).then(res => res.json()).then(setMembers);
    fetch(`${API_URL}/payments`).then(res => res.json()).then(setPayments);
    fetch(`${API_URL}/trainers`).then(res => res.json()).then(setTrainers);
    fetch(`${API_URL}/classes`).then(res => res.json()).then(setClasses);
    fetch(`${API_URL}/attendance`).then(res => res.json()).then(setAttendance);
    fetch(`${API_URL}/subscriptions`).then(res => res.json()).then(setSubscriptions);
  }, []);

  // ✅ CALCULATIONS
  const totalMembers = members.length;
  const totalTrainers = trainers.length;
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  const attendanceRate =
    attendance.length === 0
      ? 0
      : Math.round(
          (attendance.filter((a) => a.status === "Present").length /
            attendance.length) *
            100
        );

  const expiringSubs = subscriptions.filter((s) =>
    s.endDate?.includes(new Date().getMonth() + 1)
  ).length;

  // 🔥 CHART DATA
  const revenueData = payments.map((p: any) => ({
    date: new Date(p.date).toLocaleDateString("en-GB"),
    amount: p.amount,
  }));

  const attendanceData = attendance.map((a: any) => ({
    date: new Date(a.date).toLocaleDateString("en-GB"),
    present: a.status === "Present" ? 1 : 0,
  }));

  // ✅ RECENT
  const recentMembers = members.slice(-5).reverse();
  const recentPayments = payments.slice(-5).reverse();

  const memberColumns = [
    {
      key: "index",
      header: "ID",
      render: (_: any, index: number) => index + 1,
    },
    {
      key: "name",
      header: "Name",
      render: (item: any) =>
        `${item.firstName} ${item.lastName}`,
    },
    { key: "email", header: "Email" },
    {
      key: "joinDate",
      header: "Join Date",
      render: (item: any) =>
        new Date(item.joinDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    {
      key: "status",
      header: "Status",
      render: (item: any) => (
        <Badge variant={item.status === "Active" ? "default" : "secondary"}>
          {item.status}
        </Badge>
      ),
    },
  ];

  const paymentColumns = [
    {
      key: "index",
      header: "ID",
      render: (_: any, index: number) => index + 1,
    },
    {
      key: "member",
      header: "Member",
      render: (item: any) =>
        `${item.member?.firstName} ${item.member?.lastName}`,
    },
    { key: "amount", header: "Amount" },
    {
      key: "date",
      header: "Date",
      render: (item: any) =>
        new Date(item.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    { key: "method", header: "Method" },
    {
      key: "status",
      header: "Status",
      render: (item: any) => (
        <Badge variant={item.status === "Completed" ? "default" : "secondary"}>
          {item.status}
        </Badge>
      ),
    },
  ];
// 🔥 REUSE THIS FOR OTHER PAGES
  return (
    <div>
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Fitness Center Management System
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Members" value={totalMembers} icon={Users} />
        <StatCard title="Trainers" value={totalTrainers} icon={Dumbbell} />
        <StatCard title="Revenue" value={`$${totalRevenue}`} icon={DollarSign} />
        <StatCard title="Attendance" value={`${attendanceRate}%`} icon={TrendingUp} />
      </div>

      {/* 🔥 CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue */}
        <div className="bg-card p-6 rounded-xl border">
          <h2 className="mb-4 font-semibold">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance */}
        <div className="bg-card p-6 rounded-xl border">
          <h2 className="mb-4 font-semibold">Attendance Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="present" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="mb-4 font-semibold">Recent Members</h2>
          <DataTable columns={memberColumns} data={recentMembers} />
        </div>

        <div>
          <h2 className="mb-4 font-semibold">Recent Payments</h2>
          <DataTable columns={paymentColumns} data={recentPayments} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;