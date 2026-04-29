
-- Levels (darajalar)
CREATE TABLE public.levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_locked BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lessons (darslar)
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID NOT NULL REFERENCES public.levels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  kind TEXT NOT NULL DEFAULT 'lesson', -- 'lesson' | 'grammar'
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Final test questions per level
CREATE TABLE public.test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID NOT NULL REFERENCES public.levels(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_index INT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Anonymous device-based progress
CREATE TABLE public.device_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  level_code TEXT NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  score INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(device_id, level_code)
);

-- Admin sessions (simple token table for the single admin login)
CREATE TABLE public.admin_sessions (
  token TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days')
);

-- RLS
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Public read for content
CREATE POLICY "Anyone can read levels" ON public.levels FOR SELECT USING (true);
CREATE POLICY "Anyone can read lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Anyone can read test_questions" ON public.test_questions FOR SELECT USING (true);

-- Device progress: anyone can read/write (device-scoped on client; not sensitive)
CREATE POLICY "Anyone can read progress" ON public.device_progress FOR SELECT USING (true);
CREATE POLICY "Anyone can insert progress" ON public.device_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update progress" ON public.device_progress FOR UPDATE USING (true);

-- admin_sessions: no client access (edge function uses service role)
CREATE POLICY "No client read sessions" ON public.admin_sessions FOR SELECT USING (false);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_levels_updated BEFORE UPDATE ON public.levels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_lessons_updated BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_questions_updated BEFORE UPDATE ON public.test_questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_progress_updated BEFORE UPDATE ON public.device_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed levels (A1 unlocked, rest locked)
INSERT INTO public.levels (code, title, description, sort_order, is_locked) VALUES
  ('A1', 'Beginner', 'Start your English journey', 1, false),
  ('A2', 'Elementary', 'Build basic skills', 2, true),
  ('B1', 'Intermediate', 'Communicate with confidence', 3, true),
  ('B2', 'Upper Intermediate', 'Express yourself fluently', 4, true),
  ('C1', 'Advanced', 'Master the language', 5, true);
