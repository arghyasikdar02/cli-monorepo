PRAGMA foreign_keys = ON;

ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN password_updated_at TEXT;

ALTER TABLE leads ADD COLUMN phone TEXT NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN message TEXT NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN visitor_id TEXT;
ALTER TABLE leads ADD COLUMN user_agent TEXT;
ALTER TABLE leads ADD COLUMN ip_address TEXT;

ALTER TABLE courses ADD COLUMN mode TEXT NOT NULL DEFAULT 'Online';
ALTER TABLE courses ADD COLUMN credential TEXT NOT NULL DEFAULT 'Certificate of Completion';
ALTER TABLE courses ADD COLUMN prerequisites TEXT NOT NULL DEFAULT 'Basic computer and internet knowledge';
ALTER TABLE courses ADD COLUMN brochure_url TEXT;
ALTER TABLE courses ADD COLUMN category_slug TEXT NOT NULL DEFAULT 'cybersecurity';
ALTER TABLE courses ADD COLUMN audience TEXT NOT NULL DEFAULT '[]';
ALTER TABLE courses ADD COLUMN outcomes TEXT NOT NULL DEFAULT '[]';
ALTER TABLE courses ADD COLUMN labs TEXT NOT NULL DEFAULT '[]';

CREATE TABLE IF NOT EXISTS course_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body TEXT NOT NULL,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS visitor_analytics (
  id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL UNIQUE,
  first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  visits INTEGER NOT NULL DEFAULT 1,
  consent_analytics INTEGER NOT NULL DEFAULT 0,
  consent_marketing INTEGER NOT NULL DEFAULT 0,
  user_agent TEXT,
  ip_hash TEXT
);

CREATE TABLE IF NOT EXISTS cookie_consents (
  id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  necessary INTEGER NOT NULL DEFAULT 1,
  analytics INTEGER NOT NULL DEFAULT 0,
  marketing INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (visitor_id) REFERENCES visitor_analytics(visitor_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_leads_source_stage ON leads(source, stage);
CREATE INDEX IF NOT EXISTS idx_leads_search ON leads(name, email, phone);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status, created_at);
CREATE INDEX IF NOT EXISTS idx_visitors_last_seen ON visitor_analytics(last_seen_at);

INSERT INTO course_categories (id, name, slug, description)
VALUES ('cat_cybersecurity', 'Cybersecurity', 'cybersecurity', 'Beginner-friendly and practical cybersecurity training.')
ON CONFLICT(slug) DO UPDATE SET description = excluded.description;

UPDATE courses
SET
  mode = 'Online',
  credential = 'Certificate of Completion',
  prerequisites = 'Basic computer and internet knowledge',
  category_slug = 'cybersecurity',
  audience = CASE
    WHEN id = 'c002' THEN '["Students exploring cybersecurity","IT beginners","Career switchers","Non-technical learners","Junior IT staff","Learners preparing for cybersecurity certification courses"]'
    ELSE audience
  END,
  labs = CASE
    WHEN id = 'c002' THEN '["Digital footprint review","Phishing indicator analysis","Account hardening checklist","Web request-response practice","Unsafe input observation","SQL Injection awareness lab","XSS awareness lab","Session security basics","Misconfiguration review","Defensive reporting practice"]'
    ELSE labs
  END,
  outcomes = CASE
    WHEN id = 'c002' THEN '["Explain cybersecurity in simple terms","Identify phishing and scam indicators","Apply account hardening practices","Understand beginner web security risks","Recognise unsafe input patterns","Describe SQL Injection and XSS at foundation level","Understand network security basics","Follow basic cyber investigation structure","Communicate findings through defensive reporting"]'
    ELSE outcomes
  END
WHERE id IN ('c001', 'c002');

INSERT INTO blogs (id, slug, title, excerpt, body, meta_title, meta_description)
VALUES
  (
    'blog_cybersecurity',
    'what-is-cybersecurity',
    'What is cybersecurity?',
    'A beginner-friendly explanation of cybersecurity and why hands-on practice matters.',
    'Cybersecurity is the practice of protecting systems, accounts, networks, websites, and digital information from attacks, misuse, and unauthorised access.\n\nFor beginners, the best starting point is not memorising definitions. It is learning how real risks appear in everyday systems: suspicious emails, weak passwords, unsafe links, exposed accounts, website input, and poor configuration.\n\nCyber Lab IN teaches these ideas through guided labs and defensive thinking. If you want a practical starting point, explore the Cyber Security Essentials course at /courses/cybersecurity/cyber-security-essentials.',
    'What is Cybersecurity? Beginner Guide',
    'Learn what cybersecurity means, why it matters, and how beginners can start with guided labs and practical defensive skills.'
  ),
  (
    'blog_phishing',
    'what-is-phishing-and-how-to-prevent-it',
    'What is phishing and how to prevent it?',
    'Learn how phishing works and the simple habits that reduce risk.',
    'Phishing is a social engineering attack where someone tries to trick you into clicking a link, opening an attachment, sharing credentials, or taking urgent action.\n\nPrevention starts with careful verification. Check the sender, domain, link destination, request urgency, attachment type, and whether the request matches the real organisation workflow.\n\nThe Cyber Security Essentials course includes phishing indicator analysis labs so beginners can practise safe review without interacting with dangerous content.',
    'What is Phishing and How to Prevent It?',
    'Understand phishing indicators, prevention habits, and beginner-safe practice through Cyber Lab IN guided labs.'
  ),
  (
    'blog_ethical_hacking',
    'what-is-ethical-hacking',
    'What is ethical hacking?',
    'A practical explanation of ethical hacking, authorisation, and responsible learning.',
    'Ethical hacking is authorised security testing. The goal is to find weaknesses safely, document risk clearly, and help improve defence.\n\nBeginners should first learn security fundamentals, account protection, network basics, web request-response behaviour, and defensive reporting. These foundations make later ethical hacking study safer and more responsible.\n\nCyber Lab IN courses focus on authorised, beginner-safe learning paths.',
    'What is Ethical Hacking?',
    'Learn what ethical hacking means, why authorisation matters, and which cybersecurity foundations beginners should learn first.'
  ),
  (
    'blog_beginners',
    'how-to-learn-cybersecurity-for-beginners',
    'How to learn cybersecurity for beginners?',
    'A practical learning path for students, IT beginners, and career switchers.',
    'The best way to learn cybersecurity for beginners is to combine simple explanations with practical exercises. Start with phishing prevention, account hardening, digital footprint risks, network security basics, web security basics, and defensive reporting.\n\nAvoid trying to learn everything at once. Build confidence through guided labs and real scenarios.\n\nCyber Security Essentials is designed as a 7-day beginner-friendly course for practical cybersecurity learning.',
    'How to Learn Cybersecurity for Beginners',
    'A beginner-friendly cybersecurity learning path with hands-on labs, phishing practice, web security basics, and defensive reporting.'
  )
ON CONFLICT(slug) DO UPDATE SET
  title = excluded.title,
  excerpt = excluded.excerpt,
  body = excluded.body,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = datetime('now');
