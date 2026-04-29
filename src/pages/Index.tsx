import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Onboarding from "./Onboarding";

const Index = () => {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }
  if (authed) return <Navigate to="/app" replace />;

  // First-time visitors see onboarding; returning visitors go straight to auth
  const onboarded = typeof window !== "undefined" && localStorage.getItem("linguo-onboarded") === "1";
  if (onboarded) return <Navigate to="/auth" replace />;
  return <Onboarding />;
};

export default Index;
