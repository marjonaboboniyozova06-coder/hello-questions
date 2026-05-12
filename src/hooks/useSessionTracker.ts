import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/device";

const FREE_LESSON_LIMIT = 3;

export function useSessionTracker() {
  const [session, setSession] = useState<any>(null);
  const [lessonsViewed, setLessonsViewed] = useState(0);
  const deviceId = getDeviceId();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  const ping = useCallback(async (action: "ping" | "lesson_view") => {
    try {
      const { data } = await supabase.functions.invoke("track", {
        body: {
          action, device_id: deviceId,
          email: session?.user?.email,
          user_id: session?.user?.id,
          user_agent: navigator.userAgent.slice(0, 200),
        },
      });
      if (data?.lessons_viewed != null) setLessonsViewed(data.lessons_viewed);
    } catch {}
  }, [deviceId, session]);

  // Initial ping + reload count
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("device_sessions").select("lessons_viewed").eq("device_id", deviceId).maybeSingle();
      setLessonsViewed(data?.lessons_viewed || 0);
      ping("ping");
    })();
  }, [deviceId, ping]);

  const isLoggedIn = !!session;
  const needsAuth = !isLoggedIn && lessonsViewed >= FREE_LESSON_LIMIT;

  return { session, isLoggedIn, lessonsViewed, needsAuth, ping };
}
