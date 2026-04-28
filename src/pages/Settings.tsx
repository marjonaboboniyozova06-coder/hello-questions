import { useNavigate } from "react-router-dom";
import { Moon, Sun, Globe, Info, LogOut, ChevronRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n, LangCode } from "@/contexts/I18nContext";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

const APP_VERSION = "1.0.0";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useI18n();

  const langs: { code: LangCode; label: string; flag: string }[] = [
    { code: "uz", label: "O'zbek", flag: "🇺🇿" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
  ];

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="px-6 pt-10 pb-6">
      <h1 className="text-3xl font-extrabold mb-6">{t("settings")}</h1>

      {/* Appearance */}
      <Section title={t("appearance")}>
        <div className="glass rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                {theme === "dark" ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-accent" />}
              </div>
              <div>
                <p className="font-semibold text-sm">{theme === "dark" ? t("dark") : t("light")}</p>
                <p className="text-xs text-muted-foreground">Theme mode</p>
              </div>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>
        </div>
      </Section>

      {/* Language */}
      <Section title={t("language")}>
        <div className="glass rounded-2xl p-2 shadow-soft space-y-1">
          {langs.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                lang === l.code
                  ? "bg-gradient-to-r from-primary/15 to-secondary/15"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{l.flag}</span>
                <span className="font-semibold text-sm">{l.label}</span>
              </div>
              {lang === l.code && (
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-primary to-secondary" />
              )}
            </button>
          ))}
        </div>
      </Section>

      {/* About */}
      <Section title={t("about")}>
        <div className="glass rounded-2xl p-4 shadow-soft">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t("aboutText")}</p>
          </div>
          <div className="border-t border-border pt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-semibold">{t("version")}</span>
            <span className="text-xs font-bold">{APP_VERSION}</span>
          </div>
        </div>
      </Section>

      <button
        onClick={logout}
        className="w-full glass rounded-2xl p-4 shadow-soft flex items-center gap-3 text-destructive"
      >
        <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
          <LogOut className="w-5 h-5" />
        </div>
        <span className="font-semibold text-sm flex-1 text-left">{t("logout")}</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">{title}</p>
    {children}
  </div>
);

export default Settings;
