PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS live_class_attendance (
  id TEXT PRIMARY KEY,
  live_class_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  event TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (live_class_id) REFERENCES live_classes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_live_attendance_class ON live_class_attendance(live_class_id, created_at);
CREATE INDEX IF NOT EXISTS idx_live_attendance_user ON live_class_attendance(user_id, created_at);
