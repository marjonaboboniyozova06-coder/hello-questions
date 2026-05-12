CREATE TABLE IF NOT EXISTS public.device_sessions (
  device_id text PRIMARY KEY,
  first_seen timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now(),
  lessons_viewed integer NOT NULL DEFAULT 0,
  email text,
  user_id uuid,
  user_agent text
);

ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read device_sessions" ON public.device_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert device_sessions" ON public.device_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update device_sessions" ON public.device_sessions FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_device_sessions_last_seen ON public.device_sessions (last_seen DESC);