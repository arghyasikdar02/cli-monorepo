-- Deny direct PostgREST access to application-owned tables.
--
-- The Express backend is the only application data boundary and performs its
-- own RBAC, enrollment, batch, and ownership checks. It connects with the
-- database owner credential held only by Render. Supabase anon/authenticated
-- clients receive no direct table grants or policies.

DO $$
DECLARE
  table_name text;
  protected_tables text[] := ARRAY[
    'users', 'courses', 'course_modules', 'lessons', 'course_materials',
    'enrollments', 'user_progress', 'live_classes', 'live_class_attendance',
    'document_access_logs', 'audit_logs', 'ai_chat_sessions',
    'ai_chat_messages', 'leads', 'lead_notes', 'follow_ups', 'blogs',
    'visitor_analytics', 'cookie_consents', 'analytics_events', 'batches',
    'course_videos', 'protected_documents', 'protected_document_events',
    'labs', 'lab_flags', 'lab_attempts', 'quizzes', 'quiz_questions',
    'quiz_attempts', 'assignments', 'assignment_submissions', 'certificates',
    'payment_intents', 'payment_events'
  ];
BEGIN
  FOREACH table_name IN ARRAY protected_tables LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
      IF to_regrole('anon') IS NOT NULL THEN
        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', table_name);
      END IF;
      IF to_regrole('authenticated') IS NOT NULL THEN
        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM authenticated', table_name);
      END IF;
    END IF;
  END LOOP;
END $$;
