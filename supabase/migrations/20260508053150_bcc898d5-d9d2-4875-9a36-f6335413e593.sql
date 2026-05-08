-- Settings table for admin card / merchant info
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.app_settings FOR SELECT USING (true);

-- Block list (rejected users can't retry / are flagged)
ALTER TABLE public.device_premium ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false;

-- Allow updates on device_premium and payment_requests via service role only (already uses SR in edge functions)
DO $$ BEGIN
  CREATE POLICY "Anyone can update device_premium" ON public.device_premium FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can update payment_requests" ON public.payment_requests FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed default admin card row
INSERT INTO public.app_settings(key, value) VALUES ('admin_card', '{"card_number":"","card_holder":"","bank":"Humo","phone":""}')
ON CONFLICT (key) DO NOTHING;