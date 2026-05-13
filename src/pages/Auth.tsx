import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/contexts/I18nContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "signup">(
    params.get("mode") === "signup" ? "signup" : "login"
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/app", { replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!firstName.trim() || !lastName.trim()) {
          throw new Error(lang === "uz" ? "Ism va familiya majburiy" : "First and last name required");
        }
        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
            data: { first_name: firstName.trim(), last_name: lastName.trim(), full_name: fullName },
          },
        });
        if (error) throw error;
        // If session is returned (auto-confirm), go straight in
        if (data.session) {
          navigate("/app", { replace: true });
        } else {
          toast({ title: "✓", description: lang === "uz" ? "Akkaunt yaratildi. Endi kirishingiz mumkin." : "Account created. You can sign in now." });
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/app", { replace: true });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-mesh flex flex-col">
      <div className="mx-auto w-full max-w-md px-6 pt-12 pb-10 safe-top">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-full glass flex items-center justify-center mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>

        <h1 className="text-4xl font-extrabold mb-2">
          {mode === "login" ? t("login") : t("signup")}
        </h1>
        <p className="text-muted-foreground mb-8">{t("welcome")} 👋</p>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {lang === "uz" ? "Ism" : lang === "ru" ? "Имя" : "First name"}
                </Label>
                <Input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-14 rounded-2xl mt-1 bg-card border-border"
                  placeholder={lang === "uz" ? "Ism" : "First"}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {lang === "uz" ? "Familiya" : lang === "ru" ? "Фамилия" : "Last name"}
                </Label>
                <Input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-14 rounded-2xl mt-1 bg-card border-border"
                  placeholder={lang === "uz" ? "Familiya" : "Last"}
                />
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("email")}
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-2xl mt-1 bg-card border-border"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("password")}
            </Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 rounded-2xl mt-1 bg-card border-border"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-primary via-secondary to-accent shadow-glow"
          >
            {loading ? "..." : t("continue")}
          </Button>
        </form>

        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full text-center mt-6 text-sm text-muted-foreground"
        >
          {mode === "login" ? (
            <>Don't have an account? <span className="text-primary font-semibold">{t("signup")}</span></>
          ) : (
            <>Already have one? <span className="text-primary font-semibold">{t("login")}</span></>
          )}
        </button>
      </div>
    </div>
  );
};

export default Auth;
