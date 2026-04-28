import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export const AppShell = () => {
  return (
    <div className="min-h-screen gradient-mesh">
      <main className="mx-auto max-w-md pb-28 safe-top">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
