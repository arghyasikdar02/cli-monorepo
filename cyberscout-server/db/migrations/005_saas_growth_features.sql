ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version integer NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_updated_at timestamptz;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS message text NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS visitor_id text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ip_address text;

ALTER TABLE courses ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'Online';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS credential text NOT NULL DEFAULT 'Certificate of Completion';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS prerequisites text NOT NULL DEFAULT 'Basic computer and internet knowledge';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS brochure_url text;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category_slug text NOT NULL DEFAULT 'cybersecurity';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS audience jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS outcomes jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS labs jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS course_categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blogs (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL,
  body text NOT NULL,
  meta_title text NOT NULL,
  meta_description text NOT NULL,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visitor_analytics (
  id text PRIMARY KEY,
  visitor_id text NOT NULL UNIQUE,
  first_seen_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  visits integer NOT NULL DEFAULT 1,
  consent_analytics boolean NOT NULL DEFAULT false,
  consent_marketing boolean NOT NULL DEFAULT false,
  user_agent text,
  ip_hash text
);

CREATE TABLE IF NOT EXISTS cookie_consents (
  id text PRIMARY KEY,
  visitor_id text NOT NULL REFERENCES visitor_analytics(visitor_id) ON DELETE CASCADE,
  necessary boolean NOT NULL DEFAULT true,
  analytics boolean NOT NULL DEFAULT false,
  marketing boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cookie_consents_visitor ON cookie_consents(visitor_id);
CREATE INDEX IF NOT EXISTS idx_leads_source_stage ON leads(source, stage);
CREATE INDEX IF NOT EXISTS idx_leads_search ON leads(name, email, phone);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status, created_at);
CREATE INDEX IF NOT EXISTS idx_visitors_last_seen ON visitor_analytics(last_seen_at);
