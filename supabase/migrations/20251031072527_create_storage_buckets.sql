/*
  # Create Storage Buckets for 3D Files

  1. New Storage Buckets
    - `uploads` - Original uploaded 3D files (OBJ, FBX, STL, etc.)
      - Private access, authenticated users only
      - 100MB file size limit
    - `models` - Converted GLB files
      - Public access for embedding
      - 100MB file size limit
    - `posters` - Generated poster images
      - Public access
      - 10MB file size limit

  2. Security
    - Users can only upload to their own folders
    - Public read access for models and posters
    - Private access for original uploads
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('uploads', 'uploads', false, 104857600, ARRAY['model/obj', 'model/fbx', 'model/stl', 'model/gltf-binary', 'model/gltf+json', 'application/octet-stream']),
  ('models', 'models', true, 104857600, ARRAY['model/gltf-binary']),
  ('posters', 'posters', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read their own uploads"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can read models"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'models');

CREATE POLICY "Service can upload models"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'models');

CREATE POLICY "Anyone can read posters"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'posters');

CREATE POLICY "Service can upload posters"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'posters');
