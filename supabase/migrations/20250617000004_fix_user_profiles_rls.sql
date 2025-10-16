-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON public.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function with SECURITY DEFINER and better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER -- This is crucial to bypass RLS
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- First ensure we have a user record
    INSERT INTO public.users (user_id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (user_id) DO NOTHING;

    -- Then create the profile
    INSERT INTO public.user_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- Recreate the trigger on auth.users instead of public.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Ensure the trigger has the necessary permissions
GRANT INSERT ON public.users TO authenticated;
GRANT INSERT ON public.user_profiles TO authenticated; 