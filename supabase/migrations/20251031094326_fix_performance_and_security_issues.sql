/*
  # Fix Performance and Security Issues

  ## Changes Made

  1. **Add Missing Indexes for Foreign Keys**
     - Add index on `project_shares.project_id` for better query performance
     - Add index on `project_views.project_id` for better query performance
     - Add index on `usage_logs.project_id` for better query performance
     - Add index on `usage_logs.user_id` for better query performance

  2. **Remove Unused Indexes**
     - Drop `idx_hotspots_project_id` (not being used)
     - Drop `idx_materials_user_id` (not being used)
     - Drop `idx_project_shares_created_by` (not being used)
     - Drop `idx_projects_user_id` (not being used)
     - Drop `idx_viewer_configs_project_id` (not being used)
     - Drop `idx_viewer_configs_user_id` (not being used)

  ## Performance Impact
  - Foreign key indexes will significantly improve JOIN and filtering operations
  - Removing unused indexes reduces write overhead and storage
*/

-- Add missing indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_project_shares_project_id ON public.project_shares(project_id);
CREATE INDEX IF NOT EXISTS idx_project_views_project_id ON public.project_views(project_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_project_id ON public.usage_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);

-- Drop unused indexes
DROP INDEX IF EXISTS public.idx_hotspots_project_id;
DROP INDEX IF EXISTS public.idx_materials_user_id;
DROP INDEX IF EXISTS public.idx_project_shares_created_by;
DROP INDEX IF EXISTS public.idx_projects_user_id;
DROP INDEX IF EXISTS public.idx_viewer_configs_project_id;
DROP INDEX IF EXISTS public.idx_viewer_configs_user_id;