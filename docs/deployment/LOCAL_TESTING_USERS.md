# Local Testing Users

All seeded users use:

`password123`

Run the seed with `SEED_DEVELOPMENT_USERS=1` in a non-production environment. If these emails already exist locally, the development seed refreshes their password and role so stale hashes do not cause `Invalid credentials`.

These identities are development-only. Production does not create or reset them; provision staff deliberately with the protected `cliadm` workflow in the root README.

## Student

- Email: `student@cyberlabin.com`
- Login page: `/login`
- Redirect: `/dashboard`
- Role: `student`

## Existing Legacy Student

- Email: `neel0409@gmail.com`
- Login page: `/login`
- Redirect: `/dashboard`
- Role: `student`

## Admin

- Email: `admin@cyberlabin.com`
- Login page: `/admin/login`
- Redirect: `/admin/dashboard`
- Role: `admin`

## Instructor

- Email: `instructor@cyberlabin.com`
- Login page: `/instructor/login`
- Redirect: `/instructor/dashboard`
- Role: `instructor`

## Sales/Marketing

- Email: `marketing@cyberlabin.com`
- Login page: `/marketing/login`
- Redirect: `/marketing/dashboard`
- Roles: `marketing`, `sales`

## Ops

- Email: `ops@cyberlabin.com`
- Login page: `/ops/login`
- Redirect: `/ops/dashboard`
- Roles: `ops`, `lab_creator`
