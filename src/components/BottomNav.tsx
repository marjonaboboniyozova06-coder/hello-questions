import { NavLink } from "react-router-dom";
import { Home, BookOpen, Sparkles, Settings as SettingsIcon } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { cn } from "@/lib/utils";

export const BottomNav = () => {
  const { t } = useI18n();
  const items = [
    { to: "/app", icon: Home, label: t("home") },
    { to: "/app/levels", icon: BookOpen, label: t("lessons") },
    { to: "/app/premium", icon: Sparkles, label: t("unlock") },
    { to: "/app/settings", icon: SettingsIcon, label: t("settings") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="mx-auto max-w-md px-4 pb-3 pt-2">
        <div className="glass shadow-card rounded-3xl px-2 py-2 flex items-center justify-around">
          {items.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/app"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all min-w-[60px]",
                  isActive
                    ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-glow scale-105"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};
