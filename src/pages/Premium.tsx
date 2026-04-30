import { useState } from "react";
import { Crown, Check, ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/contexts/I18nContext";
import { useToast } from "@/hooks/use-toast";
import { usePremium } from "@/hooks/usePremium";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/device";
import heroPremium from "@/assets/hero-premium.png";

type Method = "humo" | "uzcard" | "click" | "payme" | "visa";

const METHODS: { id: Method; label: string; sub: string; gradient: string; emoji: string }[] = [
  { id: "humo", label: "HUMO", sub: "Milliy karta", gradient: "from-emerald-500 to-teal-600", emoji: "🟢" },
  { id: "uzcard", label: "UzCard", sub: "Milliy karta", gradient: "from-sky-500 to-blue-600", emoji: "🔵" },
  { id: "click", label: "Click", sub: "Tezkor to'lov", gradient: "from-blue-500 to-indigo-600", emoji: "⚡" },
  { id: "payme", label: "Payme", sub: "Tezkor to'lov", gradient: "from-cyan-500 to-blue-500", emoji: "💎" },
  { id: "visa", label: "Visa / MC", sub: "Xalqaro karta", gradient: "from-violet-500 to-purple-600", emoji: "🌍" },
];

const Premium = () => {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const { isPremium, reload } = usePremium();
  const [plan, setPlan] = useState<"monthly" | "yearly">("yearly");
  const [method, setMethod] = useState<Method | null>(null);
  const [card, setCard] = useState("");
  const [holder, setHolder] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const features = [
    { uz: "Barcha A1 → C1 darajalar", en: "All A1 → C1 levels", ru: "Все уровни A1 → C1" },
    { uz: "To'liq grammatika kutubxonasi", en: "Full grammar library", ru: "Полная библиотека грамматики" },
    { uz: "AI o'qituvchi bilan cheksiz suhbat", en: "Unlimited AI tutor chat", ru: "Безлимитный AI-учитель" },
    { uz: "Reklamasiz, abadiy", en: "No ads, ever", ru: "Без рекламы навсегда" },
    { uz: "Yangi kontent birinchi navbatda", en: "Priority new content", ru: "Новый контент в первую очередь" },
  ];

  const amount = plan === "monthly" ? 29000 : 199000;

  const formatCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");

  const submit = async () => {
    if (!method) {
      toast({ title: t("paymentMethod"), description: lang === "uz" ? "To'lov usulini tanlang" : "Choose method", variant: "destructive" });
      return;
    }
    const digits = card.replace(/\s/g, "");
    if (digits.length < 12) {
      toast({ title: t("cardNumber"), description: lang === "uz" ? "Kartani to'liq kiriting" : "Enter full card", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("payments", {
        body: {
          action: "submit_request",
          device_id: getDeviceId(),
          method,
          card_number: digits,
          card_holder: holder,
          plan,
          amount_uzs: amount,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSubmitted(true);
      toast({ title: "✓", description: t("paymentPending") });
      reload();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (isPremium) {
    return (
      <div className="px-6 pt-10 pb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass flex items-center justify-center mb-6">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative rounded-3xl p-8 mb-6 bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 text-white shadow-glow overflow-hidden text-center">
          <img src={heroPremium} alt="" className="w-32 h-32 mx-auto mb-4 drop-shadow-2xl" />
          <h1 className="text-3xl font-extrabold mb-2">Premium ✨</h1>
          <p className="opacity-90">{lang === "uz" ? "Sizda Premium faol!" : "You have Premium!"}</p>
        </div>
        <Button onClick={() => navigate("/app")} className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-primary via-secondary to-accent shadow-glow">
          {lang === "uz" ? "Darslarga o'tish" : "Go to lessons"}
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="px-6 pt-10 pb-6">
        <div className="relative rounded-3xl p-8 mb-6 glass shadow-glow text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-glow animate-pulse-glow">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <h1 className="text-2xl font-extrabold mb-2">{lang === "uz" ? "Kutilmoqda" : "Pending"}</h1>
          <p className="text-sm text-muted-foreground">{t("paymentPending")}</p>
          <p className="text-xs text-muted-foreground mt-3 italic">{t("paymentNote")}</p>
        </div>
        <Button onClick={() => { setSubmitted(false); reload(); }} className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary shadow-glow">
          {lang === "uz" ? "Tekshirish" : "Check status"}
        </Button>
        <Button variant="outline" onClick={() => navigate("/app")} className="w-full h-14 rounded-2xl mt-3">
          {lang === "uz" ? "Bosh sahifa" : "Home"}
        </Button>
      </div>
    );
  }

  return (
    <div className="px-6 pt-10 pb-6">
      <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass flex items-center justify-center mb-6">
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Hero */}
      <div className="relative rounded-3xl p-6 mb-6 bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 text-white shadow-glow overflow-hidden min-h-[180px]">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-4 -right-2 w-32 h-32 opacity-95">
          <img src={heroPremium} alt="" className="w-full h-full object-contain drop-shadow-2xl" />
        </div>
        <div className="relative max-w-[60%]">
          <Crown className="w-8 h-8 mb-2" />
          <h1 className="text-3xl font-extrabold">{t("premiumTitle")}</h1>
          <p className="text-sm opacity-90 mt-2">{t("premiumDesc")}</p>
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <PlanCard active={plan === "monthly"} onClick={() => setPlan("monthly")} label={t("monthly")} price="29 000" period="UZS/oy" />
        <PlanCard active={plan === "yearly"} onClick={() => setPlan("yearly")} label={t("yearly")} price="199 000" period="UZS/yil" badge="−43%" />
      </div>

      {/* Features */}
      <div className="glass rounded-2xl p-5 mb-6 shadow-soft">
        <ul className="space-y-2.5">
          {features.map((f) => (
            <li key={f.uz} className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
              {f[lang]}
            </li>
          ))}
        </ul>
      </div>

      {/* Payment methods */}
      <h3 className="text-sm font-bold mb-3 uppercase tracking-wider text-muted-foreground">{t("paymentMethod")}</h3>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={`relative rounded-2xl p-3 text-left transition-all ${
              method === m.id
                ? `bg-gradient-to-br ${m.gradient} text-white shadow-glow scale-[1.02]`
                : "glass shadow-soft"
            }`}
          >
            <span className="text-xl">{m.emoji}</span>
            <p className="font-extrabold text-sm mt-1">{m.label}</p>
            <p className={`text-[10px] ${method === m.id ? "opacity-90" : "text-muted-foreground"}`}>{m.sub}</p>
          </button>
        ))}
      </div>

      {/* Card form */}
      {method && (
        <div className="glass rounded-2xl p-5 mb-5 shadow-soft space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-primary" />
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("cardNumber")}</p>
          </div>
          <Input
            value={card}
            onChange={(e) => setCard(formatCard(e.target.value))}
            placeholder="0000 0000 0000 0000"
            className="h-14 text-lg font-mono tracking-wider rounded-2xl bg-card border-border"
            inputMode="numeric"
          />
          <Input
            value={holder}
            onChange={(e) => setHolder(e.target.value.toUpperCase())}
            placeholder={t("cardHolder").toUpperCase()}
            className="h-12 rounded-2xl bg-card border-border uppercase"
          />
          <p className="text-[11px] text-muted-foreground italic">🔒 {t("paymentNote")}</p>
        </div>
      )}

      <Button
        onClick={submit}
        disabled={loading || !method}
        className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-primary via-secondary to-accent shadow-glow"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `${t("submitPayment")} · ${amount.toLocaleString()} UZS`}
      </Button>
    </div>
  );
};

const PlanCard = ({ active, onClick, label, price, period, badge }: any) => (
  <button
    onClick={onClick}
    className={`relative rounded-2xl p-4 text-left transition-all ${
      active ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-glow scale-[1.02]" : "glass shadow-soft"
    }`}
  >
    {badge && (
      <span className="absolute -top-2 right-3 bg-accent text-accent-foreground text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
        {badge}
      </span>
    )}
    <p className={`text-xs font-bold uppercase tracking-wider ${active ? "opacity-90" : "text-muted-foreground"}`}>{label}</p>
    <p className="text-xl font-extrabold mt-1">
      {price}
      <span className={`text-[10px] font-medium ml-1 ${active ? "opacity-80" : "text-muted-foreground"}`}>{period}</span>
    </p>
  </button>
);

export default Premium;
