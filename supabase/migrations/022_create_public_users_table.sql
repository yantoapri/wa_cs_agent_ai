-- Create public users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    username TEXT NULL,
    email TEXT NULL,
    role INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT TRUE
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own record" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own record" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own record" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Create function to automatically set user data on registration
-- This function will be called by a trigger when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username, is_active)
    VALUES (NEW.id, NEW.email, NEW.email, TRUE);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create public user record when auth user is created
-- Note: This requires Supabase Auth to be configured to trigger this function
-- We'll also modify the registration process in the frontend to ensure data is saved