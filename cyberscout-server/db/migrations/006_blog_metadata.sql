ALTER TABLE blogs ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Beginner Cybersecurity';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS author_name text NOT NULL DEFAULT 'Arghya Sikdar';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS published_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS last_reviewed_at date;

CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category, status, published_at);
