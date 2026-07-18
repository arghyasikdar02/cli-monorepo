CREATE TABLE IF NOT EXISTS google_connections (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  google_subject text NOT NULL UNIQUE,
  google_email text NOT NULL,
  google_name text,
  google_avatar_url text,
  encrypted_access_token text,
  encrypted_refresh_token text,
  token_expiry timestamptz,
  granted_scopes jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at timestamptz,
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_google_connections_user ON google_connections(user_id, revoked_at);
CREATE INDEX IF NOT EXISTS idx_google_connections_subject ON google_connections(google_subject);

ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS agenda text;
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS cohort_id text;
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS google_connection_id text REFERENCES google_connections(id) ON DELETE SET NULL;
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS google_space_name text;
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS google_meeting_code text;
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS meeting_url text;
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS start_at timestamptz;
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS end_at timestamptz;
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'Asia/Kolkata';
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS recording_url text;
ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE live_classes SET
  start_at = COALESCE(start_at, scheduled_start),
  end_at = COALESCE(end_at, scheduled_end),
  meeting_url = COALESCE(meeting_url, join_url),
  provider = CASE WHEN provider = 'external' THEN 'manual' ELSE provider END
WHERE start_at IS NULL OR end_at IS NULL OR meeting_url IS NULL OR provider = 'external';

CREATE UNIQUE INDEX IF NOT EXISTS idx_live_classes_google_space ON live_classes(google_space_name) WHERE google_space_name IS NOT NULL;
