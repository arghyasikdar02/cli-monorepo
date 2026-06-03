# Testing Instructions

Run baseline checks:
```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm prisma validate
corepack pnpm build
```

Required test suites before beta:
- Course A student cannot fetch Course B lessons, live classes, documents, labs, quizzes, leaderboard, AI sessions, or certificates.
- Batch A student cannot join Batch B live class.
- Protected document network trace never exposes raw PDF URLs.
- Live join denies wrong course, wrong batch, inactive enrollment, cancelled class, and closed join window.
- RAG retrieval always includes course_id and refuses outside-course material.
- CLI commands require token, support dry-run, and write audit logs.
- Lead capture requires consent and persists source metadata.
