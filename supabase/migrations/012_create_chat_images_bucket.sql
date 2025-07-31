-- Create storage bucket for chat images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-images',
  'chat-images',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Create storage policy to allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload chat images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-images' 
  AND auth.role() = 'authenticated'
);

-- Create storage policy to allow public read access to chat images
CREATE POLICY "Allow public read access to chat images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'chat-images'
);

-- Create storage policy to allow authenticated users to update their own images
CREATE POLICY "Allow authenticated users to update chat images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'chat-images' 
  AND auth.role() = 'authenticated'
);

-- Create storage policy to allow authenticated users to delete their own images
CREATE POLICY "Allow authenticated users to delete chat images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'chat-images' 
  AND auth.role() = 'authenticated'
); 