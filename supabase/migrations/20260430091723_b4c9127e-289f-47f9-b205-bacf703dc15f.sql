-- Premium status per device + payment requests
CREATE TABLE IF NOT EXISTS public.device_premium (
  device_id text PRIMARY KEY,
  is_premium boolean NOT NULL DEFAULT false,
  granted_at timestamptz,
  granted_by text,
  expires_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.device_premium ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read own/all premium" ON public.device_premium FOR SELECT USING (true);
CREATE POLICY "Anyone can insert premium row" ON public.device_premium FOR INSERT WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  method text NOT NULL,
  card_last4 text,
  card_holder text,
  plan text NOT NULL,
  amount_uzs integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert payment requests" ON public.payment_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read own payment requests" ON public.payment_requests FOR SELECT USING (true);

-- Add metadata columns to lessons for premium gating
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false;
ALTER TABLE public.levels ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false;