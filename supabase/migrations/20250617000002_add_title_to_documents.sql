-- Add title column to documents table
ALTER TABLE public.documents ADD COLUMN title TEXT;

-- Update existing documents to have a default title
UPDATE public.documents SET title = 'Untitled Document' WHERE title IS NULL;

-- Make title non-nullable after setting defaults
ALTER TABLE public.documents ALTER COLUMN title SET NOT NULL; 