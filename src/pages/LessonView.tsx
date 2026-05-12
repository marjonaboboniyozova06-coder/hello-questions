import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Crown, LogIn } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AiTutor } from "@/components/AiTutor";
import { usePremium } from "@/hooks/usePremium";
import { useSessionTracker } from "@/hooks/useSessionTracker";
import { Button } from "@/components/ui/button";

const LessonView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isPremium } = usePremium();
  const { isLoggedIn, lessonsViewed, ping } = useSessionTracker();
  const [lesson, setLesson] = useState<any>(null);
  const [levelCode, setLevelCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from("lessons").select("*").eq("id", id).maybeSingle();
      setLesson(data);
      if (data?.level_id) {
        const { data: lvl } = await supabase.from("levels").select("code").eq("id", data.level_id).maybeSingle();
        setLevelCode(lvl?.code || "");
      }
      setLoading(false);
      if (data && !tracked) { ping("lesson_view"); setTracked(true); }
    })();
  }, [id, ping, tracked]);

  // Auth gate after 3 free lessons
  const mustAuth = !isLoggedIn && lessonsViewed > 3;

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }
  if (!lesson) return <div className="p-6">Lesson not found</div>;

  const requiresPremium = lesson.is_premium && !isPremium;

  return (
    <div className="pb-6">
      <div className="px-6 pt-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass flex items-center justify-center mb-4">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{lesson.kind}</p>
          {lesson.is_premium && <Crown className="w-3.5 h-3.5 text-amber-500" />}
        </div>
        <h1 className="text-3xl font-extrabold mb-4">{lesson.title}</h1>

        {mustAuth ? (
          <div className="glass rounded-2xl p-6 shadow-soft text-center">
            <LogIn className="w-12 h-12 mx-auto mb-3 text-primary" />
            <p className="font-bold mb-2">Ro'yxatdan o'ting</p>
            <p className="text-sm text-muted-foreground mb-4">3 ta darsni ko'rdingiz! Davom etish uchun bepul akkaunt yarating — progressingiz saqlanadi.</p>
            <Button onClick={() => navigate("/auth?mode=signup")} className="w-full bg-gradient-to-r from-primary via-secondary to-accent shadow-glow">
              Ro'yxatdan o'tish
            </Button>
            <button onClick={() => navigate("/auth")} className="text-xs text-muted-foreground mt-3 underline">Akkauntim bor — kirish</button>
          </div>
        ) : requiresPremium ? (
          <div className="glass rounded-2xl p-6 shadow-soft text-center">
            <Crown className="w-12 h-12 mx-auto mb-3 text-amber-500" />
            <p className="font-bold mb-2">Premium dars</p>
            <p className="text-sm text-muted-foreground mb-4">Bu darsni ochish uchun Premium kerak.</p>
            <Button onClick={() => navigate("/app/premium")} className="w-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-glow">
              Premium olish
            </Button>
          </div>
        ) : (
          <article className="glass rounded-2xl p-5 shadow-soft prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{lesson.content || "_No content yet._"}</ReactMarkdown>
          </article>
        )}
      </div>

      {!requiresPremium && !mustAuth && <AiTutor lesson={{ title: lesson.title, content: lesson.content, level: levelCode }} />}
    </div>
  );
};

export default LessonView;
