/*
  # Fix Database Security and Performance Issues

  ## Changes Made

  1. **Add Missing Foreign Key Indexes**
     - Add indexes for all foreign key columns to improve JOIN performance
     - Covers: hotspots.project_id, materials.user_id, project_shares.created_by, 
       projects.user_id, viewer_configs.project_id, viewer_configs.user_id

  2. **Optimize RLS Policies**
     - Replace `auth.uid()` with `(select auth.uid())` in all policies
     - This prevents re-evaluation of auth function for each row
     - Significantly improves query performance at scale

  3. **Remove Duplicate Policies**
     - Remove duplicate SELECT policy on materials table
     - Remove duplicate INSERT and SELECT policies on usage_logs
     - Keep only the most restrictive/appropriate policy for each action

  4. **Drop Unused Indexes**
     - Remove indexes that are not being used by any queries
     - Reduces maintenance overhead and storage requirements

  ## Security Impact
  - All changes maintain or improve security posture
  - No data access permissions are being loosened
  - Performance improvements will be significant at scale
*/

-- ============================================
-- PART 1: Add Missing Foreign Key Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_hotspots_project_id 
  ON hotspots(project_id);

CREATE INDEX IF NOT EXISTS idx_materials_user_id 
  ON materials(user_id);

CREATE INDEX IF NOT EXISTS idx_project_shares_created_by 
  ON project_shares(created_by);

CREATE INDEX IF NOT EXISTS idx_projects_user_id 
  ON projects(user_id);

CREATE INDEX IF NOT EXISTS idx_viewer_configs_project_id 
  ON viewer_configs(project_id);

CREATE INDEX IF NOT EXISTS idx_viewer_configs_user_id 
  ON viewer_configs(user_id);

-- ============================================
-- PART 2: Remove Duplicate Policies
-- ============================================

-- Drop duplicate policy on materials (keep the one with OR condition)
DROP POLICY IF EXISTS "Library materials are public" ON materials;

-- Drop duplicate policies on usage_logs
DROP POLICY IF EXISTS "Users can view own logs" ON usage_logs;
DROP POLICY IF EXISTS "System can insert logs" ON usage_logs;

-- ============================================
-- PART 3: Optimize RLS Policies with (select auth.uid())
-- ============================================

-- Profiles table policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- Projects table policies
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Viewer configs table policies
DROP POLICY IF EXISTS "Users can view own configs" ON viewer_configs;
CREATE POLICY "Users can view own configs"
  ON viewer_configs FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own configs" ON viewer_configs;
CREATE POLICY "Users can insert own configs"
  ON viewer_configs FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own configs" ON viewer_configs;
CREATE POLICY "Users can update own configs"
  ON viewer_configs FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Materials table policies
DROP POLICY IF EXISTS "Users can view own materials" ON materials;
CREATE POLICY "Users can view own materials"
  ON materials FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id OR type = 'library');

DROP POLICY IF EXISTS "Users can insert own materials" ON materials;
CREATE POLICY "Users can insert own materials"
  ON materials FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Hotspots table policies
DROP POLICY IF EXISTS "Users can view hotspots for own projects" ON hotspots;
CREATE POLICY "Users can view hotspots for own projects"
  ON hotspots FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = hotspots.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert hotspots for own projects" ON hotspots;
CREATE POLICY "Users can insert hotspots for own projects"
  ON hotspots FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = hotspots.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update hotspots for own projects" ON hotspots;
CREATE POLICY "Users can update hotspots for own projects"
  ON hotspots FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = hotspots.project_id
      AND projects.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = hotspots.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete hotspots for own projects" ON hotspots;
CREATE POLICY "Users can delete hotspots for own projects"
  ON hotspots FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = hotspots.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

-- Usage logs table policies (consolidated)
DROP POLICY IF EXISTS "Users can view own usage logs" ON usage_logs;
CREATE POLICY "Users can view own usage logs"
  ON usage_logs FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "System can insert usage logs" ON usage_logs;
CREATE POLICY "System can insert usage logs"
  ON usage_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Project views table policies
DROP POLICY IF EXISTS "Project owners can view analytics" ON project_views;
CREATE POLICY "Project owners can view analytics"
  ON project_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_views.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

-- Project shares table policies
DROP POLICY IF EXISTS "Users can view own shares" ON project_shares;
CREATE POLICY "Users can view own shares"
  ON project_shares FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can create shares for own projects" ON project_shares;
CREATE POLICY "Users can create shares for own projects"
  ON project_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_shares.project_id
      AND projects.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own shares" ON project_shares;
CREATE POLICY "Users can update own shares"
  ON project_shares FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = created_by)
  WITH CHECK ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can delete own shares" ON project_shares;
CREATE POLICY "Users can delete own shares"
  ON project_shares FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = created_by);

-- ============================================
-- PART 4: Drop Unused Indexes
-- ============================================

DROP INDEX IF EXISTS idx_projects_is_public;
DROP INDEX IF EXISTS idx_profiles_api_key;
DROP INDEX IF EXISTS idx_usage_logs_user_id;
DROP INDEX IF EXISTS idx_usage_logs_project_id;
DROP INDEX IF EXISTS idx_usage_logs_created_at;
DROP INDEX IF EXISTS idx_project_views_project_id;
DROP INDEX IF EXISTS idx_project_views_viewed_at;
DROP INDEX IF EXISTS idx_project_shares_token;
DROP INDEX IF EXISTS idx_project_shares_project_id;
