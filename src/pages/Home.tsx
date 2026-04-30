import { useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { useLevels, useProgress, computeUnlocked } from "@/hooks/useContent";
import { usePremium } from "@/hooks/usePremium";
import { Lock, CheckCircle2, Flame, Trophy, Crown } from "lucide-react";
import heroStudent from "@/assets/hero-student.png";

const GRADIENTS: Record<string, string> = {
  A1: "from-emerald-400 to-teal-600",
  A2: "from-sky-400 to-indigo-600",
  B1: "from-violet-400 to-fuchsia-600",
  B2: "from-amber-400 to-orange-600",
  C1: "from-rose-400 to-red-600",
};

const Home = () => {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const { levels } = useLevels();
  const { passed } = useProgress();
  const { isPremium } = usePremium();

  const unlocked = computeUnlocked(levels, passed);
  const currentLevel = levels.find((l) => unlocked[l.code] && !passed.has(l.code)) || levels[0];

  return (
    <div className="px-6 pt-10 pb-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{t("welcome")}</p>
          <h1 className="text-2xl font-extrabold text-gradient">{t("appName")}</h1>
        </div>
        {isPremium ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-glow">
            <Crown className="w-4 h-4 text-white" />
            <span className="text-xs font-extrabold text-white">PRO</span>
          </div>
        ) : (
          <button
            onClick={() => navigate("/app/premium")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass shadow-soft"
          >
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold">Premium</span>
          </button>
        )}
      </div>

      {/* Hero card with 3D character */}
      {currentLevel && (
        <button
          onClick={() => navigate(`/app/level/${currentLevel.code}`)}
          className="relative w-full text-left rounded-3xl p-6 mb-6 gradient-hero text-primary-foreground shadow-glow overflow-hidden min-h-[180px]"
        >
          <div className="absolute -right-6 -top-6 w-40 h-40 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute -bottom-4 -right-4 w-36 h-36 opacity-90">
            <img src={heroStudent} alt="" className="w-full h-full object-contain drop-shadow-2xl" />
          </div>
          <div className="relative max-w-[60%]">
            <p className="text-xs uppercase tracking-widest opacity-80 font-semibold mb-2">{t("startLesson")}</p>
            <h2 className="text-3xl font-extrabold mb-1">Level {currentLevel.code}</h2>
            <p className="text-sm opacity-90 line-clamp-2">{currentLevel.description}</p>
          </div>
        </button>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-muted-foreground">{t("streak")}</span>
          </div>
          <p className="text-2xl font-extrabold">{passed.size}<span className="text-sm font-medium text-muted-foreground">/{levels.length}</span></p>
        </div>
        <div className="glass rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-secondary" />
            <span className="text-xs font-semibold text-muted-foreground">{t("progress")}</span>
          </div>
          <p className="text-2xl font-extrabold">{currentLevel?.code ?? "—"}</p>
        </div>
      </div>

      <h3 className="text-lg font-bold mb-3">{t("chooseLevel")}</h3>
      <div className="grid grid-cols-1 gap-3">
        {levels.map((lvl) => {
          const isOpen = unlocked[lvl.code];
          const isPassed = passed.has(lvl.code);
          const requiresPremium = lvl.is_premium && !isPremium;
          const accessible = isOpen && !requiresPremium;
          return (
            <button
              key={lvl.code}
              onClick={() => accessible && navigate(`/app/level/${lvl.code}`)}
              disabled={!accessible}
              className={`glass rounded-2xl p-4 flex items-center gap-4 shadow-soft text-left transition-transform ${
                accessible ? "hover:scale-[1.01] active:scale-[0.99]" : "opacity-60"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${
                  GRADIENTS[lvl.code] ?? "from-primary to-secondary"
                } flex items-center justify-center text-2xl font-extrabold text-white shadow-glow flex-shrink-0`}
              >
                {lvl.code}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold truncate">{lvl.title}</p>
                  {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                  {lvl.is_premium && <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{lvl.description}</p>
              </div>
              {!accessible && <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {!isPremium && (
        <button
          onClick={() => navigate("/app/premium")}
          className="mt-6 w-full rounded-2xl p-4 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-white shadow-glow flex items-center gap-3"
        >
          <Crown className="w-6 h-6" />
          <div className="text-left flex-1">
            <p className="font-extrabold text-sm">{t("premiumTitle")}</p>
            <p className="text-xs opacity-90">{t("premiumDesc")}</p>
          </div>
        </button>
      )}
    </div>
  );
};

export default Home;
