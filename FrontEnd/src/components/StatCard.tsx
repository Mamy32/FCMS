import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  trend?: number | null;
}

const StatCard = ({ title, value, icon: Icon, hint, trend }: StatCardProps) => {
  return (
    <div className="stat-card-gradient rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 truncate text-2xl font-bold text-card-foreground md:text-3xl">{value}</p>
          {(hint || trend != null) && (
            <p className="mt-2 text-xs text-muted-foreground">
              {trend != null && (
                <span className={`mr-1 font-semibold ${trend >= 0 ? "text-success" : "text-destructive"}`}>
                  {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
                </span>
              )}
              {hint}
            </p>
          )}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
