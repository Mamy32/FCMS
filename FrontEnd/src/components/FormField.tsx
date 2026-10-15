import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

const FormField = ({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">{label}</Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export default FormField;
