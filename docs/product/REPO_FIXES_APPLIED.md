# Repo Fixes Applied

Date: June 10, 2026

## Scope

Work was limited to the restored legacy project:

- Frontend: `cyberscout/`
- Backend: `cyberscout-server/`

No monorepo was created and `archived/failed-monorepo-migration/` was not modified.

## Frontend Fixes

- Rebuilt the root homepage as a platform-level Cyber Lab IN homepage.
- Removed course-specific breadcrumb/content from the homepage.
- Added missing public routes for learning paths, labs, resources, instructors, contact, policy aliases and certificate verification.
- Added transparent roadmap pages for future course URLs instead of thin or fake course pages.
- Updated static metadata in `cyberscout/index.html`.
- Added homepage JSON-LD for EducationalOrganization, WebSite, WebPage and ItemList.
- Added static `robots.txt` and `sitemap.xml`.
- Updated privacy, terms and refund pages to use Cyber Lab IN naming and `cyberlabin.com` email addresses.
- Removed an unsupported privacy-policy encryption claim from public copy.
- Removed an unsupported account-security help-center encryption claim and replaced it with deployment-verifiable security wording.

## Backend Fixes

- Added `neel0409@gmail.com` as a seeded local student login.
- Enrolled the seeded learner in Cyber Security Essentials so local dashboard checks have real course data.

## Build/Verification Notes

- `npm run lint` passed.
- `npm run build` passed.
- Full install and route/API smoke checks should be run before deployment.

## Remaining Production Notes

- Current backend storage is SQLite. This is acceptable for local testing and lightweight staging, but production should migrate to Supabase Postgres.
- A dedicated 1200x630 Open Graph image should be created before serious SEO/social launch.
- Future course pages should receive full validated curriculum, fee and enrolment data before being promoted.
