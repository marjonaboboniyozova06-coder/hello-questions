import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLevelData, useProgress } from "@/hooks/useContent";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PASS_PERCENT = 70;

const LevelTest = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { level, questions, loading } = useLevelData(code);
  const { markPassed } = useProgress();

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }
  if (!level) return <div className="p-6">Level not found</div>;
  if (questions.length === 0) {
    return (
      <div className="p-6 pt-10">
        <p className="text-muted-foreground">No test questions yet for this level.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">Back</Button>
      </div>
    );
  }

  const q = questions[idx];
  const total = questions.length;
  const correct = questions.reduce((acc, qq) => acc + (answers[qq.id] === qq.correct_index ? 1 : 0), 0);
  const percent = Math.round((correct / total) * 100);
  const passed = percent >= PASS_PERCENT;

  const select = (i: number) => setAnswers((a) => ({ ...a, [q.id]: i }));

  const submit = async () => {
    setDone(true);
    if (passed) {
      await markPassed(level.code, percent);
      toast({ title: "🎉 Passed!", description: `Score: ${percent}%. Next level unlocked.` });
    } else {
      toast({ title: "Not enough", description: `Score: ${percent}%. Need ${PASS_PERCENT}%+`, variant: "destructive" });
    }
  };

  if (done) {
    return (
      <div className="px-6 pt-10 pb-6 text-center">
        <div className={`mx-auto w-24 h-24 rounded-3xl flex items-center justify-center mb-4 shadow-glow bg-gradient-to-br ${
          passed ? "from-emerald-400 to-teal-600" : "from-rose-400 to-red-600"
        }`}>
          {passed ? <Trophy className="w-12 h-12 text-white" /> : <XCircle className="w-12 h-12 text-white" />}
        </div>
        <h1 className="text-3xl font-extrabold">{passed ? "Passed!" : "Try again"}</h1>
        <p className="text-5xl font-extrabold my-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{percent}%</p>
        <p className="text-muted-foreground">{correct} / {total} correct</p>
        <div className="mt-8 space-y-3">
          <Button onClick={() => navigate(`/app/level/${level.code}`)} className="w-full h-12 rounded-2xl">
            Back to {level.code}
          </Button>
          {passed && (
            <Button onClick={() => navigate("/app/levels")} variant="outline" className="w-full h-12 rounded-2xl">
              Choose next level
            </Button>
          )}
        </div>
      </div>
    );
  }

  const selected = answers[q.id];

  return (
    <div className="px-6 pt-10 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: `${((idx + 1) / total) * 100}%` }} />
        </div>
        <span className="text-xs font-bold text-muted-foreground">{idx + 1}/{total}</span>
      </div>

      <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">{level.code} · Final test</p>
      <h2 className="text-2xl font-extrabold mb-6 leading-tight">{q.question}</h2>

      <div className="space-y-3">
        {q.options.map((opt, i) => {
          const active = selected === i;
          return (
            <button
              key={i}
              onClick={() => select(i)}
              className={`w-full text-left rounded-2xl p-4 border-2 transition-all flex items-center gap-3 ${
                active
                  ? "border-primary bg-primary/10"
                  : "border-border glass"
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${
                active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>{String.fromCharCode(65 + i)}</div>
              <span className="flex-1 font-medium">{opt}</span>
              {active && <CheckCircle2 className="w-5 h-5 text-primary" />}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {idx < total - 1 ? (
          <Button
            disabled={selected === undefined}
            onClick={() => setIdx(idx + 1)}
            className="w-full h-14 rounded-2xl text-base font-bold"
          >
            Next
          </Button>
        ) : (
          <Button
            disabled={selected === undefined}
            onClick={submit}
            className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-primary via-secondary to-accent shadow-glow"
          >
            Submit test
          </Button>
        )}
      </div>
    </div>
  );
};

export default LevelTest;
