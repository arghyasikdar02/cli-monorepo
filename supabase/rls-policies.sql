-- Deny-by-default Supabase RLS starter policies for Cyber Lab IN / CLI.
-- Review role names and JWT custom claims before production use.

alter table profiles enable row level security;
alter table profile_roles enable row level security;
alter table courses enable row level security;
alter table batches enable row level security;
alter table enrollments enable row level security;
alter table lessons enable row level security;
alter table protected_documents enable row level security;
alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table assignments enable row level security;
alter table submissions enable row level security;
alter table progress enable row level security;
alter table certificates enable row level security;
alter table live_classes enable row level security;
alter table attendance enable row level security;
alter table labs enable row level security;
alter table lab_attempts enable row level security;
alter table lab_flags enable row level security;
alter table rag_sources enable row level security;
alter table rag_chunks enable row level security;
alter table rag_chat_sessions enable row level security;
alter table rag_messages enable row level security;
alter table leads enable row level security;
alter table lead_notes enable row level security;
alter table follow_ups enable row level security;
alter table payment_intents enable row level security;
alter table analytics_events enable row level security;
alter table audit_logs enable row level security;

create or replace function app_has_role(role_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from profile_roles pr
    join roles r on r.id = pr.role_id
    where pr.profile_id = auth.uid()
      and r.name = role_name
  );
$$;

create or replace function app_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select app_has_role('admin') or app_has_role('super_admin');
$$;

create or replace function app_has_active_enrollment(course uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from enrollments e
    where e.user_id = auth.uid()
      and e.course_id = course
      and e.status = 'active'
  );
$$;

create or replace function app_has_batch_membership(course uuid, batch uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from enrollments e
    where e.user_id = auth.uid()
      and e.course_id = course
      and e.batch_id = batch
      and e.status = 'active'
  );
$$;

create or replace function app_is_assigned_instructor(course uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from courses c
    where c.id = course
      and c.instructor_id = auth.uid()
  );
$$;

create policy profiles_self_or_admin on profiles for select
  using (id = auth.uid() or app_is_admin());

create policy courses_public_or_enrolled on courses for select
  using (status = 'published' or app_has_active_enrollment(id) or app_is_assigned_instructor(id) or app_is_admin());

create policy courses_admin_write on courses for all
  using (app_is_admin())
  with check (app_is_admin());

create policy batches_enrolled_or_staff on batches for select
  using (app_has_active_enrollment(course_id) or app_is_assigned_instructor(course_id) or app_is_admin());

create policy enrollments_self_or_staff on enrollments for select
  using (user_id = auth.uid() or app_is_assigned_instructor(course_id) or app_is_admin());

create policy course_content_read on lessons for select
  using (app_has_active_enrollment(course_id) or app_is_assigned_instructor(course_id) or app_is_admin());

create policy protected_documents_read on protected_documents for select
  using (app_has_active_enrollment(course_id) or app_is_assigned_instructor(course_id) or app_is_admin());

create policy quizzes_read on quizzes for select
  using (app_has_active_enrollment(course_id) or app_is_assigned_instructor(course_id) or app_is_admin());

create policy assignments_read on assignments for select
  using (app_has_active_enrollment(course_id) or app_is_assigned_instructor(course_id) or app_is_admin());

create policy submissions_owner_or_staff on submissions for select
  using (user_id = auth.uid() or app_is_assigned_instructor(course_id) or app_is_admin());

create policy progress_owner_or_staff on progress for select
  using (user_id = auth.uid() or app_is_assigned_instructor(course_id) or app_is_admin());

create policy certificates_owner_or_staff on certificates for select
  using (user_id = auth.uid() or app_is_assigned_instructor(course_id) or app_is_admin());

create policy live_classes_enrolled_batch_or_staff on live_classes for select
  using (
    app_is_admin()
    or app_is_assigned_instructor(course_id)
    or (batch_id is null and app_has_active_enrollment(course_id))
    or (batch_id is not null and app_has_batch_membership(course_id, batch_id))
  );

create policy attendance_owner_or_staff on attendance for select
  using (user_id = auth.uid() or app_is_assigned_instructor(course_id) or app_is_admin());

create policy labs_read on labs for select
  using (app_has_active_enrollment(course_id) or app_is_assigned_instructor(course_id) or app_is_admin());

create policy lab_attempts_owner_or_staff on lab_attempts for select
  using (user_id = auth.uid() or app_is_assigned_instructor(course_id) or app_is_admin());

create policy rag_sources_course_bound on rag_sources for select
  using (app_has_active_enrollment(course_id) or app_is_assigned_instructor(course_id) or app_is_admin());

create policy rag_chunks_course_bound on rag_chunks for select
  using (app_has_active_enrollment(course_id) or app_is_assigned_instructor(course_id) or app_is_admin());

create policy rag_chat_sessions_owner_course_bound on rag_chat_sessions for select
  using (user_id = auth.uid() and app_has_active_enrollment(course_id) or app_is_admin());

create policy rag_messages_owner_course_bound on rag_messages for select
  using (user_id = auth.uid() and app_has_active_enrollment(course_id) or app_is_admin());

create policy leads_sales_or_admin on leads for select
  using (app_is_admin() or app_has_role('marketing') or app_has_role('sales'));

create policy lead_notes_sales_or_admin on lead_notes for select
  using (app_is_admin() or app_has_role('marketing') or app_has_role('sales'));

create policy follow_ups_sales_or_admin on follow_ups for select
  using (app_is_admin() or app_has_role('marketing') or app_has_role('sales'));

create policy payment_intents_owner_or_finance on payment_intents for select
  using (user_id = auth.uid() or app_is_admin() or app_has_role('finance'));

create policy analytics_staff_only on analytics_events for select
  using (app_is_admin() or app_has_role('instructor') or app_has_role('marketing') or app_has_role('sales') or app_has_role('ops'));

create policy audit_admin_only on audit_logs for select
  using (app_is_admin() or app_has_role('ops') or app_has_role('support'));
