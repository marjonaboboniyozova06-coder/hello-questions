import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminCall, adminToken } from "@/lib/admin";
import { useLevels, useLevelData } from "@/hooks/useContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, LogOut, Lock, Unlock, BookOpen, GraduationCap, Trophy, Users, Crown, CreditCard, Check, X } from "lucide-react";

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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 px-6 mb-6">
        <StatCard icon={BookOpen} label="Levels" value={stats?.levels ?? "—"} />
        <StatCard icon={GraduationCap} label="Lessons" value={stats?.lessons ?? "—"} />
        <StatCard icon={Trophy} label="Test Qs" value={stats?.questions ?? "—"} />
        <StatCard icon={Users} label="Users" value={stats?.users ?? "—"} />
        <StatCard icon={Crown} label="Premium" value={stats?.premium ?? "—"} />
        <StatCard icon={CreditCard} label="Pending" value={stats?.pending_payments ?? "—"} />
      </div>

      <Tabs defaultValue="content" className="px-6">
        <TabsList className="grid grid-cols-4 w-full bg-muted rounded-2xl h-12 p-1 mb-4">
          <TabsTrigger value="content" className="rounded-xl">Content</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-xl">Payments</TabsTrigger>
          <TabsTrigger value="premium" className="rounded-xl">Premium</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl">Card</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          {/* Levels list with lock toggle */}
          <h2 className="text-lg font-bold mb-3">Levels</h2>
          <div className="space-y-2 mb-6">
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
          {selectedCode && <LevelEditor code={selectedCode} />}
        </TabsContent>

        <TabsContent value="payments">
          <PaymentsManager />
        </TabsContent>

        <TabsContent value="premium">
          <PremiumManager />
        </TabsContent>
      </Tabs>
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
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={!!editing.is_premium}
                  onCheckedChange={(v) => setEditing({ ...editing, is_premium: v })}
                />
                <Crown className="w-4 h-4 text-amber-500" /> Premium only
              </label>
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
  const startEdit = (it: any) => { setEditing({ ...it, options: [...it.options] }); setOpen(true); };
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

const PaymentsManager = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const load = () => adminCall<any>("list_payments").then((r) => setRequests(r?.data || [])).catch(() => {});
  useEffect(() => { load(); }, []);
  const act = async (id: string, status: "approved" | "rejected") => {
    try {
      await adminCall(status === "approved" ? "approve_payment" : "reject_payment", { id });
      toast({ title: status === "approved" ? "Approved & premium granted" : "Rejected" });
      load();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };
  return (
    <div className="space-y-2">
      {requests.length === 0 && <p className="text-sm text-muted-foreground">No payment requests.</p>}
      {requests.map((r) => (
        <div key={r.id} className="glass rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-bold">{r.method?.toUpperCase()} • {r.plan}</p>
              <p className="text-xs text-muted-foreground">{r.amount_uzs?.toLocaleString()} UZS • ****{r.card_last4 || "----"}</p>
              <p className="text-xs text-muted-foreground truncate">device: {r.device_id}</p>
            </div>
            <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
              r.status === "pending" ? "bg-amber-500/20 text-amber-600" :
              r.status === "approved" ? "bg-emerald-500/20 text-emerald-600" :
              "bg-destructive/20 text-destructive"
            }`}>{r.status}</span>
          </div>
          {r.status === "pending" && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => act(r.id, "approved")} className="flex-1 rounded-xl">
                <Check className="w-4 h-4" /> Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => act(r.id, "rejected")} className="flex-1 rounded-xl">
                <X className="w-4 h-4" /> Reject
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const PremiumManager = () => {
  const { toast } = useToast();
  const [deviceId, setDeviceId] = useState("");
  const [list, setList] = useState<any[]>([]);
  const load = () => adminCall<any>("list_premium").then((r) => setList(r?.data || [])).catch(() => {});
  useEffect(() => { load(); }, []);
  const set = async (device_id: string, is_premium: boolean) => {
    try {
      await adminCall("set_premium", { device_id, is_premium });
      toast({ title: is_premium ? "Premium granted" : "Premium revoked" });
      load();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };
  return (
    <div className="space-y-3">
      <div className="glass rounded-2xl p-4 shadow-soft">
        <label className="text-xs font-bold uppercase">Grant by Device ID</label>
        <div className="flex gap-2 mt-2">
          <Input value={deviceId} onChange={(e) => setDeviceId(e.target.value)} placeholder="device_id..." />
          <Button onClick={() => deviceId && set(deviceId, true)} className="rounded-xl">
            <Crown className="w-4 h-4" /> Grant
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {list.length === 0 && <p className="text-sm text-muted-foreground">No premium devices.</p>}
        {list.map((d) => (
          <div key={d.device_id} className="glass rounded-2xl p-3 flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{d.device_id}</p>
              <p className="text-xs text-muted-foreground">{d.is_premium ? "Active" : "Inactive"}{d.expires_at ? ` • exp ${new Date(d.expires_at).toLocaleDateString()}` : ""}</p>
            </div>
            <Switch checked={!!d.is_premium} onCheckedChange={(v) => set(d.device_id, v)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
