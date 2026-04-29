import { useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { useLevels, useProgress, computeUnlocked } from "@/hooks/useContent";
import { Lock, CheckCircle2 } from "lucide-react";

const GRADIENTS: Record<string, string> = {
  A1: "from-emerald-400 via-teal-500 to-cyan-600",
  A2: "from-sky-400 via-blue-500 to-indigo-600",
  B1: "from-violet-400 via-purple-500 to-fuchsia-600",
  B2: "from-amber-400 via-orange-500 to-red-500",
  C1: "from-rose-400 via-pink-500 to-red-700",
};

const Levels = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { levels } = useLevels();
  const { passed } = useProgress();
  const unlocked = computeUnlocked(levels, passed);

  return (
    <div className="px-6 pt-10 pb-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{t("lessons")}</p>
      <h1 className="text-3xl font-extrabold mb-2">{t("chooseLevel")}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t("levelHint")}</p>

      <div className="space-y-3">
        {levels.map((lvl) => {
          const isOpen = unlocked[lvl.code];
          const isPassed = passed.has(lvl.code);
          return (
            <button
              key={lvl.code}
              onClick={() => isOpen && navigate(`/app/level/${lvl.code}`)}
              disabled={!isOpen}
              className={`w-full text-left rounded-3xl p-5 relative overflow-hidden shadow-card group bg-gradient-to-br ${
                GRADIENTS[lvl.code] ?? "from-primary to-secondary"
              } ${!isOpen ? "opacity-70" : ""}`}
            >
              <div className="absolute -right-4 -top-4 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl font-extrabold text-white">{lvl.code}</span>
                    {isPassed && (
                      <span className="px-2 py-0.5 rounded-full bg-white/25 backdrop-blur text-white text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> PASSED
                      </span>
                    )}
                    {!isOpen && (
                      <span className="px-2 py-0.5 rounded-full bg-white/25 backdrop-blur text-white text-[10px] font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> LOCKED
                      </span>
                    )}
                  </div>
                  <p className="text-white/95 font-semibold">{lvl.title}</p>
                  <p className="text-white/80 text-xs mt-1 max-w-[80%]">{lvl.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Levels;
