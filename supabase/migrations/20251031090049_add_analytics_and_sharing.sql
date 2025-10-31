/*
  # Add Analytics and Project Sharing

  1. New Tables
    - `project_views`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key)
      - `viewer_ip` (text)
      - `user_agent` (text)
      - `referrer` (text)
      - `country` (text)
      - `city` (text)
      - `device_type` (text)
      - `viewed_at` (timestamptz)

    - `project_shares`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key)
      - `share_token` (text, unique)
      - `created_by` (uuid, foreign key)
      - `expires_at` (timestamptz)
      - `is_active` (boolean)
      - `max_views` (integer)
      - `current_views` (integer)
      - `created_at` (timestamptz)

  2. Updates
    - Add `is_public` column to projects table
    - Add `public_url` column to projects table

  3. Security
    - Enable RLS on both tables
    - Add appropriate policies
*/

CREATE TABLE IF NOT EXISTS project_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  viewer_ip text,
  user_agent text,
  referrer text,
  country text,
  city text,
  device_type text,
  viewed_at timestamptz DEFAULT now()
);

ALTER TABLE project_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project owners can view analytics"
  ON project_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_views.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert views"
  ON project_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_project_views_project_id ON project_views(project_id);
CREATE INDEX IF NOT EXISTS idx_project_views_viewed_at ON project_views(viewed_at DESC);

CREATE TABLE IF NOT EXISTS project_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  share_token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  max_views integer,
  current_views integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE project_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shares"
  ON project_shares
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create shares for own projects"
  ON project_shares
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_shares.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own shares"
  ON project_shares
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own shares"
  ON project_shares
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS idx_project_shares_token ON project_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_project_shares_project_id ON project_shares(project_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE projects ADD COLUMN is_public boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'public_url'
  ) THEN
    ALTER TABLE projects ADD COLUMN public_url text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_projects_is_public ON projects(is_public) WHERE is_public = true;
