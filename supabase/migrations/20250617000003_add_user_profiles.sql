-- Create the user_profiles table
CREATE TABLE public.user_profiles (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE NOT NULL UNIQUE,
    personal_details JSONB NOT NULL DEFAULT '{
        "name": "",
        "pronouns": "",
        "cultural_background": "",
        "first_gen_status": false
    }'::jsonb,
    academics JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {degree, gpa, major, coursework, research}
    experience JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of work experiences
    extracurriculars JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of activities
    achievements JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of achievements
    qualities TEXT[] DEFAULT '{}', -- Array of virtues/qualities
    tone_preference JSONB NOT NULL DEFAULT '{
        "tone": "",
        "description": ""
    }'::jsonb,
    supporting_docs JSONB NOT NULL DEFAULT '{
        "resume": null,
        "transcripts": []
    }'::jsonb,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile data." ON public.user_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile data." ON public.user_profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile data." ON public.user_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add function to automatically create profile on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id)
    VALUES (NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create profile when new user is created
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user(); 