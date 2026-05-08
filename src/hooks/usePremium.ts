import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/device";

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const deviceId = getDeviceId();

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("payments", {
        body: { action: "check_premium", device_id: deviceId },
      });
      if (!error) {
        setIsPremium(!!data?.is_premium);
        setIsBlocked(!!data?.is_blocked);
      }
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    reload();
    const t = setInterval(reload, 15000);
    return () => clearInterval(t);
  }, [reload]);

  return { isPremium, isBlocked, loading, reload };
}
