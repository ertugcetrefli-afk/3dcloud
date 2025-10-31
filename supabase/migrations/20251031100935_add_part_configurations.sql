/*
  # Add Part Configurations for 3D Models

  1. New Tables
    - `part_configurations`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to projects)
      - `part_id` (text) - Identifier for the part
      - `part_name` (text) - Display name of the part
      - `color` (text) - Hex color code
      - `visible` (boolean) - Visibility state
      - `material_id` (uuid, nullable, foreign key to materials)
      - `position` (integer) - Order position
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `part_configurations` table
    - Add policy for users to manage their own part configurations

  3. Indexes
    - Add index on project_id for faster queries
*/

CREATE TABLE IF NOT EXISTS part_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  part_id text NOT NULL,
  part_name text NOT NULL,
  color text DEFAULT '#808080',
  visible boolean DEFAULT true,
  material_id uuid REFERENCES materials(id) ON DELETE SET NULL,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE part_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view part configurations for their projects"
  ON part_configurations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = part_configurations.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert part configurations for their projects"
  ON part_configurations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = part_configurations.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update part configurations for their projects"
  ON part_configurations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = part_configurations.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = part_configurations.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete part configurations for their projects"
  ON part_configurations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = part_configurations.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_part_configurations_project_id ON part_configurations(project_id);
CREATE INDEX IF NOT EXISTS idx_part_configurations_material_id ON part_configurations(material_id);

CREATE OR REPLACE FUNCTION update_part_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_part_configurations_updated_at ON part_configurations;

CREATE TRIGGER update_part_configurations_updated_at
  BEFORE UPDATE ON part_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_part_configurations_updated_at();
