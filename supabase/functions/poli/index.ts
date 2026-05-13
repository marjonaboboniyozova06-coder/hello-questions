// Poli — global app AI assistant.
// Restricts content knowledge to levels the user has unlocked / passed.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const SYSTEM_BASE = `Siz "Poli" — Polatov Boboyor ingliz tili ilovasining bosh yordamchisiz.
Foydalanuvchi o'zbek yoki ingliz tilida yozishi mumkin. Qoidalar:

1. Salomlashing, ilova haqida (darslar, premium, testlar) tushuntiring.
2. Faqat foydalanuvchi UCHUN OCHIQ darajalar (unlocked) bo'yicha ingliz tili savollariga javob bering.
3. Agar foydalanuvchi yopiq daraja yoki dars haqida so'rasa (masalan A2 ochilmagan bo'lib, A2 mavzusi haqida) — muloyimlik bilan rad eting va: "Bu daraja hali ochilmagan. Avval {prevLevel} testidan o'ting yoki Premium oling" deb yozing.
4. Javoblar qisqa, do'stona, emoji bilan (1-2 ta).
5. Markdown ishlating: **bold**, ro'yxatlar.
6. O'zbek tilida yozsa — o'zbekcha javob bering, misollar ingliz+tarjima.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, device_id } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI gateway not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build context: unlocked levels for this device
    const [{ data: levels }, { data: progress }, { data: prem }, { data: setting }] = await Promise.all([
      supabase.from("levels").select("code,title,description,sort_order,is_locked,is_premium").order("sort_order"),
      device_id ? supabase.from("device_progress").select("level_code,passed").eq("device_id", device_id) : Promise.resolve({ data: [] }),
      device_id ? supabase.from("device_premium").select("is_premium,expires_at").eq("device_id", device_id).maybeSingle() : Promise.resolve({ data: null }),
      supabase.from("app_settings").select("value").eq("key", "poli_premium_only").maybeSingle(),
    ]);

    const premRow: any = prem;
    let isPremium = !!premRow?.is_premium;
    if (isPremium && premRow?.expires_at && new Date(premRow.expires_at).getTime() < Date.now()) {
      isPremium = false;
    }
    const passed = new Set((progress || []).filter((p: any) => p.passed).map((p: any) => p.level_code));

    // Global Poli lock — premium-only mode
    const premiumOnly = !!(setting as any)?.value?.enabled;
    if (premiumOnly && !isPremium) {
      return new Response(JSON.stringify({
        error: "Poli yordamchisi hozir faqat Premium foydalanuvchilar uchun ochiq. Iltimos Premium oling.",
      }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }


    const sorted = [...(levels || [])].sort((a: any, b: any) => a.sort_order - b.sort_order);
    const unlockedCodes: string[] = [];
    let prevPassed = true;
    for (const lvl of sorted as any[]) {
      const open = (!lvl.is_locked || prevPassed) && (!lvl.is_premium || isPremium);
      if (open) unlockedCodes.push(lvl.code);
      prevPassed = passed.has(lvl.code);
    }

    const ctx = `\n\n--- Foydalanuvchi holati ---\nOchiq darajalar: ${unlockedCodes.join(", ") || "(yo'q)"}\nO'tilgan darajalar: ${[...passed].join(", ") || "(yo'q)"}\nPremium: ${isPremium ? "ha" : "yo'q"}\nBarcha darajalar: ${sorted.map((l: any) => l.code).join(", ")}\n\nQATIY: Faqat OCHIQ darajalar haqida o'qitish kontentini bering. Yopiq darajalar haqida faqat "ochilmagan" deb javob bering.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        stream: true,
        messages: [{ role: "system", content: SYSTEM_BASE + ctx }, ...(messages || [])],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      const status = res.status === 429 ? 429 : res.status === 402 ? 402 : 500;
      const msg = res.status === 429 ? "Juda ko'p so'rov. Biroz kuting." : res.status === 402 ? "AI kreditlari tugadi." : text;
      return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(res.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
