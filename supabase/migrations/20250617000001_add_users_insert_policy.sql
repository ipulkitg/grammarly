CREATE POLICY "Users can insert their own profile." ON public.users
FOR INSERT WITH CHECK (auth.uid() = user_id);
