import { useState } from "react";
import { Sparkles, Check, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/I18nContext";
import { useToast } from "@/hooks/use-toast";

const Premium = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { toast } = useToast();
  const [plan, setPlan] = useState<"monthly" | "yearly">("yearly");

  const features = [
    "All levels A1 → C1 unlocked",
    "Full grammar library",
    "Offline lessons",
    "No ads, ever",
    "Priority new content",
  ];

  const handlePay = () => {
    toast({
      title: "To'lov tizimi tayyorlanmoqda",
      description: "Stripe to'lov integratsiyasi keyingi qadamda yoqiladi.",
    });
  };

  return (
    <div className="px-6 pt-10 pb-6">
      <button
        onClick={() => navigate(-1)}
        className="w-10 h-10 rounded-full glass flex items-center justify-center mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="relative rounded-3xl p-6 mb-6 gradient-hero text-primary-foreground shadow-glow overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
        <Sparkles className="w-10 h-10 mb-3" />
        <h1 className="text-3xl font-extrabold">{t("premiumTitle")}</h1>
        <p className="text-sm opacity-90 mt-2">{t("premiumDesc")}</p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <PlanCard
          active={plan === "monthly"}
          onClick={() => setPlan("monthly")}
          label={t("monthly")}
          price="$4.99"
          period="/mo"
        />
        <PlanCard
          active={plan === "yearly"}
          onClick={() => setPlan("yearly")}
          label={t("yearly")}
          price="$39.99"
          period="/yr"
          badge="−33%"
        />
      </div>

      <div className="glass rounded-2xl p-5 mb-6 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Includes</p>
        <ul className="space-y-2.5">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <Button
        onClick={handlePay}
        className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-primary via-secondary to-accent shadow-glow"
      >
        {t("payNow")} · {plan === "monthly" ? "$4.99/mo" : "$39.99/yr"}
      </Button>
      <p className="text-[11px] text-center text-muted-foreground mt-3">Cancel anytime. Secure payment.</p>
    </div>
  );
};

const PlanCard = ({
  active,
  onClick,
  label,
  price,
  period,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  price: string;
  period: string;
  badge?: string;
}) => (
  <button
    onClick={onClick}
    className={`relative rounded-2xl p-4 text-left transition-all ${
      active
        ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-glow scale-[1.02]"
        : "glass shadow-soft"
    }`}
  >
    {badge && (
      <span className="absolute -top-2 right-3 bg-accent text-accent-foreground text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
        {badge}
      </span>
    )}
    <p className={`text-xs font-bold uppercase tracking-wider ${active ? "opacity-90" : "text-muted-foreground"}`}>
      {label}
    </p>
    <p className="text-2xl font-extrabold mt-1">
      {price}
      <span className={`text-sm font-medium ${active ? "opacity-80" : "text-muted-foreground"}`}>{period}</span>
    </p>
  </button>
);

export default Premium;
