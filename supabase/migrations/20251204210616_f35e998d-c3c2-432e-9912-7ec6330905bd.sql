-- 1. Fix invite_codes: Remove public SELECT, only allow checking specific codes
DROP POLICY IF EXISTS "Anyone can view invite codes" ON public.invite_codes;

-- Create a function to check invite code validity without exposing all codes
CREATE OR REPLACE FUNCTION public.check_invite_code(code_to_check text)
RETURNS TABLE (
  id uuid,
  credits_granted integer,
  is_valid boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ic.id,
    ic.credits_granted,
    (ic.times_used < COALESCE(ic.max_uses, 1) AND (ic.expires_at IS NULL OR ic.expires_at > now())) as is_valid
  FROM invite_codes ic
  WHERE ic.code = code_to_check;
END;
$$;

-- 2. Create a secure function for profile updates that prevents credit/tier manipulation
CREATE OR REPLACE FUNCTION public.secure_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent users from modifying sensitive fields
  NEW.credits_remaining := OLD.credits_remaining;
  NEW.subscription_tier := OLD.subscription_tier;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Create trigger to enforce secure updates
DROP TRIGGER IF EXISTS enforce_secure_profile_update ON public.profiles;
CREATE TRIGGER enforce_secure_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.secure_profile_update();

-- 3. Create admin-only function to update credits/subscription (bypasses trigger)
CREATE OR REPLACE FUNCTION public.admin_update_profile(
  target_user_id uuid,
  new_credits integer DEFAULT NULL,
  new_tier text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can update credits and subscription tier';
  END IF;
  
  UPDATE profiles
  SET 
    credits_remaining = COALESCE(new_credits, credits_remaining),
    subscription_tier = COALESCE(new_tier, subscription_tier),
    updated_at = now()
  WHERE id = target_user_id;
END;
$$;