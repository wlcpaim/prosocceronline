ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS payer_email text,
  ADD COLUMN IF NOT EXISTS pix_code text;