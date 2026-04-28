import { useNavigate, useParams } from "react-router-dom";
import { LEVELS, LESSONS_BY_LEVEL, GRAMMAR_BY_LEVEL, LevelCode } from "@/data/levels";
import { useI18n } from "@/contexts/I18nContext";
import { ArrowLeft, BookOpen, GraduationCap, Lock, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LevelDetail = () => {
  const { code } = useParams<{ code: LevelCode }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const level = LEVELS.find((l) => l.code === code);

  if (!level) {
    return <div className="p-6">Level not found</div>;
  }

  const locked = !level.free;
  const lessons = LESSONS_BY_LEVEL[level.code];
  const grammar = GRAMMAR_BY_LEVEL[level.code];

  return (
    <div className="pb-6">
      {/* Hero */}
      <div className={`relative overflow-hidden rounded-b-[2.5rem] px-6 pt-10 pb-10 bg-gradient-to-br ${level.gradient} text-white shadow-glow`}>
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="absolute -right-6 -top-6 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
        <div className="text-7xl mb-2">{level.emoji}</div>
        <h1 className="text-5xl font-extrabold tracking-tight">{level.code}</h1>
        <p className="text-xl font-semibold mt-1">{level.name}</p>
        <p className="text-sm opacity-90 mt-2 max-w-[85%]">{level.description}</p>
      </div>

      {locked && (
        <button
          onClick={() => navigate("/app/premium")}
          className="mx-6 mt-5 w-[calc(100%-3rem)] glass rounded-2xl p-4 flex items-center gap-3 shadow-card border border-accent/30"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div className="text-left flex-1">
            <p className="font-bold text-sm">{t("locked")}</p>
            <p className="text-xs text-muted-foreground">{t("unlock")}</p>
          </div>
        </button>
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
            {lessons.map((l, idx) => (
              <ItemRow
                key={l.id}
                index={idx + 1}
                title={l.title}
                meta={`${l.minutes} ${t("minutes")}`}
                locked={locked}
                onClick={() => locked ? navigate("/app/premium") : null}
              />
            ))}
          </TabsContent>

          <TabsContent value="grammar" className="space-y-2 mt-4">
            {grammar.map((g, idx) => (
              <ItemRow
                key={g.id}
                index={idx + 1}
                title={g.title}
                meta="Grammar"
                locked={locked}
                onClick={() => locked ? navigate("/app/premium") : null}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const ItemRow = ({
  index,
  title,
  meta,
  locked,
  onClick,
}: {
  index: number;
  title: string;
  meta: string;
  locked: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full glass rounded-2xl p-4 flex items-center gap-3 shadow-soft text-left hover:scale-[1.01] transition-transform"
  >
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center font-bold text-primary">
      {index}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold truncate">{title}</p>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Clock className="w-3 h-3" /> {meta}
      </p>
    </div>
    {locked && <Lock className="w-4 h-4 text-muted-foreground" />}
  </button>
);

export default LevelDetail;
