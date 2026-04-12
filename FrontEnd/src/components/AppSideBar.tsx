import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Dumbbell,
  CalendarDays,
  ClipboardCheck,
  DollarSign,
  Activity,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/members", icon: Users, label: "Members" },
  { to: "/plans", icon: CreditCard, label: "Plans" },
  { to: "/subscriptions", icon: ClipboardCheck, label: "Subscriptions" },
  { to: "/trainers", icon: Dumbbell, label: "Trainers" },
  { to: "/classes", icon: CalendarDays, label: "Classes" },
  { to: "/attendance", icon: ClipboardCheck, label: "Attendance" },
  { to: "/payments", icon: DollarSign, label: "Payments" },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="sidebar-gradient w-64 min-h-screen flex flex-col fixed left-0 top-0 z-30">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <Activity className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-sidebar-accent-foreground">FCMS</h1>
          <p className="text-xs text-sidebar-foreground">Fitness Center</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground text-center">© 2026 FCMS</p>
      </div>
    </aside>
  );
};

export default AppSidebar;
