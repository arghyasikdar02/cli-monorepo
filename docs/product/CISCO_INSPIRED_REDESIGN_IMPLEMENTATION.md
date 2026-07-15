# Cyber Lab IN Enterprise Public Website Redesign

Date: July 15, 2026

## Outcome

The restored legacy Vite/React and Express application remains the active product. Its public website now uses an original enterprise editorial design system informed by the hierarchy, navigation depth, content density and responsive discipline of established technology organisations.

The redesign does not copy Cisco trademarks, copy, graphics or source code. It uses Cyber Lab IN branding, approved repository content, database-backed courses and blogs, and existing application workflows.

## Completed Work

### Global experience

- Added a compact utility bar and a primary enterprise navigation system.
- Added keyboard-accessible mega menus with useful content columns and highlighted paths.
- Added a mobile navigation alternative with accordion groups and approximately 44px touch targets.
- Added a search overlay that directs visitors to existing course, learning-path and resource routes.
- Added a skip-to-content link, visible focus states and reduced-motion handling.
- Added a structured enterprise footer with only valid routes and a third-party trademark disclaimer.
- Added reusable breadcrumbs, page introductions, public loading/error/empty states and legal-page layout.
- Replaced the homepage fallback redirect with an accessible 404 page.

### Homepage

- Rebuilt the hero as an editorial split layout with a practical learning-workflow visual derived from real product concepts.
- Added quick-access links, a direct platform answer, qualitative credibility signals and database-backed featured courses.
- Added learning paths and a four-stage learning workflow.
- Added a substantial practical-labs section without claiming unimplemented browser lab infrastructure.
- Added audience-specific outcomes for learners, institutions and businesses.
- Added restrained technology/topic labels without implying endorsements.
- Added the verified instructor profile and database-backed latest resources.
- Preserved the real lead form, FAQ assistant and cookie-consent flows.
- Omitted fictional metrics, testimonials, partner logos and urgency tactics.

### Public and auth pages

- Redesigned course listing and course-detail pages with real API data and honest loading, error and empty states.
- Added consistent public layouts for learning paths, labs, resources, instructor, about, contact, organisation and policy pages.
- Strengthened the Arghya Sikdar profile with the supplied biography, credentials, experience context, authored courses, authored resources and learning-path links.
- Redesigned login, signup and role login pages while preserving handlers, Google OAuth, role checks and redirects.
- Kept Login as the default authentication mode and preserved explicit login/signup query modes.
- Preserved authenticated dashboards and all private learning routes.

## Accessibility

- Semantic landmarks and heading hierarchy.
- Keyboard-operable mega menus, mobile navigation, search, modals and accordions.
- Escape-key dismissal for overlays.
- Visible high-contrast focus states.
- Descriptive labels and status announcements for forms.
- Reduced-motion support.
- No essential information communicated only through colour.
- Responsive touch targets and no horizontal overflow at tested widths.

## Performance

- Removed the unused Space Grotesk font request.
- Added route-level code splitting for public and authenticated pages.
- Reduced the main production JavaScript bundle to approximately 253 kB uncompressed / 75 kB gzip.
- Kept animations CSS-based and limited to navigation and small interaction feedback.
- Preserved API-backed content rather than duplicating large static datasets in the frontend.
- Updated Vite from 8.0.15 to the patched 8.0.16 release; dependency audit reports zero vulnerabilities.

## SEO

- Preserved the platform homepage canonical, Open Graph, Twitter and JSON-LD implementation.
- Preserved database-backed Article and dedicated Course structured data.
- Added safe JSON-LD serialization for database-authored fields.
- Kept crawlable course, path, resource, instructor and policy links.
- Expanded `sitemap.xml` for the implemented public information architecture.
- Preserved `robots.txt` and the direct `/` homepage.

## Functional Systems Preserved

- Email/password signup and login.
- Google OAuth configuration and callback flow.
- Role-aware redirects and protected dashboards.
- Course enrollment and course-isolated materials.
- Live classes, AI tutor, progress, account and support routes.
- Database-backed courses, blogs, leads and visitor analytics.
- Landing, chatbot and course-popup lead sources.
- Cookie consent preferences.

## Verification Results

- `npm run install:all`: passed; database migrations and idempotent baseline seed completed.
- `npm run lint`: passed.
- `npm test`: 11/11 integration tests passed.
- `npm run build`: passed with Vite 8.0.16.
- `npm audit --prefix cyberscout --audit-level=high`: zero vulnerabilities.
- Responsive browser review: passed at 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920px with no horizontal overflow.
- Public route review: homepage, courses, course details, learning path, labs, instructor, blog, about, contact, FAQ and 404 passed.
- Learner login review: `student@cyberlabin.com` redirected to `/dashboard` and rendered real enrollment data.

## Genuine Content and Asset Gaps

These items are intentionally not replaced with fabricated material:

- Professional photograph of Arghya Sikdar.
- Authentic learning dashboard and cyber-lab screenshots for large editorial media.
- Real classroom or instructor-led session photography.
- Verified learner testimonials or partner case studies.
- Verified learner, completion, lab and outcome statistics.
- Approved social-profile URLs.
- Complete institution and business programme specifications.
- Published brochure files for courses that do not yet have them.

When supplied, these assets should replace the clearly labelled source placeholders without changing the public information architecture.

## Run Locally

```bash
npm run install:all
npm run dev
```

Or run the services separately:

```bash
npm run dev:backend
npm run dev:frontend
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:3001`
