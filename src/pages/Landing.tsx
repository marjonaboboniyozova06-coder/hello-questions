import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/I18nContext";
import { Sparkles, Globe, BookOpen, ChevronRight } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="min-h-screen gradient-mesh flex flex-col">
      <main className="flex-1 mx-auto w-full max-w-md px-6 pt-16 pb-10 flex flex-col safe-top safe-bottom">
        {/* Hero */}
        <div className="flex items-center gap-2 mb-12">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">{t("appName")}</span>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="relative mb-10">
            <div className="absolute -top-10 -left-6 w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary-glow opacity-30 blur-3xl animate-pulse-glow" />
            <div className="absolute top-20 -right-8 w-40 h-40 rounded-full bg-gradient-to-br from-secondary to-accent opacity-30 blur-3xl animate-float" />

            <h1 className="relative text-5xl font-extrabold leading-[1.05] mb-4">
              <span className="text-gradient">English</span>
              <br />
              made simple.
            </h1>
            <p className="relative text-lg text-muted-foreground leading-relaxed">
              {t("tagline")} — A1, A2, B1, B2, C1.
            </p>
          </div>

          <div className="space-y-3 mb-10">
            <Feature icon={BookOpen} title="Bite-size lessons" desc="Quick, focused, fun." />
            <Feature icon={Globe} title="3 interface languages" desc="O'zbek · English · Русский" />
            <Feature icon={Sparkles} title="Grammar that clicks" desc="Clear rules, real examples." />
          </div>
        </div>

        <Button
          size="lg"
          onClick={() => navigate("/auth")}
          className="h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-95 shadow-glow"
        >
          {t("getStarted")}
          <ChevronRight className="w-5 h-5" />
        </Button>
      </main>
    </div>
  );
};

const Feature = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="glass rounded-2xl p-4 flex items-center gap-3 shadow-soft">
    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div>
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  </div>
);

export default Landing;
