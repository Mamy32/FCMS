import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, Wallet, ScanLine, AlertTriangle, ArrowRight } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { api } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { daysUntil, formatDate, formatIDR, formatIDRShort, fullName } from "@/lib/format";
import type { Member, Payment, Subscription } from "@/types";

interface DashboardData {
  totals: {
    members: number;
    activeMembers: number;
    trainers: number;
    classes: number;
    checkInsToday: number;
    revenueThisMonth: number;
    revenueLastMonth: number;
    attendanceRate: number;
  };
  revenueByMonth: { month: string; revenue: number }[];
  checkInsByDay: { day: string; count: number }[];
  expiringSoon: Subscription[];
  recentMembers: Member[];
  recentPayments: Payment[];
}

const monthLabel = (ym: string) =>
  new Date(`${ym}-01T00:00:00`).toLocaleDateString("en-GB", { month: "short" });
const dayLabel = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const Card = ({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) => (
  <div className="rounded-xl border bg-card p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-semibold">{title}</h2>
      {action}
    </div>
    {children}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["/dashboard"],
    queryFn: () => api<DashboardData>("/dashboard"),
    refetchInterval: 60_000,
  });

  const t = data?.totals;
  const revenueTrend =
    t && t.revenueLastMonth > 0
      ? Math.round(((t.revenueThisMonth - t.revenueLastMonth) / t.revenueLastMonth) * 100)
      : null;

  const hour = Number(new Date().toLocaleString("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Jakarta" }));
  const greeting = hour < 11 ? "Good morning" : hour < 15 ? "Good afternoon" : hour < 19 ? "Good evening" : "Good night";

  if (error) {
    return <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-destructive">{(error as Error).message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            {greeting}, {user?.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-muted-foreground">Here's what's happening at the gym today.</p>
        </div>
        <Button asChild className="h-10 gap-2 px-4">
          <Link to="/check-in">
            <ScanLine className="h-4 w-4" /> Check in a member
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading || !t ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[120px] rounded-xl" />)
        ) : (
          <>
            <StatCard title="Active members" value={t.activeMembers} icon={UserCheck} hint={`of ${t.members} total members`} />
            <StatCard title="Check-ins today" value={t.checkInsToday} icon={ScanLine} hint="visits since midnight" />
            <StatCard title="Revenue this month" value={formatIDRShort(t.revenueThisMonth)} icon={Wallet} trend={revenueTrend} hint="vs last month" />
            <StatCard title="Class attendance" value={`${t.attendanceRate}%`} icon={Users} hint={`${t.classes} classes · ${t.trainers} trainers`} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card title="Revenue — last 6 months">
            {isLoading ? (
              <Skeleton className="h-[260px]" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data?.revenueByMonth} margin={{ left: 0, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tickFormatter={monthLabel} tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickFormatter={(v) => formatIDRShort(v).replace("Rp ", "")} tickLine={false} axisLine={false} fontSize={12} width={56} />
                  <Tooltip formatter={(v) => [formatIDR(Number(v)), "Revenue"]} labelFormatter={(l) => monthLabel(String(l))} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card title="Check-ins — last 14 days">
            {isLoading ? (
              <Skeleton className="h-[260px]" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data?.checkInsByDay} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tickFormatter={dayLabel} tickLine={false} axisLine={false} fontSize={11} interval={2} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip formatter={(v) => [v, "Check-ins"]} labelFormatter={(l) => dayLabel(String(l))} cursor={{ fill: "hsl(var(--muted))" }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      </div>

      <Card
        title="Memberships expiring in the next 7 days"
        action={
          <Link to="/subscriptions" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        }
      >
        {isLoading ? (
          <Skeleton className="h-20" />
        ) : data?.expiringSoon.length ? (
          <div className="divide-y">
            {data.expiringSoon.map((s) => {
              const days = daysUntil(s.endDate);
              return (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <div>
                      <p className="font-medium">{fullName(s.member)}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.plan.planName} · {s.member.phone || s.member.email}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status="Expiring soon" label={days <= 0 ? "Ends today" : `Ends in ${days} day${days > 1 ? "s" : ""}`} />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">No memberships expiring this week. 🎉</p>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 font-semibold">Newest members</h2>
          <DataTable
            loading={isLoading}
            data={data?.recentMembers || []}
            columns={[
              { key: "name", header: "Name", render: (m: Member) => fullName(m) },
              { key: "joinDate", header: "Joined", render: (m: Member) => formatDate(m.joinDate) },
              { key: "status", header: "Status", render: (m: Member) => <StatusBadge status={m.status} /> },
            ]}
          />
        </div>
        <div>
          <h2 className="mb-3 font-semibold">Latest payments</h2>
          <DataTable
            loading={isLoading}
            data={data?.recentPayments || []}
            columns={[
              { key: "member", header: "Member", render: (p: Payment) => fullName(p.member) },
              { key: "amount", header: "Amount", render: (p: Payment) => formatIDR(p.amount) },
              { key: "method", header: "Method" },
              { key: "date", header: "Date", render: (p: Payment) => formatDate(p.date) },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
