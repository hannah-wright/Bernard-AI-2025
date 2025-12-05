-- Remove expiration dates from all invite codes (set to NULL = never expires)
UPDATE invite_codes SET expires_at = NULL;