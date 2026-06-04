-- Cyber Lab IN / CLI Supabase-compatible schema.
-- Apply in Supabase SQL editor or via migrations after reviewing project-specific auth settings.

create extension if not exists "pgcrypto";
create extension if not exists "vector";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null check (name in ('student','admin','super_admin','instructor','marketing','sales','ops','lab_creator','support','finance')),
  created_at timestamptz not null default now()
);

create table if not exists profile_roles (
  profile_id uuid not null references profiles(id) on delete cascade,
  role_id uuid not null references roles(id) on delete cascade,
  primary key (profile_id, role_id)
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  instructor_id uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists batches (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('active','closed','archived')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  batch_id uuid references batches(id) on delete set null,
  status text not null default 'active' check (status in ('active','inactive','expired','refunded')),
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id, batch_id)
);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  module_id text,
  title text not null,
  lesson_type text not null default 'lesson',
  sort_order int not null default 0,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now()
);

create table if not exists protected_documents (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete set null,
  title text not null,
  storage_key text not null,
  page_count int,
  status text not null default 'active' check (status in ('active','archived')),
  created_at timestamptz not null default now()
);

create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete set null,
  title text not null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now()
);

create table if not exists quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  prompt text not null,
  choices jsonb not null default '[]',
  answer_hash text not null,
  sort_order int not null default 0
);

create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  due_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  content text,
  status text not null default 'submitted' check (status in ('submitted','reviewed','returned')),
  score numeric,
  feedback text,
  reviewed_by uuid references profiles(id),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  lesson_progress numeric not null default 0,
  video_progress numeric not null default 0,
  document_progress numeric not null default 0,
  lab_progress numeric not null default 0,
  quiz_progress numeric not null default 0,
  completion_percentage numeric not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  code text unique not null,
  status text not null default 'issued' check (status in ('issued','revoked')),
  issued_by uuid references profiles(id),
  issued_at timestamptz not null default now()
);

create table if not exists live_classes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  batch_id uuid references batches(id) on delete set null,
  instructor_id uuid not null references profiles(id),
  title text not null,
  provider text not null default 'external_embed',
  embed_url text,
  join_url text,
  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null,
  join_window_before_minutes int not null default 15,
  join_window_after_minutes int not null default 15,
  recording_url text,
  recording_status text not null default 'not_available',
  status text not null default 'scheduled',
  created_at timestamptz not null default now()
);

create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  live_class_id uuid not null references live_classes(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  batch_id uuid references batches(id) on delete set null,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  watch_seconds int not null default 0,
  status text not null default 'online'
);

create table if not exists labs (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete set null,
  title text not null,
  description text,
  hints jsonb not null default '[]',
  docker_ready boolean not null default true,
  unsafe_cloud_infra boolean not null default false,
  points int not null default 0,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists lab_flags (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid not null references labs(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  flag_hash text not null,
  points int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists lab_attempts (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid not null references labs(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'started',
  score int not null default 0,
  started_at timestamptz not null default now(),
  submitted_at timestamptz
);

create table if not exists rag_sources (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  storage_key text,
  source_type text not null default 'manual',
  status text not null default 'ready',
  created_at timestamptz not null default now()
);

create table if not exists rag_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references rag_sources(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  content text not null,
  embedding vector,
  citation text,
  created_at timestamptz not null default now()
);

create table if not exists rag_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists rag_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references rag_chat_sessions(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  citations jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  phone text,
  course_id uuid references courses(id) on delete set null,
  source text not null default 'website',
  stage text not null default 'new',
  owner_id uuid references profiles(id),
  status text not null default 'warm',
  score int not null default 0,
  follow_up_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  actor_id uuid references profiles(id),
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists follow_ups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  owner_id uuid references profiles(id),
  due_at timestamptz not null,
  note text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists payment_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  course_id uuid references courses(id),
  amount numeric not null default 0,
  currency text not null default 'INR',
  provider text not null default 'razorpay',
  provider_intent_id text,
  status text not null default 'created',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  actor_id uuid references profiles(id),
  course_id uuid references courses(id),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists enrollments_user_course_idx on enrollments(user_id, course_id, status);
create index if not exists enrollments_batch_idx on enrollments(batch_id, status);
create index if not exists lessons_course_idx on lessons(course_id);
create index if not exists documents_course_idx on protected_documents(course_id);
create index if not exists live_classes_course_batch_idx on live_classes(course_id, batch_id);
create index if not exists attendance_course_user_idx on attendance(course_id, user_id);
create index if not exists labs_course_lesson_idx on labs(course_id, lesson_id);
create index if not exists rag_chunks_course_idx on rag_chunks(course_id);
create index if not exists rag_messages_user_course_idx on rag_messages(user_id, course_id);
create index if not exists leads_course_source_idx on leads(course_id, source);
create index if not exists analytics_events_course_idx on analytics_events(course_id, event_name);
create index if not exists audit_logs_action_idx on audit_logs(action, created_at desc);
