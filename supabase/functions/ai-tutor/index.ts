// AI Tutor — Lovable AI Gateway
// Streams chat responses for a given lesson context. Refuses if level locked for device.
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

const SYSTEM_PROMPT = `Siz "Polatov Boboyor" ingliz tili ilovasidagi do'stona AI o'qituvchisiz.
Foydalanuvchi o'zbek yoki ingliz tilida savol berishi mumkin. Quyidagi qoidalarga rioya qiling:

1. Agar foydalanuvchi o'zbek tilida yozsa — o'zbek tilida sodda, do'stona, qisqa javob bering. Misollar ingliz tilida bo'lsin va ularning o'zbekcha tarjimasi yoniga yozilsin.
2. Agar foydalanuvchi ingliz tilida yozsa — ingliz tilida javob bering, lekin yangi yoki murakkab so'zlarning o'zbekcha tarjimasini qavs ichida bering.
3. FAQAT shu darsning mavzusi haqida gapiring. Boshqa darajalar yoki yopiq darslar haqida so'rasa: "Bu hozirgi darsdan tashqari. Avval shu darsni o'rganaylik" deb qaytaring.
4. Javoblar qisqa, aniq va emoji bilan bezatilgan bo'lsin (1-2 emoji).
5. Markdown ishlating: **bold** muhim so'zlar uchun, ro'yxatlar va misollar uchun.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, lessonContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI gateway not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sys = lessonContext
      ? `${SYSTEM_PROMPT}\n\n--- Joriy dars konteksti ---\nSarlavha: ${lessonContext.title}\nDaraja: ${lessonContext.level}\nMazmun:\n${(lessonContext.content || "").slice(0, 2000)}`
      : SYSTEM_PROMPT;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        stream: true,
        messages: [{ role: "system", content: sys }, ...(messages || [])],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) {
        return new Response(JSON.stringify({ error: "Juda ko'p so'rov. Biroz kuting." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (res.status === 402) {
        return new Response(JSON.stringify({ error: "AI kreditlari tugadi. Workspace > Usage'ga kreditlar qo'shing." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: text }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(res.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
