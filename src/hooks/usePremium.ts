import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/device";

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const deviceId = getDeviceId();

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("payments", {
        body: { action: "check_premium", device_id: deviceId },
      });
      if (!error) setIsPremium(!!data?.is_premium);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    reload();
    // Re-check periodically (admin might have approved)
    const t = setInterval(reload, 30000);
    return () => clearInterval(t);
  }, [reload]);

  return { isPremium, loading, reload };
}
