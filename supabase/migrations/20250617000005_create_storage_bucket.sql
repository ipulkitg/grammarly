-- Create storage bucket for supporting documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('supporting-docs', 'supporting-docs', true);

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'supporting-docs'
    AND auth.role() = 'authenticated'
);

-- Allow users to read their own files
CREATE POLICY "Allow users to read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'supporting-docs'
    AND owner = auth.uid()
);

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'supporting-docs'
    AND owner = auth.uid()
); 