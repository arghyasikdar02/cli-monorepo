# Architecture Documentation

The active product is deliberately a two-application legacy architecture:

- `cyberscout/`: Vite and React public website plus authenticated dashboards.
- `cyberscout-server/`: Express API, SQLite repositories, migrations, authorization and audit logging.

Start with [the diagrams](../diagrams/README.md), then review:

- `API_ROUTES_DOCUMENTATION.md`
- `DATABASE_SCHEMA.md`
- `COURSE_ISOLATION_RULES.md`
- `ROLE_BASED_LOGIN_AND_DASHBOARD_FLOW.md`

The Supabase SQL under `/supabase` is a migration target, not the active runtime adapter.
