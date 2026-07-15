CREATE UNIQUE INDEX IF NOT EXISTS idx_progress_course_summary
  ON user_progress(user_id, course_id) WHERE lesson_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_lab_flags_unique_hash
  ON lab_flags(lab_id, flag_hash);
