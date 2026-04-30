import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/I18nContext";
import { ChevronRight, Sparkles } from "lucide-react";
import heroStudent from "@/assets/hero-student.png";
import heroLetters from "@/assets/hero-letters.png";
import heroTrophy from "@/assets/hero-trophy.png";

const slides = [
  {
    img: heroStudent,
    title: { uz: "Polatov Boboyor'ga xush kelibsiz", en: "Welcome to Polatov Boboyor", ru: "Добро пожаловать в Polatov Boboyor" },
    desc: {
      uz: "Ingliz tilini A1 dan C1 gacha qiziqarli tarzda o'rganing.",
      en: "Learn English from A1 to C1 the fun way.",
      ru: "Изучайте английский от A1 до C1 легко и интересно.",
    },
  },
  {
    img: heroLetters,
    title: { uz: "Darslar va grammatika", en: "Lessons & grammar", ru: "Уроки и грамматика" },
    desc: {
      uz: "Har bir daraja uchun aniq darslar, grammatika va AI o'qituvchi bilan suhbat.",
      en: "Crystal-clear lessons, grammar, and an AI tutor for every level.",
      ru: "Понятные уроки, грамматика и AI-учитель для каждого уровня.",
    },
  },
  {
    img: heroTrophy,
    title: { uz: "Yakuniy testdan o'ting", en: "Pass the final test", ru: "Сдайте финальный тест" },
    desc: {
      uz: "Darajani tugating va keyingisini avtomatik oching!",
      en: "Finish a level to unlock the next one automatically!",
      ru: "Закончите уровень — следующий откроется автоматически!",
    },
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const [i, setI] = useState(0);

  const finish = () => {
    localStorage.setItem("linguo-onboarded", "1");
    navigate("/app");
  };

  const next = () => {
    if (i < slides.length - 1) setI(i + 1);
    else finish();
  };

  const slide = slides[i];
  const isLast = i === slides.length - 1;

  return (
    <div className="min-h-screen gradient-mesh flex flex-col safe-top safe-bottom relative overflow-hidden">
      {/* Floating glow orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/30 blur-3xl animate-pulse-glow" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-secondary/30 blur-3xl animate-pulse-glow" />

      <header className="relative mx-auto w-full max-w-md px-6 pt-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm">{t("appName")}</span>
        </div>
        <button onClick={finish} className="text-sm text-muted-foreground font-medium">
          {lang === "uz" ? "O'tkazib yuborish" : lang === "ru" ? "Пропустить" : "Skip"}
        </button>
      </header>

      <main className="relative flex-1 mx-auto w-full max-w-md px-6 flex flex-col items-center justify-center text-center">
        <div className="relative mb-8 animate-float">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary via-secondary to-accent opacity-40 blur-3xl rounded-full scale-90" />
          <img
            src={slide.img}
            alt={slide.title[lang]}
            width={280}
            height={280}
            className="w-64 h-64 object-contain drop-shadow-2xl"
          />
        </div>

        <h1 className="text-3xl font-extrabold mb-3 leading-tight text-gradient">{slide.title[lang]}</h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-sm">{slide.desc[lang]}</p>

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

      <div className="relative mx-auto w-full max-w-md px-6 pb-8">
        <Button
          size="lg"
          onClick={next}
          className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-primary via-secondary to-accent shadow-glow"
        >
          {isLast ? (lang === "uz" ? "Boshlash" : lang === "ru" ? "Начать" : "Get Started") : (lang === "uz" ? "Keyingi" : lang === "ru" ? "Далее" : "Next")}
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
