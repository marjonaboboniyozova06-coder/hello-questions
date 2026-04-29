import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminCall, adminToken } from "@/lib/admin";
import { useLevels, useLevelData } from "@/hooks/useContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, LogOut, Lock, Unlock, BookOpen, GraduationCap, Trophy, Users } from "lucide-react";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { levels, reload: reloadLevels } = useLevels();
  const [stats, setStats] = useState<any>(null);
  const [selectedCode, setSelectedCode] = useState<string>("");

  useEffect(() => {
    if (!adminToken.get()) {
      navigate("/admin");
      return;
    }
    adminCall("verify").catch(() => {
      adminToken.clear();
      navigate("/admin");
    });
    adminCall<any>("stats").then(setStats).catch(() => {});
  }, [navigate]);

  useEffect(() => {
    if (!selectedCode && levels.length) setSelectedCode(levels[0].code);
  }, [levels, selectedCode]);

  const logout = () => {
    adminToken.clear();
    navigate("/admin");
  };

  const toggleLock = async (lvl: any) => {
    try {
      await adminCall("toggle_level_lock", { id: lvl.id, is_locked: !lvl.is_locked });
      toast({ title: lvl.is_locked ? "Level unlocked" : "Level locked" });
      reloadLevels();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen gradient-mesh pb-12">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Admin</p>
          <h1 className="text-2xl font-extrabold">Linguo Console</h1>
        </div>
        <Button onClick={logout} variant="outline" size="sm" className="rounded-xl">
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 mb-6">
        <StatCard icon={BookOpen} label="Levels" value={stats?.levels ?? "—"} />
        <StatCard icon={GraduationCap} label="Lessons" value={stats?.lessons ?? "—"} />
        <StatCard icon={Trophy} label="Test Qs" value={stats?.questions ?? "—"} />
        <StatCard icon={Users} label="Users" value={stats?.users ?? "—"} />
      </div>

      {/* Levels list with lock toggle */}
      <section className="px-6 mb-6">
        <h2 className="text-lg font-bold mb-3">Levels</h2>
        <div className="space-y-2">
          {levels.map((lvl) => (
            <div key={lvl.id} className="glass rounded-2xl p-4 flex items-center gap-3 shadow-soft">
              <button
                onClick={() => setSelectedCode(lvl.code)}
                className={`flex-1 text-left ${selectedCode === lvl.code ? "text-primary" : ""}`}
              >
                <p className="font-bold">{lvl.code} — {lvl.title}</p>
                <p className="text-xs text-muted-foreground">{lvl.description}</p>
              </button>
              <div className="flex items-center gap-2">
                {lvl.is_locked ? <Lock className="w-4 h-4 text-muted-foreground" /> : <Unlock className="w-4 h-4 text-emerald-500" />}
                <Switch checked={!lvl.is_locked} onCheckedChange={() => toggleLock(lvl)} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Toggle to force-unlock a level for everyone (overrides the test-pass requirement).
        </p>
      </section>

      {/* Per-level content editor */}
      {selectedCode && <LevelEditor code={selectedCode} />}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }: any) => (
  <div className="glass rounded-2xl p-4 shadow-soft">
    <Icon className="w-5 h-5 text-primary mb-1" />
    <p className="text-2xl font-extrabold">{value}</p>
    <p className="text-xs text-muted-foreground font-semibold">{label}</p>
  </div>
);

const LevelEditor = ({ code }: { code: string }) => {
  const { level, lessons, grammar, questions, reload } = useLevelData(code);
  if (!level) return null;

  return (
    <section className="px-6">
      <h2 className="text-lg font-bold mb-3">Editing: {level.code}</h2>
      <Tabs defaultValue="lessons">
        <TabsList className="grid grid-cols-3 w-full bg-muted rounded-2xl h-12 p-1 mb-4">
          <TabsTrigger value="lessons" className="rounded-xl">Lessons</TabsTrigger>
          <TabsTrigger value="grammar" className="rounded-xl">Grammar</TabsTrigger>
          <TabsTrigger value="test" className="rounded-xl">Test</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons">
          <LessonsManager levelId={level.id} kind="lesson" items={lessons} reload={reload} />
        </TabsContent>
        <TabsContent value="grammar">
          <LessonsManager levelId={level.id} kind="grammar" items={grammar} reload={reload} />
        </TabsContent>
        <TabsContent value="test">
          <QuestionsManager levelId={level.id} items={questions} reload={reload} />
        </TabsContent>
      </Tabs>
    </section>
  );
};

const LessonsManager = ({ levelId, kind, items, reload }: any) => {
  const { toast } = useToast();
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const startNew = () => {
    setEditing({ title: "", content: "", kind, level_id: levelId, sort_order: items.length });
    setOpen(true);
  };
  const startEdit = (it: any) => {
    setEditing({ ...it });
    setOpen(true);
  };
  const save = async () => {
    try {
      if (editing.id) {
        await adminCall("update_lesson", editing);
        toast({ title: "Updated" });
      } else {
        await adminCall("create_lesson", editing);
        toast({ title: "Created" });
      }
      setOpen(false);
      reload();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      await adminCall("delete_lesson", { id });
      toast({ title: "Deleted" });
      reload();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <Button onClick={startNew} className="mb-3 rounded-xl">
        <Plus className="w-4 h-4" /> New {kind}
      </Button>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground">No {kind}s yet.</p>}
        {items.map((it: any) => (
          <div key={it.id} className="glass rounded-2xl p-3 flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{it.title}</p>
              <p className="text-xs text-muted-foreground truncate">{(it.content || "").slice(0, 80)}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => startEdit(it)}><Edit2 className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(it.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} {kind}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase">Title</label>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase">Content (markdown / plain text)</label>
                <Textarea
                  rows={10}
                  value={editing.content || ""}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase">Order</label>
                <Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
              </div>
              <Button onClick={save} className="w-full">Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const QuestionsManager = ({ levelId, items, reload }: any) => {
  const { toast } = useToast();
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const startNew = () => {
    setEditing({ question: "", options: ["", "", "", ""], correct_index: 0, level_id: levelId, sort_order: items.length });
    setOpen(true);
  };
  const startEdit = (it: any) => setEditing({ ...it, options: [...it.options] }) || setOpen(true);
  const save = async () => {
    try {
      if (editing.id) {
        await adminCall("update_question", editing);
      } else {
        await adminCall("create_question", editing);
      }
      toast({ title: "Saved" });
      setOpen(false);
      reload();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    try {
      await adminCall("delete_question", { id });
      toast({ title: "Deleted" });
      reload();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <Button onClick={startNew} className="mb-3 rounded-xl">
        <Plus className="w-4 h-4" /> New question
      </Button>
      <p className="text-xs text-muted-foreground mb-3">
        Pass mark is 70%. When learners hit it, the next level unlocks automatically.
      </p>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground">No test questions yet.</p>}
        {items.map((q: any, i: number) => (
          <div key={q.id} className="glass rounded-2xl p-3 flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{i + 1}. {q.question}</p>
              <p className="text-xs text-muted-foreground truncate">
                Correct: {String.fromCharCode(65 + q.correct_index)}. {q.options[q.correct_index]}
              </p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => { setEditing({ ...q, options: [...q.options] }); setOpen(true); }}><Edit2 className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(q.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} question</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase">Question</label>
                <Textarea rows={2} value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} />
              </div>
              {editing.options.map((opt: string, i: number) => (
                <div key={i} className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => setEditing({ ...editing, correct_index: i })}
                    className={`w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center ${
                      editing.correct_index === i ? "bg-emerald-500 text-white" : "bg-muted"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </button>
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const opts = [...editing.options];
                      opts[i] = e.target.value;
                      setEditing({ ...editing, options: opts });
                    }}
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">Tap a letter to mark the correct answer.</p>
              <div>
                <label className="text-xs font-bold uppercase">Order</label>
                <Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
              </div>
              <Button onClick={save} className="w-full">Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
