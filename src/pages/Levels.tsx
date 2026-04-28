import { useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { LEVELS } from "@/data/levels";
import { Lock } from "lucide-react";

const Levels = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="px-6 pt-10 pb-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{t("lessons")}</p>
      <h1 className="text-3xl font-extrabold mb-2">{t("chooseLevel")}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t("levelHint")}</p>

      <div className="space-y-3">
        {LEVELS.map((lvl, i) => (
          <button
            key={lvl.code}
            onClick={() => navigate(`/app/level/${lvl.code}`)}
            className="w-full text-left rounded-3xl p-5 relative overflow-hidden shadow-card group"
            style={{ background: `linear-gradient(135deg, hsl(var(--primary)) ${i * 12}%, hsl(var(--secondary)) ${60 + i * 8}%, hsl(var(--accent)) 100%)` }}
          >
            <div className="absolute -right-4 -top-4 text-7xl opacity-30 group-hover:opacity-50 transition-opacity">
              {lvl.emoji}
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl font-extrabold text-white">{lvl.code}</span>
                {!lvl.free && (
                  <span className="px-2 py-0.5 rounded-full bg-white/25 backdrop-blur text-white text-[10px] font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> PRO
                  </span>
                )}
              </div>
              <p className="text-white/95 font-semibold">{lvl.name}</p>
              <p className="text-white/80 text-xs mt-1 max-w-[80%]">{lvl.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Levels;
