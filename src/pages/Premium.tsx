import { useEffect, useState } from "react";
import { Crown, Check, ArrowLeft, Copy, Loader2, Ban } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/contexts/I18nContext";
import { useToast } from "@/hooks/use-toast";
import { usePremium } from "@/hooks/usePremium";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/device";
import heroPremium from "@/assets/hero-premium.png";

type Method = "humo" | "uzcard" | "click" | "payme";
type Step = "plan" | "method" | "transfer" | "confirm" | "pending";

const METHODS: { id: Method; label: string; sub: string; gradient: string; emoji: string }[] = [
  { id: "click", label: "Click", sub: "click.uz orqali", gradient: "from-blue-500 to-indigo-600", emoji: "⚡" },
  { id: "payme", label: "Payme", sub: "payme.uz orqali", gradient: "from-cyan-500 to-blue-500", emoji: "💎" },
  { id: "humo", label: "HUMO", sub: "Karta-karta", gradient: "from-emerald-500 to-teal-600", emoji: "🟢" },
  { id: "uzcard", label: "UzCard", sub: "Karta-karta", gradient: "from-sky-500 to-blue-600", emoji: "🔵" },
];

const Premium = () => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const { toast } = useToast();
  const { isPremium, isBlocked, reload } = usePremium();
  const [plan, setPlan] = useState<"monthly" | "yearly">("yearly");
  const [method, setMethod] = useState<Method | null>(null);
  const [step, setStep] = useState<Step>("plan");
  const [adminCard, setAdminCard] = useState<{ card_number: string; card_holder: string; bank: string; phone: string } | null>(null);
  const [tgUsername, setTgUsername] = useState<string>("");
  const [senderCard, setSenderCard] = useState("");
  const [senderName, setSenderName] = useState("");
  const [loading, setLoading] = useState(false);
  const deviceId = getDeviceId();

  const amount = plan === "monthly" ? 29000 : 199000;

  useEffect(() => {
    supabase.functions.invoke("payments", { body: { action: "get_admin_card" } }).then(({ data }) => {
      setAdminCard(data?.card ?? null);
    });
    supabase.from("app_settings").select("value").eq("key", "admin_telegram").maybeSingle().then(({ data }) => {
      const v: any = data?.value;
      if (v?.username) setTgUsername(String(v.username).replace(/^@/, ""));
    });
  }, []);

  const formatCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
  const fmtAdmin = (n: string) => (n || "").replace(/(\d{4})(?=\d)/g, "$1 ");

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "✓", description: lang === "uz" ? "Nusxa olindi" : "Copied" });
  };

  const openExternal = () => {
    if (!method) return;
    const url = method === "click" ? "https://my.click.uz/" : method === "payme" ? "https://payme.uz/" : null;
    if (url) window.open(url, "_blank");
    setStep("confirm");
  };

  const submit = async () => {
    const digits = senderCard.replace(/\s/g, "");
    if (digits.length < 12) {
      toast({ title: "!", description: lang === "uz" ? "O'z kartangizni to'liq kiriting" : "Enter your card", variant: "destructive" });
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
          card_holder: senderName,
          plan,
          amount_uzs: amount,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setStep("pending");
      reload();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ===== Render states =====
  if (isPremium) {
    return (
      <div className="px-6 pt-10 pb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass flex items-center justify-center mb-6">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative rounded-3xl p-8 mb-6 bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 text-white shadow-glow text-center">
          <img src={heroPremium} alt="" className="w-32 h-32 mx-auto mb-4 drop-shadow-2xl" />
          <h1 className="text-3xl font-extrabold mb-2">Premium ✨</h1>
          <p className="opacity-90">{lang === "uz" ? "Sizda Premium faol!" : "You have Premium!"}</p>
        </div>
        <Button onClick={() => navigate("/app")} className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent shadow-glow font-bold">
          {lang === "uz" ? "Darslarga o'tish" : "Go to lessons"}
        </Button>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="px-6 pt-10 pb-6">
        <div className="glass rounded-3xl p-8 text-center shadow-soft">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center shadow-glow">
            <Ban className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold mb-2">{lang === "uz" ? "To'lov topilmadi" : "Payment not found"}</h1>
          <p className="text-sm text-muted-foreground">
            {lang === "uz"
              ? "So'rovingiz rad etildi. Pul kelmagan ko'rinadi. Qo'llab-quvvatlash bilan bog'laning."
              : "Your request was rejected. Please contact support."}
          </p>
        </div>
      </div>
    );
  }

  if (step === "pending") {
    const tgText = encodeURIComponent(
      `Salom! Premium uchun to'lov qildim.\n\nID: ${deviceId}\nReja: ${plan === "yearly" ? "1 yil" : "1 oy"}\nSumma: ${amount.toLocaleString()} UZS\n\nChekni rasmga olib yubordim.`
    );
    const tgUrl = tgUsername ? `https://t.me/${tgUsername}?text=${tgText}` : null;
    return (
      <div className="px-6 pt-10 pb-6">
        <div className="glass rounded-3xl p-6 text-center shadow-soft mb-4">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-glow animate-pulse-glow">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <h1 className="text-2xl font-extrabold mb-2">{lang === "uz" ? "Tekshirilmoqda" : "Verifying"}</h1>
          <p className="text-sm text-muted-foreground">
            {lang === "uz"
              ? "So'rovingiz qabul qilindi. Tezroq tasdiqlash uchun chek skrinshotini Telegram'dan adminga yuboring — ID bilan birga."
              : "Send the receipt screenshot together with your ID to the admin on Telegram for faster verification."}
          </p>
        </div>

        <div className="glass rounded-2xl p-4 mb-3 shadow-soft">
          <p className="text-[11px] uppercase font-bold text-muted-foreground mb-1">{lang === "uz" ? "Sizning ID" : "Your ID"}</p>
          <div className="flex items-center justify-between gap-2">
            <code className="text-xs font-mono break-all">{deviceId}</code>
            <button onClick={() => copy(deviceId)} className="w-9 h-9 rounded-xl glass flex items-center justify-center flex-shrink-0">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {tgUrl ? (
          <Button onClick={() => window.open(tgUrl, "_blank")} className="w-full h-14 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 shadow-glow font-bold mb-2">
            {lang === "uz" ? "Telegram orqali yuborish" : "Send on Telegram"}
          </Button>
        ) : (
          <p className="text-xs text-center text-muted-foreground mb-2">
            {lang === "uz" ? "Admin Telegram'ini sozlamagan." : "Admin Telegram is not set."}
          </p>
        )}
        <Button onClick={() => { reload(); }} variant="outline" className="w-full h-12 rounded-2xl">
          {lang === "uz" ? "Yangilash" : "Refresh"}
        </Button>
      </div>
    );
  }

  return (
    <div className="px-6 pt-10 pb-6">
      <button onClick={() => step === "plan" ? navigate(-1) : setStep(step === "confirm" ? "transfer" : step === "transfer" ? "method" : "plan")} className="w-10 h-10 rounded-full glass flex items-center justify-center mb-6">
        <ArrowLeft className="w-5 h-5" />
      </button>

      {step === "plan" && (
        <>
          <div className="relative rounded-3xl p-6 mb-6 bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 text-white shadow-glow overflow-hidden min-h-[180px]">
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-4 -right-2 w-32 h-32 opacity-95">
              <img src={heroPremium} alt="" className="w-full h-full object-contain drop-shadow-2xl" />
            </div>
            <div className="relative max-w-[60%]">
              <Crown className="w-8 h-8 mb-2" />
              <h1 className="text-3xl font-extrabold">Premium</h1>
              <p className="text-sm opacity-90 mt-2">{lang === "uz" ? "Cheksiz darslar va AI" : "Unlimited lessons & AI"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <PlanCard active={plan === "monthly"} onClick={() => setPlan("monthly")} label={lang === "uz" ? "Oylik" : "Monthly"} price="29 000" period="UZS/oy" />
            <PlanCard active={plan === "yearly"} onClick={() => setPlan("yearly")} label={lang === "uz" ? "Yillik" : "Yearly"} price="199 000" period="UZS/yil" badge="−43%" />
          </div>

          <div className="glass rounded-2xl p-5 mb-6 shadow-soft">
            <ul className="space-y-2.5">
              {[
                lang === "uz" ? "Barcha A1 → C1 darajalar" : "All A1 → C1 levels",
                lang === "uz" ? "AI o'qituvchi cheksiz" : "Unlimited AI tutor",
                lang === "uz" ? "Reklamasiz" : "No ads",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <Button onClick={() => setStep("method")} className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-primary via-secondary to-accent shadow-glow">
            {lang === "uz" ? "Davom etish" : "Continue"} · {amount.toLocaleString()} UZS
          </Button>
        </>
      )}

      {step === "method" && (
        <>
          <h2 className="text-2xl font-extrabold mb-2">{lang === "uz" ? "To'lov usuli" : "Payment method"}</h2>
          <p className="text-sm text-muted-foreground mb-5">
            {lang === "uz" ? "Quyidagi usullardan biri bilan to'lovni amalga oshiring" : "Choose a method"}
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => { setMethod(m.id); setStep("transfer"); }}
                className="glass rounded-2xl p-4 text-left shadow-soft hover:scale-[1.02] transition-transform"
              >
                <span className="text-2xl">{m.emoji}</span>
                <p className="font-extrabold mt-2">{m.label}</p>
                <p className="text-[11px] text-muted-foreground">{m.sub}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {step === "transfer" && method && (
        <>
          <h2 className="text-2xl font-extrabold mb-2">{lang === "uz" ? "Pulni o'tkazing" : "Transfer the amount"}</h2>
          <p className="text-sm text-muted-foreground mb-5">
            {lang === "uz"
              ? `Quyidagi kartaga ${amount.toLocaleString()} UZS o'tkazing`
              : `Send ${amount.toLocaleString()} UZS to the card below`}
          </p>

          {!adminCard?.card_number ? (
            <div className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">
              {lang === "uz" ? "Admin hali kartani qo'shmagan. Iltimos keyinroq urinib ko'ring." : "Admin has not added a card yet."}
            </div>
          ) : (
            <>
              <div className="relative rounded-3xl p-6 mb-4 bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white shadow-glow overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-primary/30 blur-3xl" />
                <p className="text-xs uppercase tracking-widest opacity-70 mb-2">{adminCard.bank}</p>
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-2xl font-mono tracking-wider">{fmtAdmin(adminCard.card_number)}</p>
                  <button onClick={() => copy(adminCard.card_number)} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm font-semibold uppercase">{adminCard.card_holder}</p>
                {adminCard.phone && <p className="text-xs opacity-70 mt-1">{adminCard.phone}</p>}
              </div>

              <div className="glass rounded-2xl p-4 mb-4 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{lang === "uz" ? "Summa" : "Amount"}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-extrabold">{amount.toLocaleString()} UZS</span>
                    <button onClick={() => copy(String(amount))} className="w-8 h-8 rounded-lg glass flex items-center justify-center">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-4 mb-4 bg-amber-500/10 border border-amber-500/30 text-xs leading-relaxed">
                <p className="font-extrabold text-amber-600 dark:text-amber-400 mb-1.5">⚠️ {lang === "uz" ? "Diqqat — eslatma" : "Important reminder"}</p>
                <p className="text-foreground/80">
                  {lang === "uz"
                    ? "To'lovni faqat YUQORIDAGI kartaga aniq summada qiling. Boshqa kartaga yuborilsa, Premium ochilmaydi va pul qaytarilmaydi. To'lovdan keyin chek skrinshotini va o'zingizning ID'ingizni Telegram orqali adminga yuboring — shunda 5-10 daqiqada faollashtiramiz."
                    : "Only transfer the EXACT amount to the card above. Wrong card = no refund. After paying, send the receipt screenshot and your ID to the admin on Telegram for fast activation."}
                </p>
              </div>

              <div className="glass rounded-2xl p-4 mb-5 text-xs text-muted-foreground space-y-1.5">
                <p>📲 1. {lang === "uz" ? `${method === "click" ? "Click" : method === "payme" ? "Payme" : "Bank"} ilovasini oching` : `Open ${method} app`}</p>
                <p>💳 2. {lang === "uz" ? "Yuqoridagi kartaga aniq summani o'tkazing" : "Transfer the exact amount to the card above"}</p>
                <p>✅ 3. {lang === "uz" ? "Pastdagi tugmani bosing va o'z kartangizni kiriting" : "Tap the button below and enter your card"}</p>
              </div>

              {(method === "click" || method === "payme") && (
                <Button onClick={openExternal} variant="outline" className="w-full h-12 rounded-2xl mb-3">
                  {lang === "uz" ? `${method === "click" ? "Click" : "Payme"} ochish` : `Open ${method}`}
                </Button>
              )}
              <Button onClick={() => setStep("confirm")} className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent shadow-glow font-bold">
                {lang === "uz" ? "To'lovni amalga oshirdim" : "I've made the payment"}
              </Button>
            </>
          )}
        </>
      )}

      {step === "confirm" && (
        <>
          <h2 className="text-2xl font-extrabold mb-2">{lang === "uz" ? "Tasdiqlash" : "Confirm"}</h2>
          <p className="text-sm text-muted-foreground mb-5">
            {lang === "uz"
              ? "Pulni qaysi kartadan o'tkazganingizni kiriting. Shu karta orqali pul kelganini tekshiramiz."
              : "Enter the card you transferred from."}
          </p>
          <div className="glass rounded-2xl p-5 shadow-soft space-y-3 mb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                {lang === "uz" ? "Sizning kartangiz" : "Your card"}
              </p>
              <Input
                value={senderCard}
                onChange={(e) => setSenderCard(formatCard(e.target.value))}
                placeholder="0000 0000 0000 0000"
                className="h-14 text-lg font-mono tracking-wider rounded-2xl"
                inputMode="numeric"
              />
            </div>
            <Input
              value={senderName}
              onChange={(e) => setSenderName(e.target.value.toUpperCase())}
              placeholder={lang === "uz" ? "KARTA EGASI F.I.SH" : "CARD HOLDER NAME"}
              className="h-12 rounded-2xl uppercase"
            />
            <p className="text-[11px] text-muted-foreground italic">
              🔒 {lang === "uz" ? "Faqat oxirgi 4 raqami saqlanadi. Kartangizdan pul yechilmaydi." : "Only last 4 digits are stored."}
            </p>
          </div>

          <Button onClick={submit} disabled={loading} className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-primary via-secondary to-accent shadow-glow">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (lang === "uz" ? "Yuborish" : "Submit")}
          </Button>
        </>
      )}
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
