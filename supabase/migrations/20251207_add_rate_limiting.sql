-- Rate limiting table for API call tracking
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, endpoint, window_start)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint ON rate_limits(user_id, endpoint, window_start);

-- Function to check and increment rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 100,
  p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_current_count INTEGER;
BEGIN
  -- Calculate window start (truncate to the beginning of the current window)
  v_window_start := date_trunc('hour', now()) + 
    (EXTRACT(MINUTE FROM now())::INTEGER / p_window_minutes * p_window_minutes) * INTERVAL '1 minute';
  
  -- Try to get existing count for this window
  SELECT request_count INTO v_current_count
  FROM rate_limits
  WHERE user_id = p_user_id 
    AND endpoint = p_endpoint 
    AND window_start = v_window_start;
  
  IF v_current_count IS NULL THEN
    -- First request in this window
    INSERT INTO rate_limits (user_id, endpoint, request_count, window_start)
    VALUES (p_user_id, p_endpoint, 1, v_window_start)
    ON CONFLICT (user_id, endpoint, window_start) 
    DO UPDATE SET request_count = rate_limits.request_count + 1;
    RETURN TRUE;
  ELSIF v_current_count >= p_max_requests THEN
    -- Rate limit exceeded
    RETURN FALSE;
  ELSE
    -- Increment count
    UPDATE rate_limits 
    SET request_count = request_count + 1
    WHERE user_id = p_user_id 
      AND endpoint = p_endpoint 
      AND window_start = v_window_start;
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup old rate limit records (older than 1 day)
CREATE OR REPLACE FUNCTION cleanup_rate_limits() RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE window_start < now() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own rate limits
CREATE POLICY "Users can view own rate limits"
  ON rate_limits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Audit log table for admin actions
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id, created_at DESC);

-- Enable RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Admin-only access to audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_audit_action(
  p_user_id UUID,
  p_action TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id TEXT DEFAULT NULL,
  p_old_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_value, new_value)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_old_value, p_new_value);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- REVENUE CONFIDENCE
-- =============================================================================

-- Add revenue confidence score to startups table
-- 'verified' = publicly stated (interview, press release, IndieHackers, etc)
-- 'estimated' = calculated from factors like funding, team size, etc
-- 'unknown' = insufficient data
ALTER TABLE startups 
ADD COLUMN IF NOT EXISTS revenue_confidence TEXT DEFAULT 'estimated';

-- Add revenue source notes (where the number came from)
ALTER TABLE startups 
ADD COLUMN IF NOT EXISTS revenue_source TEXT;

-- Ensure every startup has at least 1 data source
INSERT INTO data_sources (startup_id, name, confidence)
SELECT 
  s.id,
  'BernardAI Discovery',
  'medium'::confidence_level
FROM startups s
LEFT JOIN data_sources ds ON ds.startup_id = s.id
WHERE ds.id IS NULL
ON CONFLICT DO NOTHING;

