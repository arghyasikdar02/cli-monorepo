CREATE TABLE IF NOT EXISTS live_class_attendance (
  id text PRIMARY KEY,
  live_class_id text NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_live_attendance_class ON live_class_attendance(live_class_id, created_at);
CREATE INDEX IF NOT EXISTS idx_live_attendance_user ON live_class_attendance(user_id, created_at);
