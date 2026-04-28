import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<"loading" | "in" | "out">("loading");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setState(session ? "in" : "out");
    });
    supabase.auth.getSession().then(({ data }) => setState(data.session ? "in" : "out"));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (state === "loading") {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }
  if (state === "out") return <Navigate to="/auth" replace />;
  return <>{children}</>;
};
