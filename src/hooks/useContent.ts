import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/device";

export type LevelRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_locked: boolean;
};

export type LessonRow = {
  id: string;
  level_id: string;
  title: string;
  content: string | null;
  kind: "lesson" | "grammar" | string;
  sort_order: number;
};

export type QuestionRow = {
  id: string;
  level_id: string;
  question: string;
  options: string[];
  correct_index: number;
  sort_order: number;
};

export function useLevels() {
  const [levels, setLevels] = useState<LevelRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("levels").select("*").order("sort_order");
    setLevels((data as LevelRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { levels, loading, reload };
}

export function useLevelData(code?: string) {
  const [level, setLevel] = useState<LevelRow | null>(null);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [grammar, setGrammar] = useState<LessonRow[]>([]);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!code) return;
    setLoading(true);
    const { data: lvl } = await supabase.from("levels").select("*").eq("code", code).maybeSingle();
    if (!lvl) {
      setLevel(null);
      setLoading(false);
      return;
    }
    setLevel(lvl as LevelRow);
    const [{ data: ls }, { data: qs }] = await Promise.all([
      supabase.from("lessons").select("*").eq("level_id", lvl.id).order("sort_order"),
      supabase.from("test_questions").select("*").eq("level_id", lvl.id).order("sort_order"),
    ]);
    const all = (ls as LessonRow[]) || [];
    setLessons(all.filter((l) => l.kind === "lesson"));
    setGrammar(all.filter((l) => l.kind === "grammar"));
    setQuestions((qs as any) || []);
    setLoading(false);
  }, [code]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { level, lessons, grammar, questions, loading, reload };
}

export function useProgress() {
  const [passed, setPassed] = useState<Set<string>>(new Set());
  const deviceId = getDeviceId();

  const reload = useCallback(async () => {
    const { data } = await supabase
      .from("device_progress")
      .select("level_code, passed")
      .eq("device_id", deviceId);
    const s = new Set<string>();
    (data || []).forEach((r: any) => r.passed && s.add(r.level_code));
    setPassed(s);
  }, [deviceId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const markPassed = useCallback(
    async (levelCode: string, score: number) => {
      await supabase.from("device_progress").upsert(
        { device_id: deviceId, level_code: levelCode, passed: true, score, updated_at: new Date().toISOString() },
        { onConflict: "device_id,level_code" }
      );
      await reload();
    },
    [deviceId, reload]
  );

  return { passed, markPassed, reload };
}

// Determine if a level is unlocked for the current device
// Rule: A1 (lowest sort_order, not locked by admin) is open.
// Subsequent levels open only if previous was passed AND not admin-locked.
export function computeUnlocked(levels: LevelRow[], passed: Set<string>) {
  const map: Record<string, boolean> = {};
  const sorted = [...levels].sort((a, b) => a.sort_order - b.sort_order);
  let prevPassed = true; // first level is unlocked by default
  for (const lvl of sorted) {
    const adminUnlocked = !lvl.is_locked;
    // unlocked if admin force-unlocked it OR (it's the first one) OR previous level passed
    const open = adminUnlocked || prevPassed;
    map[lvl.code] = open;
    prevPassed = passed.has(lvl.code);
  }
  return map;
}
