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
        const [levels, lessons, questions, progress, premium, pending] = await Promise.all([
          supabase.from("levels").select("id", { count: "exact", head: true }),
          supabase.from("lessons").select("id", { count: "exact", head: true }),
          supabase.from("test_questions").select("id", { count: "exact", head: true }),
          supabase.from("device_progress").select("device_id"),
          supabase.from("device_premium").select("device_id", { count: "exact", head: true }).eq("is_premium", true),
          supabase.from("payment_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        ]);
        const uniqueDevices = new Set((progress.data || []).map((p: any) => p.device_id)).size;
        return json({
          levels: levels.count ?? 0,
          lessons: lessons.count ?? 0,
          questions: questions.count ?? 0,
          users: uniqueDevices,
          premium: premium.count ?? 0,
          pending_payments: pending.count ?? 0,
        });
      }

      // ----- Payment requests -----
      case "list_payments": {
        const { data, error } = await supabase
          .from("payment_requests")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200);
        if (error) return json({ error: error.message }, 400);
        return json({ data });
      }
      case "approve_payment": {
        const { id } = body.payload;
        const { data: pr, error: prErr } = await supabase
          .from("payment_requests")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (prErr || !pr) return json({ error: "Request not found" }, 404);
        // Mark approved
        await supabase.from("payment_requests").update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
        }).eq("id", id);
        // Grant premium
        const expires = new Date();
        if (pr.plan === "yearly") expires.setFullYear(expires.getFullYear() + 1);
        else expires.setMonth(expires.getMonth() + 1);
        const { error: upErr } = await supabase.from("device_premium").upsert({
          device_id: pr.device_id,
          is_premium: true,
          granted_at: new Date().toISOString(),
          granted_by: "admin",
          expires_at: expires.toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "device_id" });
        if (upErr) return json({ error: upErr.message }, 400);
        return json({ ok: true });
      }
      case "reject_payment": {
        const { id, note } = body.payload;
        const { data: pr } = await supabase.from("payment_requests").select("device_id").eq("id", id).maybeSingle();
        const { error } = await supabase.from("payment_requests").update({
          status: "rejected",
          note: note || null,
          reviewed_at: new Date().toISOString(),
        }).eq("id", id);
        if (error) return json({ error: error.message }, 400);
        if (pr?.device_id) {
          await supabase.from("device_premium").upsert({
            device_id: pr.device_id,
            is_premium: false,
            is_blocked: true,
            updated_at: new Date().toISOString(),
          }, { onConflict: "device_id" });
        }
        return json({ ok: true });
      }

      // ----- Premium management -----
      case "list_premium": {
        const { data, error } = await supabase
          .from("device_premium")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(500);
        if (error) return json({ error: error.message }, 400);
        return json({ data });
      }
      case "set_premium": {
        const { device_id, is_premium, plan } = body.payload;
        const expires = new Date();
        if (plan === "yearly") expires.setFullYear(expires.getFullYear() + 1);
        else expires.setMonth(expires.getMonth() + 1);
        const { error } = await supabase.from("device_premium").upsert({
          device_id,
          is_premium,
          granted_at: is_premium ? new Date().toISOString() : null,
          granted_by: is_premium ? "admin" : null,
          expires_at: is_premium ? expires.toISOString() : null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "device_id" });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }

      // ----- Settings (admin card etc) -----
      case "get_settings": {
        const { data } = await supabase.from("app_settings").select("*");
        return json({ data });
      }
      case "update_setting": {
        const { key, value } = body.payload;
        const { error } = await supabase.from("app_settings").upsert({
          key, value, updated_at: new Date().toISOString(),
        }, { onConflict: "key" });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }

      // ----- Block / unblock device -----
      case "block_device": {
        const { device_id, blocked } = body.payload;
        const { error } = await supabase.from("device_premium").upsert({
          device_id,
          is_premium: false,
          is_blocked: !!blocked,
          updated_at: new Date().toISOString(),
        }, { onConflict: "device_id" });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }

      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
