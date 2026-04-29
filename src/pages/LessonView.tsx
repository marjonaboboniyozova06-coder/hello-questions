import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

const LessonView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase.from("lessons").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setLesson(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }
  if (!lesson) return <div className="p-6">Lesson not found</div>;

  return (
    <div className="pb-6">
      <div className="px-6 pt-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass flex items-center justify-center mb-4">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{lesson.kind}</p>
        <h1 className="text-3xl font-extrabold mb-4">{lesson.title}</h1>
        <article className="glass rounded-2xl p-5 shadow-soft prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
          {lesson.content || "No content yet."}
        </article>
      </div>
    </div>
  );
};

export default LessonView;
