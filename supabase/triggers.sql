-- ============================================================
-- FurnSpace – Auth Trigger
-- Run this in the Supabase SQL Editor after schema.sql
-- ============================================================
-- When a new user signs up via Supabase Auth, this trigger
-- automatically inserts a corresponding row into public.users,
-- copying the auth user's id, email, and full_name from
-- raw_user_meta_data (with a fallback to the email prefix).
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    'customer'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
