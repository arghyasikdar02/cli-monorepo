CREATE TABLE IF NOT EXISTS analytics_events (
  id text PRIMARY KEY,
  event text NOT NULL,
  user_id text REFERENCES users(id) ON DELETE SET NULL,
  visitor_id text,
  path text NOT NULL DEFAULT '',
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_created ON analytics_events(event, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_created ON analytics_events(visitor_id, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created ON analytics_events(user_id, created_at);
