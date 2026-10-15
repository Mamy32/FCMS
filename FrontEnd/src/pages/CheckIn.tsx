import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Search, ScanLine, XCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/api";
import { useList } from "@/hooks/useApi";
import { daysUntil, formatDate, formatTime, fullName, toDateInput } from "@/lib/format";
import type { CheckIn as CheckInType, Member } from "@/types";

type Result = { ok: true; member: Member; message: string } | { ok: false; message: string };

const CheckIn = () => {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [date, setDate] = useState(toDateInput());

  const { data: members = [] } = useList<Member>("/members");
  const checkIns = useQuery({
    queryKey: ["/checkins", date],
    queryFn: () => api<CheckInType[]>(`/checkins?date=${date}`),
  });

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 2) return [];
    return members
      .filter((m) => `${fullName(m)} ${m.email} ${m.phone || ""}`.toLowerCase().includes(q))
      .slice(0, 6);
  }, [members, search]);

  const checkIn = useMutation({
    mutationFn: (member: Member) => api("/checkins", { method: "POST", body: { memberId: member.id } }),
    onSuccess: (_, member) => {
      const sub = member.activeSubscription;
      setResult({
        ok: true,
        member,
        message: sub ? `${sub.plan.planName} · valid until ${formatDate(sub.endDate)}` : "Membership valid",
      });
      setSearch("");
      queryClient.invalidateQueries({ queryKey: ["/checkins"] });
      queryClient.invalidateQueries({ queryKey: ["/dashboard"] });
      inputRef.current?.focus();
    },
    onError: (err: Error) => setResult({ ok: false, message: err.message }),
  });

  return (
    <div>
      <PageHeader title="Front-desk check-in" description="Search a member and check them in. Expired memberships are blocked automatically." />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                autoFocus
                placeholder="Type name, phone or email..."
                className="h-12 pl-10 text-base"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setResult(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && matches.length === 1) checkIn.mutate(matches[0]);
                }}
              />
            </div>

            {matches.length > 0 && (
              <div className="mt-3 divide-y rounded-lg border">
                {matches.map((m) => {
                  const sub = m.activeSubscription;
                  return (
                    <div key={m.id} className="flex items-center justify-between gap-3 p-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{fullName(m)}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {sub ? `${sub.plan.planName} · ${daysUntil(sub.endDate)} days left` : "No active membership"}
                        </p>
                      </div>
                      <Button className="h-9 shrink-0 gap-1.5 px-3" disabled={checkIn.isPending} onClick={() => checkIn.mutate(m)}>
                        <ScanLine className="h-4 w-4" /> Check in
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
            {search.trim().length >= 2 && matches.length === 0 && (
              <p className="mt-3 text-sm text-muted-foreground">No member matches “{search}”.</p>
            )}
          </div>

          {result && (
            <div
              className={`flex items-start gap-3 rounded-xl border p-5 ${
                result.ok ? "border-success/30 bg-success/10" : "border-destructive/30 bg-destructive/10"
              }`}
            >
              {result.ok ? (
                <CheckCircle2 className="h-8 w-8 shrink-0 text-success" />
              ) : (
                <XCircle className="h-8 w-8 shrink-0 text-destructive" />
              )}
              <div>
                <p className={`text-lg font-semibold ${result.ok ? "text-success" : "text-destructive"}`}>
                  {result.ok ? `Welcome, ${result.member.firstName}!` : "Check-in refused"}
                </p>
                <p className="text-sm text-foreground/80">{result.message}</p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-semibold">
              Visits <span className="text-muted-foreground">({checkIns.data?.length ?? 0})</span>
            </h2>
            <Input type="date" className="h-9 w-auto" value={date} max={toDateInput()} onChange={(e) => setDate(e.target.value)} />
          </div>
          <DataTable
            loading={checkIns.isLoading}
            error={checkIns.error}
            data={checkIns.data || []}
            emptyMessage="No check-ins for this day yet"
            columns={[
              { key: "time", header: "Time", render: (c: CheckInType) => formatTime(c.checkedAt) },
              { key: "member", header: "Member", render: (c: CheckInType) => fullName(c.member) },
              { key: "phone", header: "Phone", render: (c: CheckInType) => c.member.phone || "-" },
              { key: "status", header: "Status", render: (c: CheckInType) => <StatusBadge status={c.member.status} /> },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
