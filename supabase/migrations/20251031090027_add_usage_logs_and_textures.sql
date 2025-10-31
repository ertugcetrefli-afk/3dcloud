/*
  # Add Usage Logs and Textures Storage

  1. New Tables
    - `usage_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `project_id` (uuid, foreign key to projects)
      - `event_type` (text) - 'conversion', 'view', 'download', 'api_call'
      - `metadata` (jsonb) - Additional event data
      - `created_at` (timestamptz)

  2. Storage
    - Create `textures` bucket for material textures
    - Configure RLS policies for textures bucket

  3. Security
    - Enable RLS on usage_logs table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage logs"
  ON usage_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage logs"
  ON usage_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_project_id ON usage_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at DESC);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'textures',
  'textures',
  true,
  52428800,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload textures"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'textures');

CREATE POLICY "Anyone can view textures"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'textures');

CREATE POLICY "Users can delete own textures"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'textures' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
