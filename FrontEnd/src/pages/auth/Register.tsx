import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormField from "@/components/FormField";
import { useAuth } from "@/context/AuthContext";
import AuthShell from "./AuthShell";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [pendingMessage, setPendingMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) return setError("Password must be at least 8 characters");
    if (form.password !== form.confirm) return setError("Passwords do not match");

    setSubmitting(true);
    try {
      const result = await register(form.name, form.email, form.password);
      if (result.pending) setPendingMessage(result.message || "Waiting for approval");
      else navigate("/", { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (pendingMessage) {
    return (
      <AuthShell title="Almost there" subtitle="Your account was created.">
        <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p>{pendingMessage} Ask the gym owner or an admin to approve you under “Staff accounts”.</p>
        </div>
        <Button asChild variant="outline" className="mt-6 h-11 w-full">
          <Link to="/login">Back to sign in</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="The first account becomes the gym owner. Staff accounts need owner approval."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}
        <FormField label="Full name">
          <Input required autoComplete="name" className="h-11" value={form.name} onChange={set("name")} />
        </FormField>
        <FormField label="Email">
          <Input type="email" required autoComplete="email" className="h-11" value={form.email} onChange={set("email")} />
        </FormField>
        <FormField label="Password" hint="At least 8 characters">
          <Input type="password" required autoComplete="new-password" className="h-11" value={form.password} onChange={set("password")} />
        </FormField>
        <FormField label="Confirm password">
          <Input type="password" required autoComplete="new-password" className="h-11" value={form.confirm} onChange={set("confirm")} />
        </FormField>
        <Button type="submit" className="h-11 w-full text-base" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
};

export default Register;
