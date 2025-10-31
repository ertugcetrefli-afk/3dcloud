/*
  # Add API Keys to Profiles

  1. Updates
    - Add `api_key` column to profiles table
    - Add unique constraint on api_key
    - Add `api_requests_this_month` counter

  2. Security
    - API keys are unique and indexed
    - Only Studio plan users can use API
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'api_key'
  ) THEN
    ALTER TABLE profiles ADD COLUMN api_key text UNIQUE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'api_requests_this_month'
  ) THEN
    ALTER TABLE profiles ADD COLUMN api_requests_this_month integer DEFAULT 0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_api_key ON profiles(api_key) WHERE api_key IS NOT NULL;
