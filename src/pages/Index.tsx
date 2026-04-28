import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Landing from "./Landing";

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
  return <Landing />;
};

export default Index;
