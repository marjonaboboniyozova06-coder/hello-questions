import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/I18nContext";
import { Sparkles, BookOpen, Globe, Trophy, ChevronRight } from "lucide-react";

const slides = [
  {
    icon: Sparkles,
    title: { uz: "Linguo'ga xush kelibsiz", en: "Welcome to Linguo", ru: "Добро пожаловать в Linguo" },
    desc: {
      uz: "Ingliz tilini A1 dan C1 gacha qiziqarli tarzda o'rganing.",
      en: "Learn English from A1 to C1 the fun way.",
      ru: "Изучайте английский от A1 до C1 легко и интересно.",
    },
  },
  {
    icon: BookOpen,
    title: { uz: "Darslar va grammatika", en: "Lessons & grammar", ru: "Уроки и грамматика" },
    desc: {
      uz: "Har bir daraja uchun qisqa darslar va aniq grammatika qoidalari.",
      en: "Bite-size lessons and crystal-clear grammar for every level.",
      ru: "Короткие уроки и понятная грамматика для каждого уровня.",
    },
  },
  {
    icon: Trophy,
    title: { uz: "Har kuni o'sing", en: "Grow every day", ru: "Развивайтесь каждый день" },
    desc: {
      uz: "Kunlik strik va premium kontent bilan natijaga erishing.",
      en: "Daily streaks and premium content to keep you on track.",
      ru: "Ежедневная серия и премиум-контент для прогресса.",
    },
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const [i, setI] = useState(0);

  const finish = () => {
    localStorage.setItem("linguo-onboarded", "1");
  };

  const next = () => {
    if (i < slides.length - 1) setI(i + 1);
  };
  const skip = () => setI(slides.length - 1);

  const slide = slides[i];
  const Icon = slide.icon;
  const isLast = i === slides.length - 1;

  return (
    <div className="min-h-screen gradient-mesh flex flex-col safe-top safe-bottom">
      <div className="mx-auto w-full max-w-md px-6 pt-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold">{t("appName")}</span>
        </div>
        {!isLast && (
          <button onClick={skip} className="text-sm text-muted-foreground font-medium">
            {lang === "uz" ? "O'tkazib yuborish" : lang === "ru" ? "Пропустить" : "Skip"}
          </button>
        )}
      </div>

      <main className="flex-1 mx-auto w-full max-w-md px-6 flex flex-col items-center justify-center text-center">
        <div className="relative mb-10">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary to-secondary opacity-30 blur-3xl rounded-full animate-pulse-glow" />
          <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-glow">
            <Icon className="w-14 h-14 text-primary-foreground" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold mb-3 leading-tight">
          {slide.title[lang]}
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
          {slide.desc[lang]}
        </p>

        <div className="flex items-center gap-2 mt-10">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx === i ? "w-8 bg-gradient-to-r from-primary to-secondary" : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>
      </main>

      <div className="mx-auto w-full max-w-md px-6 pb-8 space-y-3">
        {!isLast ? (
          <Button
            size="lg"
            onClick={next}
            className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-primary via-secondary to-accent shadow-glow"
          >
            {lang === "uz" ? "Keyingi" : lang === "ru" ? "Далее" : "Next"}
            <ChevronRight className="w-5 h-5" />
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              onClick={() => {
                finish();
                navigate("/auth?mode=signup");
              }}
              className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-primary via-secondary to-accent shadow-glow"
            >
              {t("signup")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                finish();
                navigate("/auth?mode=login");
              }}
              className="w-full h-14 rounded-2xl text-base font-bold glass border-border"
            >
              {t("login")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
