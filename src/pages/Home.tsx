import { useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { useLevels, useProgress, computeUnlocked } from "@/hooks/useContent";
import { Lock, CheckCircle2, Sparkles, Flame, Trophy } from "lucide-react";

const GRADIENTS: Record<string, string> = {
  A1: "from-emerald-400 to-teal-600",
  A2: "from-sky-400 to-indigo-600",
  B1: "from-violet-400 to-fuchsia-600",
  B2: "from-amber-400 to-orange-600",
  C1: "from-rose-400 to-red-600",
};

const Home = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { levels } = useLevels();
  const { passed } = useProgress();

  const unlocked = computeUnlocked(levels, passed);
  const currentLevel = levels.find((l) => unlocked[l.code] && !passed.has(l.code)) || levels[0];

  return (
    <div className="px-6 pt-10 pb-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{t("welcome")}</p>
          <h1 className="text-2xl font-extrabold">Learner 👋</h1>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
          <Sparkles className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-muted-foreground">{t("streak")}</span>
          </div>
          <p className="text-2xl font-extrabold">{passed.size} <span className="text-sm font-medium text-muted-foreground">passed</span></p>
        </div>
        <div className="glass rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-secondary" />
            <span className="text-xs font-semibold text-muted-foreground">{t("progress")}</span>
          </div>
          <p className="text-2xl font-extrabold">{currentLevel?.code ?? "—"}</p>
        </div>
      </div>

      {currentLevel && (
        <button
          onClick={() => navigate(`/app/level/${currentLevel.code}`)}
          className="w-full text-left rounded-3xl p-6 mb-6 gradient-hero text-primary-foreground shadow-glow relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
          <p className="text-xs uppercase tracking-widest opacity-80 font-semibold mb-2">{t("startLesson")}</p>
          <h2 className="text-3xl font-extrabold mb-1">Level {currentLevel.code}</h2>
          <p className="text-sm opacity-90">{currentLevel.description}</p>
        </button>
      )}

      <h3 className="text-lg font-bold mb-3">{t("chooseLevel")}</h3>
      <div className="grid grid-cols-1 gap-3">
        {levels.map((lvl) => {
          const isOpen = unlocked[lvl.code];
          const isPassed = passed.has(lvl.code);
          return (
            <button
              key={lvl.code}
              onClick={() => isOpen && navigate(`/app/level/${lvl.code}`)}
              disabled={!isOpen}
              className={`glass rounded-2xl p-4 flex items-center gap-4 shadow-soft text-left transition-transform ${
                isOpen ? "hover:scale-[1.01]" : "opacity-60"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${
                  GRADIENTS[lvl.code] ?? "from-primary to-secondary"
                } flex items-center justify-center text-2xl font-extrabold text-white shadow-glow`}
              >
                {lvl.code}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold">{lvl.title}</p>
                  {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
                <p className="text-xs text-muted-foreground">{lvl.description}</p>
              </div>
              {!isOpen && <Lock className="w-4 h-4 text-muted-foreground" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
