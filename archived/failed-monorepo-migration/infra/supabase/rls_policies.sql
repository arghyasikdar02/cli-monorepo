-- Sample Supabase RLS policies for course isolation.
-- Adjust auth/user mapping to match production Supabase Auth configuration.

create schema if not exists app;

alter table enrollments enable row level security;
alter table lessons enable row level security;
alter table live_classes enable row level security;
alter table protected_documents enable row level security;
alter table document_page_views enable row level security;
alter table ai_chat_sessions enable row level security;
alter table ai_chat_messages enable row level security;

create or replace function app.current_user_id()
returns uuid
language sql stable
as $$
  select id from users where auth_user_id = auth.uid()::text and deleted_at is null limit 1
$$;

create or replace function app.has_active_enrollment(target_course_id uuid)
returns boolean
language sql stable
as $$
  select exists (
    select 1 from enrollments e
    where e.user_id = app.current_user_id()
      and e.course_id = target_course_id
      and e.status = 'ACTIVE'
      and e.deleted_at is null
  )
$$;

create or replace function app.has_active_batch_membership(target_course_id uuid, target_batch_id uuid)
returns boolean
language sql stable
as $$
  select target_batch_id is null or exists (
    select 1 from batch_students bs
    where bs.user_id = app.current_user_id()
      and bs.course_id = target_course_id
      and bs.batch_id = target_batch_id
      and bs.status = 'ACTIVE'
  )
$$;

create policy student_read_own_enrollments on enrollments
  for select using (user_id = app.current_user_id());

create policy enrolled_students_read_lessons on lessons
  for select using (status = 'PUBLISHED' and app.has_active_enrollment(course_id));

create policy enrolled_students_read_live_classes on live_classes
  for select using (
    app.has_active_enrollment(course_id)
    and app.has_active_batch_membership(course_id, batch_id)
  );

create policy enrolled_students_read_document_metadata on protected_documents
  for select using (status = 'PUBLISHED' and app.has_active_enrollment(course_id));

create policy students_insert_own_page_views on document_page_views
  for insert with check (user_id = app.current_user_id() and app.has_active_enrollment(course_id));

create policy students_read_own_ai_sessions on ai_chat_sessions
  for select using (user_id = app.current_user_id() and app.has_active_enrollment(course_id));

create policy students_read_own_ai_messages on ai_chat_messages
  for select using (user_id = app.current_user_id() and app.has_active_enrollment(course_id));
