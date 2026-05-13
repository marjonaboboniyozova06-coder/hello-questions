// Track device sessions: ping (touch last_seen) and lesson_view (increment counter).
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, device_id, email, user_id, user_agent, full_name } = await req.json();
    if (!device_id || typeof device_id !== "string") {
      return new Response(JSON.stringify({ error: "device_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upsert base row
    const { data: existing } = await supabase
      .from("device_sessions").select("device_id, lessons_viewed").eq("device_id", device_id).maybeSingle();

    if (!existing) {
      await supabase.from("device_sessions").insert({
        device_id, last_seen: new Date().toISOString(), lessons_viewed: action === "lesson_view" ? 1 : 0,
        email: email || null, user_id: user_id || null, user_agent: user_agent || null, full_name: full_name || null,
      });
      return new Response(JSON.stringify({ ok: true, lessons_viewed: action === "lesson_view" ? 1 : 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const updates: any = { last_seen: new Date().toISOString() };
    if (email) updates.email = email;
    if (user_id) updates.user_id = user_id;
    if (user_agent) updates.user_agent = user_agent;
    if (full_name) updates.full_name = full_name;
    if (action === "lesson_view") updates.lessons_viewed = (existing.lessons_viewed || 0) + 1;

    await supabase.from("device_sessions").update(updates).eq("device_id", device_id);
    return new Response(JSON.stringify({ ok: true, lessons_viewed: updates.lessons_viewed ?? existing.lessons_viewed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
