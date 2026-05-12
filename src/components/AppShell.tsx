import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { PoliFab } from "./PoliFab";
import { useSessionTracker } from "@/hooks/useSessionTracker";

export const AppShell = () => {
  // Tracks visitor session + lesson count (for the auth gate)
  useSessionTracker();
  return (
    <div className="min-h-screen gradient-mesh">
      <main className="mx-auto max-w-md pb-28 safe-top">
        <Outlet />
      </main>
      <PoliFab />
      <BottomNav />
    </div>
  );
};
