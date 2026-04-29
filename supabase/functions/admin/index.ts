// Admin edge function: login + content management
// Single hardcoded admin: polatovv12 / polatov12
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const ADMIN_USER = "polatovv12";
const ADMIN_PASS = "polatov12";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
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

async function requireAdmin(req: Request): Promise<boolean> {
  const token = req.headers.get("x-admin-token");
  if (!token) return false;
  const { data } = await supabase
    .from("admin_sessions")
    .select("token, expires_at")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  return !!data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action as string;

    // Public: login
    if (action === "login") {
      if (body.username !== ADMIN_USER || body.password !== ADMIN_PASS) {
        return json({ error: "Invalid credentials" }, 401);
      }
      const token = crypto.randomUUID() + "-" + crypto.randomUUID();
      await supabase.from("admin_sessions").insert({ token });
      return json({ token });
    }

    // All other actions require admin
    if (!(await requireAdmin(req))) return json({ error: "Unauthorized" }, 401);

    switch (action) {
      case "verify":
        return json({ ok: true });

      // ----- Levels -----
      case "update_level": {
        const { id, ...updates } = body.payload;
        const { error } = await supabase.from("levels").update(updates).eq("id", id);
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
      case "toggle_level_lock": {
        const { id, is_locked } = body.payload;
        const { error } = await supabase.from("levels").update({ is_locked }).eq("id", id);
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }

      // ----- Lessons -----
      case "create_lesson": {
        const { error, data } = await supabase.from("lessons").insert(body.payload).select().single();
        if (error) return json({ error: error.message }, 400);
        return json({ data });
      }
      case "update_lesson": {
        const { id, ...updates } = body.payload;
        const { error } = await supabase.from("lessons").update(updates).eq("id", id);
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
      case "delete_lesson": {
        const { error } = await supabase.from("lessons").delete().eq("id", body.payload.id);
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }

      // ----- Test questions -----
      case "create_question": {
        const { error, data } = await supabase.from("test_questions").insert(body.payload).select().single();
        if (error) return json({ error: error.message }, 400);
        return json({ data });
      }
      case "update_question": {
        const { id, ...updates } = body.payload;
        const { error } = await supabase.from("test_questions").update(updates).eq("id", id);
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }
      case "delete_question": {
        const { error } = await supabase.from("test_questions").delete().eq("id", body.payload.id);
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }

      // ----- Stats -----
      case "stats": {
        const [levels, lessons, questions, progress] = await Promise.all([
          supabase.from("levels").select("id", { count: "exact", head: true }),
          supabase.from("lessons").select("id", { count: "exact", head: true }),
          supabase.from("test_questions").select("id", { count: "exact", head: true }),
          supabase.from("device_progress").select("device_id"),
        ]);
        const uniqueDevices = new Set((progress.data || []).map((p: any) => p.device_id)).size;
        return json({
          levels: levels.count ?? 0,
          lessons: lessons.count ?? 0,
          questions: questions.count ?? 0,
          users: uniqueDevices,
        });
      }

      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
