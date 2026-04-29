import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { useLevelData, useLevels, useProgress, computeUnlocked } from "@/hooks/useContent";
import { ArrowLeft, BookOpen, GraduationCap, Lock, ChevronRight, Trophy, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GRADIENTS: Record<string, string> = {
  A1: "from-emerald-400 via-teal-500 to-cyan-600",
  A2: "from-sky-400 via-blue-500 to-indigo-600",
  B1: "from-violet-400 via-purple-500 to-fuchsia-600",
  B2: "from-amber-400 via-orange-500 to-red-500",
  C1: "from-rose-400 via-pink-500 to-red-700",
};

const LevelDetail = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { level, lessons, grammar, questions, loading } = useLevelData(code);
  const { levels } = useLevels();
  const { passed } = useProgress();

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }
  if (!level) return <div className="p-6">Level not found</div>;

  const unlocked = computeUnlocked(levels, passed);
  const open = unlocked[level.code];
  const isPassed = passed.has(level.code);
  const grad = GRADIENTS[level.code] ?? "from-primary to-secondary";

  return (
    <div className="pb-6">
      <div className={`relative overflow-hidden rounded-b-[2.5rem] px-6 pt-10 pb-10 bg-gradient-to-br ${grad} text-white shadow-glow`}>
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-6">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="absolute -right-6 -top-6 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
        <h1 className="text-5xl font-extrabold tracking-tight">{level.code}</h1>
        <p className="text-xl font-semibold mt-1">{level.title}</p>
        <p className="text-sm opacity-90 mt-2 max-w-[85%]">{level.description}</p>
      </div>

      {!open && (
        <div className="mx-6 mt-5 glass rounded-2xl p-4 flex items-center gap-3 shadow-card border border-accent/30">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div className="text-left flex-1">
            <p className="font-bold text-sm">{t("locked")}</p>
            <p className="text-xs text-muted-foreground">Pass the previous level to unlock.</p>
          </div>
        </div>
      )}

      <div className="px-6 mt-6">
        <Tabs defaultValue="lessons">
          <TabsList className="grid grid-cols-2 w-full bg-muted rounded-2xl h-12 p-1">
            <TabsTrigger value="lessons" className="rounded-xl gap-2">
              <BookOpen className="w-4 h-4" /> {t("lessons")}
            </TabsTrigger>
            <TabsTrigger value="grammar" className="rounded-xl gap-2">
              <GraduationCap className="w-4 h-4" /> {t("grammar")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="space-y-2 mt-4">
            {lessons.length === 0 && <Empty msg="No lessons yet. Admin will add soon." />}
            {lessons.map((l, idx) => (
              <ItemRow
                key={l.id}
                index={idx + 1}
                title={l.title}
                meta="Lesson"
                disabled={!open}
                onClick={() => open && navigate(`/app/lesson/${l.id}`)}
              />
            ))}
          </TabsContent>

          <TabsContent value="grammar" className="space-y-2 mt-4">
            {grammar.length === 0 && <Empty msg="No grammar yet. Admin will add soon." />}
            {grammar.map((g, idx) => (
              <ItemRow
                key={g.id}
                index={idx + 1}
                title={g.title}
                meta="Grammar"
                disabled={!open}
                onClick={() => open && navigate(`/app/lesson/${g.id}`)}
              />
            ))}
          </TabsContent>
        </Tabs>

        {open && questions.length > 0 && (
          <button
            onClick={() => navigate(`/app/test/${level.code}`)}
            className="w-full mt-6 rounded-2xl p-5 bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground shadow-glow flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              {isPassed ? <CheckCircle2 className="w-6 h-6" /> : <Trophy className="w-6 h-6" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs uppercase font-bold tracking-wider opacity-90">Final test</p>
              <p className="font-extrabold">{isPassed ? "Re-take test" : "Take test to unlock next level"}</p>
            </div>
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

const Empty = ({ msg }: { msg: string }) => (
  <div className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">{msg}</div>
);

const ItemRow = ({
  index, title, meta, disabled, onClick,
}: { index: number; title: string; meta: string; disabled: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full glass rounded-2xl p-4 flex items-center gap-3 shadow-soft text-left transition-transform ${
      disabled ? "opacity-60" : "hover:scale-[1.01]"
    }`}
  >
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center font-bold text-primary">
      {index}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold truncate">{title}</p>
      <p className="text-xs text-muted-foreground">{meta}</p>
    </div>
    {disabled ? <Lock className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
  </button>
);

export default LevelDetail;
