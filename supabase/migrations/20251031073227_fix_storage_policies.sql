/*
  # Fix Storage Policies for File Upload

  1. Policy Updates
    - Allow authenticated users to upload to models bucket
    - Allow authenticated users to upload to posters bucket
    - Maintain public read access for models and posters

  2. Security
    - Users can upload their own models
    - Everyone can read public models
    - Models are organized by user ID
*/

DROP POLICY IF EXISTS "Service can upload models" ON storage.objects;
DROP POLICY IF EXISTS "Service can upload posters" ON storage.objects;

CREATE POLICY "Authenticated users can upload models"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'models' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Authenticated users can upload posters"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'posters' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Authenticated users can update their models"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'models' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Authenticated users can delete their models"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'models' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
