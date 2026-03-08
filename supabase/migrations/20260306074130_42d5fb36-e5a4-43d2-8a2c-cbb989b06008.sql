
-- Table to store OTP codes for password reset
CREATE TABLE public.password_reset_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  otp_code text NOT NULL,
  used boolean NOT NULL DEFAULT false,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '15 minutes'),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Track daily OTP attempts
CREATE TABLE public.otp_daily_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  attempt_date date NOT NULL DEFAULT CURRENT_DATE,
  attempt_count integer NOT NULL DEFAULT 1,
  UNIQUE(email, attempt_date)
);

-- RLS
ALTER TABLE public.password_reset_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_daily_limits ENABLE ROW LEVEL SECURITY;

-- Allow anon to insert (for requesting OTP)
CREATE POLICY "Allow anon insert otp" ON public.password_reset_otps FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon select otp" ON public.password_reset_otps FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon update otp" ON public.password_reset_otps FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Allow anon insert limit" ON public.otp_daily_limits FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon select limit" ON public.otp_daily_limits FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon update limit" ON public.otp_daily_limits FOR UPDATE TO anon, authenticated USING (true);
