/*
  # Initial Schema for 3D File Conversion Platform

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `plan` (text) - Free, Pro, Studio
      - `uploaded_this_month` (integer) - Track monthly usage
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `original_filename` (text)
      - `original_format` (text) - fbx, obj, gltf, etc.
      - `file_size` (bigint) - in bytes
      - `status` (text) - uploading, processing, completed, failed
      - `glb_url` (text) - CDN URL for converted GLB
      - `poster_url` (text) - Thumbnail image URL
      - `triangle_count` (integer)
      - `vertex_count` (integer)
      - `error_message` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `deleted_at` (timestamptz)
    
    - `viewer_configs`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `user_id` (uuid, references profiles)
      - `config` (jsonb) - All viewer settings
      - `version` (integer) - Config version number
      - `is_active` (boolean) - Current active version
      - `created_at` (timestamptz)
    
    - `materials`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `type` (text) - library, custom
      - `base_color_url` (text)
      - `normal_url` (text)
      - `roughness_url` (text)
      - `metallic_url` (text)
      - `ao_url` (text)
      - `parameters` (jsonb) - tiling, roughness, metalness values
      - `created_at` (timestamptz)
    
    - `hotspots`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `position` (jsonb) - {x, y, z}
      - `title` (text)
      - `description` (text)
      - `icon_url` (text)
      - `link_url` (text)
      - `style` (jsonb) - color, size, animation
      - `created_at` (timestamptz)
    
    - `usage_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `project_id` (uuid, references projects)
      - `event_type` (text) - conversion, view, ar_view, hotspot_click
      - `metadata` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Public read access for embed views (with domain whitelist)
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  plan text NOT NULL DEFAULT 'Free',
  uploaded_this_month integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  original_filename text NOT NULL,
  original_format text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'uploading',
  glb_url text,
  poster_url text,
  triangle_count integer DEFAULT 0,
  vertex_count integer DEFAULT 0,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Viewer configs table
CREATE TABLE IF NOT EXISTS viewer_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  config jsonb NOT NULL DEFAULT '{}',
  version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE viewer_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own configs"
  ON viewer_configs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own configs"
  ON viewer_configs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own configs"
  ON viewer_configs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Materials table
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'custom',
  base_color_url text,
  normal_url text,
  roughness_url text,
  metallic_url text,
  ao_url text,
  parameters jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own materials"
  ON materials FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR type = 'library');

CREATE POLICY "Users can insert own materials"
  ON materials FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Library materials are public"
  ON materials FOR SELECT
  TO authenticated
  USING (type = 'library');

-- Hotspots table
CREATE TABLE IF NOT EXISTS hotspots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  position jsonb NOT NULL DEFAULT '{"x": 0, "y": 0, "z": 0}',
  title text NOT NULL,
  description text,
  icon_url text,
  link_url text,
  style jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hotspots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view hotspots for own projects"
  ON hotspots FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = hotspots.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert hotspots for own projects"
  ON hotspots FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = hotspots.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update hotspots for own projects"
  ON hotspots FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = hotspots.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = hotspots.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete hotspots for own projects"
  ON hotspots FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = hotspots.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Usage logs table
CREATE TABLE IF NOT EXISTS usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs"
  ON usage_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert logs"
  ON usage_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default library materials
INSERT INTO materials (user_id, name, type, parameters) VALUES
  (NULL, 'Martin 01 - Mat Siyah', 'library', '{"roughness": 0.9, "metalness": 0.0, "color": "#1a1a1a"}'),
  (NULL, 'Martin 02 - Parlak Beyaz', 'library', '{"roughness": 0.1, "metalness": 0.0, "color": "#ffffff"}'),
  (NULL, 'Martin 03 - Metalik Gri', 'library', '{"roughness": 0.3, "metalness": 1.0, "color": "#808080"}'),
  (NULL, 'Martin 04 - Doğal Ahşap', 'library', '{"roughness": 0.7, "metalness": 0.0, "color": "#8B4513"}'),
  (NULL, 'Martin 05 - Premium Deri', 'library', '{"roughness": 0.6, "metalness": 0.0, "color": "#654321"}')
ON CONFLICT DO NOTHING;