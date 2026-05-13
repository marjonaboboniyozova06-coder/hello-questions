import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Onboarding from "./Onboarding";

const Index = () => {
  const onboarded = typeof window !== "undefined" && localStorage.getItem("linguo-onboarded") === "1";
  const [authChecked, setAuthChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    if (!onboarded) return;
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setAuthChecked(true);
    });
  }, [onboarded]);

  if (!onboarded) return <Onboarding />;
  if (!authChecked) return <div className="min-h-screen gradient-mesh" />;
  if (!hasSession) return <Navigate to="/auth" replace />;
  return <Navigate to="/app" replace />;
};

export default Index;
