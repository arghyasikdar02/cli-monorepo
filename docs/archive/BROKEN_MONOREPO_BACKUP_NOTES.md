# Broken Monorepo Backup Notes

## What Was Generated
The previous migration generated a new monorepo-style platform at the repository root with:

- `apps/`
- `services/`
- `packages/`
- `infra/`
- `prisma/`
- `supabase/`
- `.github/workflows/`
- generated deployment documentation
- generated root `package.json`, `pnpm-workspace.yaml`, `vercel.json`, and pnpm lockfile

It also moved the original active app into `legacy/pre-migration/`.

## Why It Is Being Deactivated
The generated monorepo changed the original architecture from the existing Vite frontend + Express backend into a new Next.js workspace. That was not the desired direction for current development, because the original login/signup/auth flow, existing pages, existing routes, UI, and business logic must remain the active application.

## Where It Is Preserved
The generated monorepo and related generated deployment files are being moved into:

```text
archived/failed-monorepo-migration/
```

The original app is being restored from:

```text
legacy/pre-migration/
```

No enterprise features are being added during this restore. Future work should be incremental on top of the restored legacy app.

