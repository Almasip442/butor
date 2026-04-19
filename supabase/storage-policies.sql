-- ============================================================
-- FurnSpace – Storage Bucket + Policies
-- Run this in the Supabase SQL Editor after schema.sql
-- ============================================================

-- ------------------------------------------------------------
-- Create the product-images bucket
-- public=true  → anyone can read objects via the public URL
-- file_size_limit = 5 MB (5242880 bytes)
-- allowed_mime_types restricts uploads to web-optimised images
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  TRUE,
  5242880,
  ARRAY['image/webp', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- RLS on storage.objects
-- ------------------------------------------------------------

-- Public SELECT: anyone (including anonymous users) can read
-- objects in the product-images bucket.
CREATE POLICY "product_images_public_select"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

-- Admin INSERT: only admins may upload new images.
CREATE POLICY "product_images_admin_insert"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin DELETE: only admins may delete images.
CREATE POLICY "product_images_admin_delete"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
