import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { AppShell } from "@/components/AppShell";

import Index from "./pages/Index";
import Home from "./pages/Home";
import Levels from "./pages/Levels";
import LevelDetail from "./pages/LevelDetail";
import LessonView from "./pages/LessonView";
import LevelTest from "./pages/LevelTest";
import Premium from "./pages/Premium";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <I18nProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/app" element={<AppShell />}>
                <Route index element={<Home />} />
                <Route path="levels" element={<Levels />} />
                <Route path="level/:code" element={<LevelDetail />} />
                <Route path="lesson/:id" element={<LessonView />} />
                <Route path="test/:code" element={<LevelTest />} />
                <Route path="premium" element={<Premium />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/panel" element={<AdminPanel />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </I18nProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
