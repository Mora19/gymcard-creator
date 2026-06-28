import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, Tag } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Admin Login · GymTag" }] }),
  component: AuthPage,
});

const ALLOWED_SIGNUP_EMAIL = "moritz.kloesters@gmail.com";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    if (mode === "signup") {
      if (normalizedEmail !== ALLOWED_SIGNUP_EMAIL) {
        setLoading(false);
        toast.error("Registrierung ist für diese E-Mail nicht freigeschaltet.");
        return;
      }
      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Account erstellt. Bitte einloggen.");
      setMode("login");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Eingeloggt");
    navigate({ to: "/admin" });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <Toaster theme="dark" position="top-center" richColors />
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6">
        <Link to="/" className="mb-6 inline-flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-brand text-brand-foreground">
            <Tag className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-bold uppercase">GymTag · Admin</span>
        </Link>
        <h1 className="font-display text-2xl font-black uppercase">
          {mode === "login" ? "Login" : "Registrieren"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Nur für berechtigte Admins.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">E-Mail</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 bg-background" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Passwort</Label>
            <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 bg-background" />
          </div>
          <Button type="submit" disabled={loading} className="h-11 w-full bg-brand font-bold uppercase text-brand-foreground hover:bg-brand/90">
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Bitte warten…</>
            ) : mode === "login" ? (
              "Einloggen"
            ) : (
              "Account erstellen"
            )}
          </Button>
        </form>
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-4 w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          {mode === "login" ? "Noch kein Account? Registrieren" : "Schon ein Account? Einloggen"}
        </button>
      </div>
    </div>
  );
}
