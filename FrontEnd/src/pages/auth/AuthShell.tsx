import type { ReactNode } from "react";
import { Activity, CalendarCheck, ScanLine, Wallet } from "lucide-react";
import { GYM_NAME } from "@/api";

const highlights = [
  { icon: ScanLine, text: "Fast front-desk check-in that blocks expired memberships" },
  { icon: Wallet, text: "Payments in Rupiah — Cash, QRIS, transfer and cards" },
  { icon: CalendarCheck, text: "Classes, trainers and attendance in one place" },
];

const AuthShell = ({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) => (
  <div className="grid min-h-screen lg:grid-cols-2">
    <div className="sidebar-gradient relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
          <Activity className="h-6 w-6" />
        </div>
        <span className="text-xl font-bold">{GYM_NAME}</span>
      </div>

      <div className="relative max-w-md">
        <h2 className="text-4xl font-bold leading-tight">Run your gym from one simple dashboard.</h2>
        <ul className="mt-10 space-y-5">
          {highlights.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-4 text-sidebar-accent-foreground">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Icon className="h-[18px] w-[18px] text-primary" />
              </div>
              <span className="pt-1.5">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-sm text-sidebar-foreground">© {new Date().getFullYear()} {GYM_NAME} · Jakarta</p>
    </div>

    <div className="flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">{GYM_NAME}</span>
        </div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mb-8 mt-2 text-muted-foreground">{subtitle}</p>
        {children}
      </div>
    </div>
  </div>
);

export default AuthShell;
