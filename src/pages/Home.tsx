import { useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { LEVELS } from "@/data/levels";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Flame, Trophy } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const currentLevel = LEVELS[0];

  return (
    <div className="px-6 pt-10 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{t("welcome")}</p>
          <h1 className="text-2xl font-extrabold">{email ? email.split("@")[0] : "Learner"} 👋</h1>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
          <Sparkles className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* Streak / progress */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-muted-foreground">{t("streak")}</span>
          </div>
          <p className="text-2xl font-extrabold">7 <span className="text-sm font-medium text-muted-foreground">days</span></p>
        </div>
        <div className="glass rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-secondary" />
            <span className="text-xs font-semibold text-muted-foreground">{t("progress")}</span>
          </div>
          <p className="text-2xl font-extrabold">A1</p>
        </div>
      </div>

      {/* Hero CTA */}
      <button
        onClick={() => navigate(`/app/level/${currentLevel.code}`)}
        className="w-full text-left rounded-3xl p-6 mb-6 gradient-hero text-primary-foreground shadow-glow relative overflow-hidden"
      >
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute right-4 top-4 text-5xl">{currentLevel.emoji}</div>
        <p className="text-xs uppercase tracking-widest opacity-80 font-semibold mb-2">{t("startLesson")}</p>
        <h2 className="text-3xl font-extrabold mb-1">Level {currentLevel.code}</h2>
        <p className="text-sm opacity-90">{currentLevel.description}</p>
      </button>

      {/* Quick links */}
      <h3 className="text-lg font-bold mb-3">{t("chooseLevel")}</h3>
      <div className="grid grid-cols-1 gap-3">
        {LEVELS.map((lvl) => (
          <button
            key={lvl.code}
            onClick={() => navigate(`/app/level/${lvl.code}`)}
            className="glass rounded-2xl p-4 flex items-center gap-4 shadow-soft hover:scale-[1.01] transition-transform text-left"
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${lvl.gradient} flex items-center justify-center text-2xl shadow-glow`}>
              {lvl.emoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold">{lvl.code}</p>
                {!lvl.free && <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-bold">PRO</span>}
              </div>
              <p className="text-xs text-muted-foreground">{lvl.name}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;
