// Mock payments edge function
// Records a payment request from the device. Pul yechilmaydi.
// Admin keyin tasdiqlaganda premium ochiladi.
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

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const action = body.action as string;

    if (action === "submit_request") {
      const { device_id, method, card_number, card_holder, plan, amount_uzs } = body;
      if (!device_id || !method || !plan || !amount_uzs) {
        return json({ error: "Missing fields" }, 400);
      }
      // Mask card: only store last 4
      const last4 = (card_number || "").replace(/\s/g, "").slice(-4) || null;
      const { error, data } = await supabase
        .from("payment_requests")
        .insert({
          device_id,
          method,
          card_last4: last4,
          card_holder: card_holder || null,
          plan,
          amount_uzs,
          status: "pending",
        })
        .select()
        .single();
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true, request: data });
    }

    if (action === "check_premium") {
      const { device_id } = body;
      if (!device_id) return json({ is_premium: false });
      const { data } = await supabase
        .from("device_premium")
        .select("is_premium, expires_at")
        .eq("device_id", device_id)
        .maybeSingle();
      let active = !!data?.is_premium;
      if (active && data?.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
        active = false;
      }
      return json({ is_premium: active, expires_at: data?.expires_at ?? null });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
