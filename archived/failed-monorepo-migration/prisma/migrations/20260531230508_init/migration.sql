CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING', 'DELETED');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING');

-- CreateEnum
CREATE TYPE "LiveStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('NEW', 'CONTACTED', 'DEMO_SCHEDULED', 'DEMO_DONE', 'PAYMENT_INTENT', 'CONVERTED', 'COLD', 'LOST');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "auth_user_id" TEXT,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "assigned_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "level" TEXT,
    "price_cents" INTEGER NOT NULL DEFAULT 0,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batches" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_students" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batch_students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_modules" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "course_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "module_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content_md" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "unlock_rule" JSONB,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_videos" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "video_url" TEXT,
    "embed_url" TEXT,
    "duration_seconds" INTEGER,
    "is_protected" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_resources" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "storage_key" TEXT,
    "url" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'enrolled',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "lesson_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protected_documents" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "lesson_id" UUID,
    "title" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "page_count" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "watermark_policy" JSONB,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "protected_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_page_views" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "page_number" INTEGER NOT NULL,
    "ip" TEXT,
    "user_agent" TEXT,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_page_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "batch_id" UUID,
    "user_id" UUID NOT NULL,
    "subscription_id" UUID,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'PENDING',
    "enrolled_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'platform',
    "course_id" UUID,
    "price_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "interval" TEXT NOT NULL DEFAULT 'one_time',
    "features" JSONB,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'manual',
    "provider_subscription_id" TEXT,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "renews_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "course_id" UUID,
    "subscription_id" UUID,
    "amount_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "provider" TEXT NOT NULL DEFAULT 'manual',
    "provider_payment_id" TEXT,
    "status" TEXT NOT NULL,
    "raw_payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "course_id" UUID,
    "discount_type" TEXT NOT NULL,
    "discount_value" INTEGER NOT NULL,
    "max_redemptions" INTEGER,
    "redeemed_count" INTEGER NOT NULL DEFAULT 0,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_classes" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "batch_id" UUID,
    "instructor_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "stream_url" TEXT,
    "embed_url" TEXT,
    "recording_url" TEXT,
    "scheduled_start" TIMESTAMP(3) NOT NULL,
    "scheduled_end" TIMESTAMP(3) NOT NULL,
    "join_open_minutes_before" INTEGER NOT NULL DEFAULT 15,
    "status" "LiveStatus" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "live_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_class_attendance" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "batch_id" UUID,
    "live_class_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "joined_at" TIMESTAMP(3),
    "left_at" TIMESTAMP(3),
    "watch_duration_seconds" INTEGER NOT NULL DEFAULT 0,
    "ip" TEXT,
    "device" JSONB,
    "attendance_status" TEXT NOT NULL DEFAULT 'joined',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_class_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_viewer_events" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "batch_id" UUID,
    "live_class_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_payload" JSONB,
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_viewer_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "pass_percentage" INTEGER NOT NULL DEFAULT 70,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "quiz_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" JSONB,
    "correct_answer" JSONB,
    "explanation" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "quiz_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "answers" JSONB,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "due_at" TIMESTAMP(3),
    "max_score" INTEGER NOT NULL DEFAULT 100,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_submissions" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "assignment_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT,
    "file_key" TEXT,
    "score" INTEGER,
    "feedback" TEXT,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "submitted_at" TIMESTAMP(3),
    "graded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "labs" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "access_tier" TEXT NOT NULL DEFAULT 'paid',
    "lab_mode" TEXT NOT NULL DEFAULT 'manual',
    "docker_image" TEXT,
    "guide_md" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "labs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_sessions" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "lab_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "container_id" TEXT,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_attempts" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "lab_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "session_id" UUID,
    "score" INTEGER NOT NULL DEFAULT 0,
    "hints_used" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_flags" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "lab_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "flag_hash" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "hint" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_events" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "batch_id" UUID,
    "user_id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID,
    "event_type" TEXT NOT NULL,
    "event_value" DECIMAL(65,30),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_summary" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "batch_id" UUID,
    "user_id" UUID NOT NULL,
    "lessons_completed" INTEGER NOT NULL DEFAULT 0,
    "videos_percent" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "labs_completed" INTEGER NOT NULL DEFAULT 0,
    "quiz_average" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "streak_days" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progress_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboards" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "batch_id" UUID,
    "user_id" UUID NOT NULL,
    "rank" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "lab_score" INTEGER NOT NULL DEFAULT 0,
    "quiz_score" INTEGER NOT NULL DEFAULT 0,
    "streak_score" INTEGER NOT NULL DEFAULT 0,
    "time_efficiency_score" INTEGER NOT NULL DEFAULT 0,
    "period" TEXT NOT NULL DEFAULT 'all_time',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaderboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_templates" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "html_template" TEXT NOT NULL,
    "config" JSONB,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "certificate_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "template_id" UUID,
    "certificate_number" TEXT NOT NULL,
    "verification_hash" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_chat_sessions" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ai_chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_chat_messages" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "citations" JSONB,
    "token_count" INTEGER,
    "safety_metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_base_documents" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "source_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "storage_key" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "uploaded_by" UUID,
    "ingested_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "knowledge_base_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_chunks" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "kb_document_id" UUID NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "token_count" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "embeddings" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "chunk_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "embedding" vector,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "interested_course_id" UUID,
    "assigned_owner_id" UUID,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "education_profession" TEXT,
    "source_page" TEXT NOT NULL,
    "lead_source" TEXT NOT NULL,
    "message" TEXT,
    "consent_checkbox" BOOLEAN NOT NULL,
    "stage" "LeadStage" NOT NULL DEFAULT 'NEW',
    "score" INTEGER NOT NULL DEFAULT 0,
    "conversion_status" TEXT NOT NULL DEFAULT 'not_converted',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_notes" (
    "id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "note" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_followups" (
    "id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "follow_up_at" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "outcome" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_followups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_activities" (
    "id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "owner_id" UUID,
    "activity_type" TEXT NOT NULL,
    "outcome" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_campaigns" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT,
    "medium" TEXT,
    "campaign_code" TEXT,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "budget_cents" INTEGER,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" UUID NOT NULL,
    "course_id" UUID,
    "batch_id" UUID,
    "user_id" UUID,
    "lead_id" UUID,
    "event_type" TEXT NOT NULL,
    "event_payload" JSONB,
    "source" TEXT,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_user_id" UUID,
    "course_id" UUID,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID,
    "action" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "ip" TEXT,
    "user_agent" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "course_id" UUID,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'in_app',
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_jobs" (
    "id" UUID NOT NULL,
    "job_type" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "run_after" TIMESTAMP(3),
    "locked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_user_id_key" ON "users"("auth_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "courses_status_idx" ON "courses"("status");

-- CreateIndex
CREATE INDEX "batches_course_id_status_idx" ON "batches"("course_id", "status");

-- CreateIndex
CREATE INDEX "batch_students_course_id_user_id_idx" ON "batch_students"("course_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "batch_students_batch_id_user_id_key" ON "batch_students"("batch_id", "user_id");

-- CreateIndex
CREATE INDEX "course_modules_course_id_sort_order_idx" ON "course_modules"("course_id", "sort_order");

-- CreateIndex
CREATE INDEX "lessons_course_id_module_id_sort_order_idx" ON "lessons"("course_id", "module_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_course_id_slug_key" ON "lessons"("course_id", "slug");

-- CreateIndex
CREATE INDEX "lesson_videos_course_id_lesson_id_idx" ON "lesson_videos"("course_id", "lesson_id");

-- CreateIndex
CREATE INDEX "lesson_resources_course_id_lesson_id_idx" ON "lesson_resources"("course_id", "lesson_id");

-- CreateIndex
CREATE INDEX "protected_documents_course_id_lesson_id_idx" ON "protected_documents"("course_id", "lesson_id");

-- CreateIndex
CREATE INDEX "document_page_views_course_id_viewed_at_idx" ON "document_page_views"("course_id", "viewed_at");

-- CreateIndex
CREATE INDEX "document_page_views_user_id_document_id_idx" ON "document_page_views"("user_id", "document_id");

-- CreateIndex
CREATE INDEX "enrollments_course_id_status_idx" ON "enrollments"("course_id", "status");

-- CreateIndex
CREATE INDEX "enrollments_user_id_course_id_status_idx" ON "enrollments"("user_id", "course_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_code_key" ON "subscription_plans"("code");

-- CreateIndex
CREATE INDEX "subscription_plans_course_id_status_idx" ON "subscription_plans"("course_id", "status");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_status_idx" ON "subscriptions"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_provider_payment_id_key" ON "payments"("provider_payment_id");

-- CreateIndex
CREATE INDEX "payments_user_id_status_idx" ON "payments"("user_id", "status");

-- CreateIndex
CREATE INDEX "payments_course_id_status_idx" ON "payments"("course_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_course_id_status_idx" ON "coupons"("course_id", "status");

-- CreateIndex
CREATE INDEX "live_classes_course_id_batch_id_scheduled_start_idx" ON "live_classes"("course_id", "batch_id", "scheduled_start");

-- CreateIndex
CREATE INDEX "live_class_attendance_live_class_id_user_id_idx" ON "live_class_attendance"("live_class_id", "user_id");

-- CreateIndex
CREATE INDEX "live_class_attendance_course_id_batch_id_idx" ON "live_class_attendance"("course_id", "batch_id");

-- CreateIndex
CREATE INDEX "live_viewer_events_live_class_id_created_at_idx" ON "live_viewer_events"("live_class_id", "created_at");

-- CreateIndex
CREATE INDEX "live_viewer_events_course_id_batch_id_created_at_idx" ON "live_viewer_events"("course_id", "batch_id", "created_at");

-- CreateIndex
CREATE INDEX "quizzes_course_id_lesson_id_idx" ON "quizzes"("course_id", "lesson_id");

-- CreateIndex
CREATE INDEX "quiz_questions_quiz_id_sort_order_idx" ON "quiz_questions"("quiz_id", "sort_order");

-- CreateIndex
CREATE INDEX "quiz_questions_course_id_idx" ON "quiz_questions"("course_id");

-- CreateIndex
CREATE INDEX "quiz_attempts_course_id_user_id_quiz_id_idx" ON "quiz_attempts"("course_id", "user_id", "quiz_id");

-- CreateIndex
CREATE INDEX "assignments_course_id_lesson_id_idx" ON "assignments"("course_id", "lesson_id");

-- CreateIndex
CREATE INDEX "assignment_submissions_course_id_assignment_id_user_id_idx" ON "assignment_submissions"("course_id", "assignment_id", "user_id");

-- CreateIndex
CREATE INDEX "labs_course_id_lesson_id_idx" ON "labs"("course_id", "lesson_id");

-- CreateIndex
CREATE UNIQUE INDEX "labs_course_id_slug_key" ON "labs"("course_id", "slug");

-- CreateIndex
CREATE INDEX "lab_sessions_course_id_user_id_status_idx" ON "lab_sessions"("course_id", "user_id", "status");

-- CreateIndex
CREATE INDEX "lab_attempts_course_id_user_id_lab_id_idx" ON "lab_attempts"("course_id", "user_id", "lab_id");

-- CreateIndex
CREATE INDEX "lab_flags_course_id_lab_id_idx" ON "lab_flags"("course_id", "lab_id");

-- CreateIndex
CREATE INDEX "progress_events_course_id_user_id_created_at_idx" ON "progress_events"("course_id", "user_id", "created_at");

-- CreateIndex
CREATE INDEX "progress_events_course_id_batch_id_created_at_idx" ON "progress_events"("course_id", "batch_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "progress_summary_course_id_batch_id_user_id_key" ON "progress_summary"("course_id", "batch_id", "user_id");

-- CreateIndex
CREATE INDEX "leaderboards_course_id_batch_id_period_rank_idx" ON "leaderboards"("course_id", "batch_id", "period", "rank");

-- CreateIndex
CREATE INDEX "certificate_templates_course_id_status_idx" ON "certificate_templates"("course_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_certificate_number_key" ON "certificates"("certificate_number");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_verification_hash_key" ON "certificates"("verification_hash");

-- CreateIndex
CREATE INDEX "certificates_course_id_user_id_idx" ON "certificates"("course_id", "user_id");

-- CreateIndex
CREATE INDEX "ai_chat_sessions_course_id_user_id_idx" ON "ai_chat_sessions"("course_id", "user_id");

-- CreateIndex
CREATE INDEX "ai_chat_messages_session_id_created_at_idx" ON "ai_chat_messages"("session_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_chat_messages_course_id_user_id_idx" ON "ai_chat_messages"("course_id", "user_id");

-- CreateIndex
CREATE INDEX "knowledge_base_documents_course_id_status_idx" ON "knowledge_base_documents"("course_id", "status");

-- CreateIndex
CREATE INDEX "document_chunks_course_id_kb_document_id_idx" ON "document_chunks"("course_id", "kb_document_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_chunks_kb_document_id_chunk_index_key" ON "document_chunks"("kb_document_id", "chunk_index");

-- CreateIndex
CREATE INDEX "embeddings_course_id_idx" ON "embeddings"("course_id");

-- CreateIndex
CREATE INDEX "leads_interested_course_id_stage_idx" ON "leads"("interested_course_id", "stage");

-- CreateIndex
CREATE INDEX "leads_email_idx" ON "leads"("email");

-- CreateIndex
CREATE INDEX "lead_notes_lead_id_idx" ON "lead_notes"("lead_id");

-- CreateIndex
CREATE INDEX "lead_followups_owner_id_status_follow_up_at_idx" ON "lead_followups"("owner_id", "status", "follow_up_at");

-- CreateIndex
CREATE INDEX "sales_activities_lead_id_created_at_idx" ON "sales_activities"("lead_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "marketing_campaigns_campaign_code_key" ON "marketing_campaigns"("campaign_code");

-- CreateIndex
CREATE INDEX "analytics_events_course_id_created_at_idx" ON "analytics_events"("course_id", "created_at");

-- CreateIndex
CREATE INDEX "analytics_events_event_type_created_at_idx" ON "analytics_events"("event_type", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_created_at_idx" ON "audit_logs"("actor_user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_course_id_created_at_idx" ON "audit_logs"("course_id", "created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");

-- CreateIndex
CREATE INDEX "system_jobs_status_run_after_idx" ON "system_jobs"("status", "run_after");
