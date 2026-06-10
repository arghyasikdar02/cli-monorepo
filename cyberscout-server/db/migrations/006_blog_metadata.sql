PRAGMA foreign_keys = ON;

ALTER TABLE blogs ADD COLUMN category TEXT NOT NULL DEFAULT 'Beginner Cybersecurity';
ALTER TABLE blogs ADD COLUMN author_name TEXT NOT NULL DEFAULT 'Arghya Sikdar';
ALTER TABLE blogs ADD COLUMN published_at TEXT NOT NULL DEFAULT '1970-01-01 00:00:00';
ALTER TABLE blogs ADD COLUMN last_reviewed_at TEXT NOT NULL DEFAULT '2026-06-11';

UPDATE blogs
SET
  category = 'Beginner Cybersecurity',
  author_name = 'Arghya Sikdar',
  published_at = COALESCE(created_at, datetime('now')),
  last_reviewed_at = '2026-06-11'
WHERE slug IN ('what-is-cybersecurity', 'what-is-phishing-and-how-to-prevent-it');

UPDATE blogs
SET
  category = 'Ethical Hacking',
  author_name = 'Arghya Sikdar',
  published_at = COALESCE(created_at, datetime('now')),
  last_reviewed_at = '2026-06-11'
WHERE slug = 'what-is-ethical-hacking';

UPDATE blogs
SET
  category = 'Career Guidance',
  author_name = 'Arghya Sikdar',
  published_at = COALESCE(created_at, datetime('now')),
  last_reviewed_at = '2026-06-11'
WHERE slug = 'how-to-learn-cybersecurity-for-beginners';

CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category, status, published_at);
