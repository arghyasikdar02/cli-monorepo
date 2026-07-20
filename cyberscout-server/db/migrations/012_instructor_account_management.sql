ALTER TABLE users
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower_unique
  ON users ((lower(username)))
  WHERE username IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower_unique
  ON users ((lower(email)));

CREATE INDEX IF NOT EXISTS idx_courses_instructor
  ON courses(instructor_id)
  WHERE instructor_id IS NOT NULL;
