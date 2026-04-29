import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Shield } from "lucide-react";
import { adminCall, adminToken } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await (await import("@/integrations/supabase/client")).supabase.functions.invoke("admin", {
        body: { action: "login", username, password },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      adminToken.set(data.token);
      toast({ title: "Welcome, admin" });
      navigate("/admin/panel");
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-6 safe-top safe-bottom">
      <form onSubmit={submit} className="w-full max-w-md glass rounded-3xl p-8 shadow-card">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
          <Shield className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-extrabold text-center mb-1">Admin Panel</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">Restricted area</p>

        <label className="block text-xs font-bold uppercase tracking-wider mb-1">Username</label>
        <Input value={username} onChange={(e) => setUsername(e.target.value)} className="h-12 mb-4" autoComplete="username" />

        <label className="block text-xs font-bold uppercase tracking-wider mb-1">Password</label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 mb-6" autoComplete="current-password" />

        <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent">
          <Lock className="w-4 h-4" /> {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
};

export default AdminLogin;
