# Backend Implementation Summary

This project remains the restored legacy application:

- Frontend: `cyberscout/`
- Backend: `cyberscout-server/`
- Architecture: Vite React + Express
- No monorepo was created.

## What Changed

The Express backend now includes role-aware platform modules on top of the legacy auth flow.

Added systems:

- Auth role claims and role-based redirect hints
- Demo users for student, admin, instructor, marketing, and ops access
- Auth, role, dashboard, and course-enrollment middleware
- Users, courses, enrollments, live classes, videos, documents, labs, quizzes, assignments, progress, leaderboards, certificates, AI/RAG, leads/CRM, analytics, payments, and audit routes
- Protected document viewer starter that does not expose raw PDF URLs
- Course-specific AI/RAG mock provider with usage limits
- Razorpay starter order and webhook flow with idempotency protection
- Backend-backed dashboard aggregate routes

## Storage Status

The current MVP store is `cyberscout-server/src/store/platformStore.js`.

It is an in-memory dev-only store created to preserve the legacy architecture and avoid imposing Prisma/monorepo changes. `DATABASE_SCHEMA.md` documents the PostgreSQL-ready schema that should replace this store in production.

## Security Controls Added

- JWT auth middleware
- Role middleware
- Course enrollment middleware
- Course-specific access checks for videos, live classes, PDFs, labs, quizzes, assignments, AI chats, progress, leaderboards, and certificates
- Suspended user rejection
- Admin/system audit logs
- Protected PDF viewer starter with access logs and watermark metadata

## Production Notes

Before production deployment, replace the in-memory store with PostgreSQL or a SQLite-to-PostgreSQL compatible data layer, then apply the schema in `DATABASE_SCHEMA.md`.
