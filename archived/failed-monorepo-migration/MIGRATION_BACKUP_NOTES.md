# Migration Backup Notes

## Backup Created
- Backup branch: `migration-backup-before-platform-merge-20260601`
- Source branch: `main`
- Source commit: `adab7ea`

## Existing Project Snapshot
- Existing frontend: `cyberscout/`
- Existing backend: `cyberscout-server/`
- Existing useful assets: `cyberscout/public/brand/*.png`, favicon/icons, existing Cyber Lab IN landing copy, course outlines, and login/OAuth work.
- Existing weak areas: Vite/Express split, static client data, in-memory auth store, no Prisma database, no course-isolated API layer, no production dashboard APIs.

## Migration Strategy
- Preserve the old project folders in place for audit/history while promoting the new production-ready monorepo at the repository root.
- Preserve Cyber Lab IN logo assets by copying them into `apps/web/public/brand`.
- Preserve course copy and positioning in the new public landing page and future seed data.
- Use `/Users/a/Desktop/Dev/cyberlabin-platform` only as a reference/source scaffold.

## Recovery
To inspect or recover the pre-merge state:

```bash
git checkout migration-backup-before-platform-merge-20260601
```

