import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Dumbbell,
  CalendarDays,
  ClipboardCheck,
  Wallet,
  Activity,
  ScanLine,
  ShieldCheck,
  Repeat,
} from "lucide-react";
import { GYM_NAME } from "@/api";
import { useAuth } from "@/context/AuthContext";

const sections = [
  {
    label: "Front desk",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/check-in", icon: ScanLine, label: "Check-in" },
      { to: "/members", icon: Users, label: "Members" },
    ],
  },
  {
    label: "Memberships",
    items: [
      { to: "/subscriptions", icon: Repeat, label: "Subscriptions" },
      { to: "/payments", icon: Wallet, label: "Payments" },
      { to: "/plans", icon: CreditCard, label: "Plans" },
    ],
  },
  {
    label: "Programs",
    items: [
      { to: "/classes", icon: CalendarDays, label: "Classes" },
      { to: "/attendance", icon: ClipboardCheck, label: "Attendance" },
      { to: "/trainers", icon: Dumbbell, label: "Trainers" },
    ],
  },
];

const AppSidebar = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { isAdmin } = useAuth();
  const all = isAdmin
    ? [...sections, { label: "Admin", items: [{ to: "/staff", icon: ShieldCheck, label: "Staff accounts" }] }]
    : sections;

  return (
    <div className="sidebar-gradient flex h-full w-64 flex-col">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Activity className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-white">{GYM_NAME}</h1>
          <p className="text-xs text-sidebar-foreground">Gym Management</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {all.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`
                  }
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-4">
        <p className="text-center text-xs text-sidebar-foreground">© {new Date().getFullYear()} {GYM_NAME}</p>
      </div>
    </div>
  );
};

export default AppSidebar;
