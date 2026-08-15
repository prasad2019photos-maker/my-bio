-- Add legal policy fields to site_settings
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS privacy_policy_title text NOT NULL DEFAULT 'Privacy Policy',
  ADD COLUMN IF NOT EXISTS privacy_policy_content text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS privacy_policy_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS terms_title text NOT NULL DEFAULT 'Terms & Conditions',
  ADD COLUMN IF NOT EXISTS terms_content text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS terms_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS refund_title text NOT NULL DEFAULT 'Refund Policy',
  ADD COLUMN IF NOT EXISTS refund_content text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS refund_updated_at timestamptz;

-- Ensure permissions are consistent (settings table policies already allow admins to manage)
-- No additional RLS changes required for SELECT (already public).
