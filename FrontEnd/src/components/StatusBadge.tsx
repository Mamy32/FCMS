import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  green: "bg-success/10 text-success border-success/25",
  amber: "bg-warning/10 text-warning border-warning/30",
  red: "bg-destructive/10 text-destructive border-destructive/25",
  blue: "bg-info/10 text-info border-info/25",
  gray: "bg-muted text-muted-foreground border-border",
};

const statusTone: Record<string, keyof typeof tones> = {
  Active: "green",
  ACTIVE: "green",
  Completed: "green",
  Present: "green",
  Upcoming: "blue",
  Pending: "amber",
  PENDING: "amber",
  Frozen: "blue",
  Late: "amber",
  "Expiring soon": "amber",
  Expired: "red",
  Absent: "red",
  Cancelled: "gray",
  Refunded: "gray",
  Inactive: "gray",
  DISABLED: "gray",
  "No plan": "gray",
};

const StatusBadge = ({ status, label, className }: { status: string; label?: string; className?: string }) => (
  <span
    className={cn(
      "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
      tones[statusTone[status] || "gray"],
      className
    )}
  >
    {label ?? (status === status.toUpperCase() ? status[0] + status.slice(1).toLowerCase() : status)}
  </span>
);

export default StatusBadge;
