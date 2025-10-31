/*
  # Fix Storage Bucket MIME Types

  1. Updates
    - Update models bucket to accept all GLB/GLTF related MIME types
    - Add support for application/octet-stream (common for GLB files)
    - Ensure proper content type handling

  2. MIME Types
    - model/gltf-binary (standard GLB)
    - model/gltf+json (GLTF)
    - application/octet-stream (generic binary, used by many GLB files)
*/

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'model/gltf-binary',
  'model/gltf+json',
  'application/octet-stream'
]
WHERE id = 'models';

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'model/obj',
  'model/fbx',
  'model/stl',
  'model/gltf-binary',
  'model/gltf+json',
  'application/octet-stream',
  'application/x-tgif'
]
WHERE id = 'uploads';
