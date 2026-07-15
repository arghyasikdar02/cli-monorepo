ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_id text REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS batch_id text;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS lesson_progress integer NOT NULL DEFAULT 0;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS video_progress integer NOT NULL DEFAULT 0;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS document_progress integer NOT NULL DEFAULT 0;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS lab_progress integer NOT NULL DEFAULT 0;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS quiz_progress integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS batches (
  id text PRIMARY KEY,
  course_id text NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS course_videos (
  id text PRIMARY KEY,
  course_id text NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id text REFERENCES lessons(id) ON DELETE SET NULL,
  title text NOT NULL,
  provider text NOT NULL,
  embed_id text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS protected_documents (
  id text PRIMARY KEY,
  course_id text NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id text REFERENCES lessons(id) ON DELETE SET NULL,
  title text NOT NULL,
  storage_key text NOT NULL,
  page_count integer,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS protected_document_events (
  id text PRIMARY KEY,
  document_id text NOT NULL REFERENCES protected_documents(id) ON DELETE CASCADE,
  course_id text NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  page integer,
  event text NOT NULL DEFAULT 'view',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS labs (
  id text PRIMARY KEY,
  course_id text NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id text REFERENCES lessons(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  points integer NOT NULL DEFAULT 0,
  hints jsonb NOT NULL DEFAULT '[]'::jsonb,
  docker_ready boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lab_flags (
  id text PRIMARY KEY,
  lab_id text NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  flag_hash text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lab_attempts (
  id text PRIMARY KEY,
  lab_id text NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  course_id text NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'started',
  score integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  submitted_at timestamptz
);

CREATE TABLE IF NOT EXISTS quizzes (
  id text PRIMARY KEY,
  course_id text NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id text PRIMARY KEY,
  quiz_id text NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  choices jsonb NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id text PRIMARY KEY,
  quiz_id text NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  course_id text NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  score integer NOT NULL DEFAULT 0,
  submitted_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignments (
  id text PRIMARY KEY,
  course_id text NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id text PRIMARY KEY,
  assignment_id text NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  course_id text NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'submitted',
  score integer,
  feedback text,
  reviewed_by text REFERENCES users(id) ON DELETE SET NULL,
  submitted_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at timestamptz
);

CREATE TABLE IF NOT EXISTS certificates (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id text NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  verification_code text NOT NULL UNIQUE,
  issued_by text REFERENCES users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'issued',
  issued_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_intents (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id text NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  provider text NOT NULL DEFAULT 'razorpay',
  provider_order_id text UNIQUE,
  status text NOT NULL DEFAULT 'created',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_events (
  id text PRIMARY KEY,
  provider_event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_batches_course ON batches(course_id, status);
CREATE INDEX IF NOT EXISTS idx_enrollments_batch ON enrollments(batch_id, status);
CREATE INDEX IF NOT EXISTS idx_videos_course ON course_videos(course_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_documents_course ON protected_documents(course_id, status);
CREATE INDEX IF NOT EXISTS idx_document_events_course ON protected_document_events(course_id, created_at);
CREATE INDEX IF NOT EXISTS idx_labs_course ON labs(course_id, status);
CREATE INDEX IF NOT EXISTS idx_lab_attempts_course_user ON lab_attempts(course_id, user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_course ON quizzes(course_id, status);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_course_user ON quiz_attempts(course_id, user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course_id, status);
CREATE INDEX IF NOT EXISTS idx_certificates_user_course ON certificates(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_course ON payment_intents(user_id, course_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_progress_course_summary
  ON user_progress(user_id, course_id) WHERE lesson_id IS NULL;
