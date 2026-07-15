PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  event TEXT NOT NULL,
  user_id TEXT,
  visitor_id TEXT,
  path TEXT NOT NULL DEFAULT '',
  properties TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_created
  ON analytics_events(event, created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_created
  ON analytics_events(visitor_id, created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created
  ON analytics_events(user_id, created_at);
