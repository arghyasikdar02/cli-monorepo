ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';
ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS lesson_type text NOT NULL DEFAULT 'text';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS resource_url text;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE course_materials ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_course_modules_course_order
  ON course_modules(course_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_lessons_module_order
  ON lessons(module_id, sort_order);
