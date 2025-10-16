-- Create the 'users' table
CREATE TABLE public.users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    preferences JSONB DEFAULT '{}'::jsonb, -- {tone, language, accessibility}
    improvement_stats JSONB DEFAULT '{}'::jsonb, -- {accepted_suggestions, progress}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for 'users' table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy for users to view and update their own profile
CREATE POLICY "Users can view their own profile." ON public.users
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile." ON public.users
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile." ON public.users
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create the 'documents' table
CREATE TABLE public.documents (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- {university, program, word_count}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for 'documents' table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policy for users to create their own documents
CREATE POLICY "Users can create documents for themselves." ON public.documents
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to view their own documents
CREATE POLICY "Users can view their own documents." ON public.documents
FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to update their own documents
CREATE POLICY "Users can update their own documents." ON public.documents
FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own documents
CREATE POLICY "Users can delete their own documents." ON public.documents
FOR DELETE USING (auth.uid() = user_id);

-- Create the 'suggestions' table
CREATE TABLE public.suggestions (
    suggestion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(document_id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- grammar, tone, coherence
    position INT[], -- e.g., [start_char_index, end_char_index]
    alternatives JSONB DEFAULT '[]'::jsonb,
    explanation TEXT NOT NULL,
    confidence_score FLOAT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for 'suggestions' table
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- Policy for users to view suggestions related to their documents
CREATE POLICY "Users can view suggestions for their documents." ON public.suggestions
FOR SELECT USING (EXISTS (SELECT 1 FROM public.documents WHERE documents.document_id = suggestions.document_id AND documents.user_id = auth.uid()));

-- Policy for users to insert suggestions (typically by Edge Functions)
CREATE POLICY "Users can insert suggestions for their documents." ON public.suggestions
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.documents WHERE documents.document_id = suggestions.document_id AND documents.user_id = auth.uid()));

-- Policy for users to delete suggestions (e.g., after accepting/rejecting)
CREATE POLICY "Users can delete suggestions for their documents." ON public.suggestions
FOR DELETE USING (EXISTS (SELECT 1 FROM public.documents WHERE documents.document_id = suggestions.document_id AND documents.user_id = auth.uid()));

-- Create the 'analytics' table
CREATE TABLE public.analytics (
    analytics_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE NOT NULL,
    suggestion_id UUID REFERENCES public.suggestions(suggestion_id) ON DELETE SET NULL, -- SET NULL if suggestion is deleted
    action TEXT NOT NULL, -- accept, reject
    usage_pattern JSONB DEFAULT '{}'::jsonb, -- {session_duration, edits}
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for 'analytics' table
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Policy for users to insert their own analytics data
CREATE POLICY "Users can insert their own analytics data." ON public.analytics
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to view their own analytics data
CREATE POLICY "Users can view their own analytics data." ON public.analytics
FOR SELECT USING (auth.uid() = user_id);

-- Set up a function to update 'updated_at' column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for 'updated_at' on 'users' and 'documents' tables
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
