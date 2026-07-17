# SEO/AEO Homepage Implementation

Source of truth: `/Users/a/Downloads/Recommended AEO and SEO Homepage Structure for Cyber Lab IN.pdf`

Date implemented: June 10, 2026
Latest update: June 11, 2026

## Summary

The root homepage at `/` has been moved from course-specific positioning to platform-level Cyber Lab IN positioning around the primary keyword:

```text
Online Cybersecurity Courses with Hands-On Labs
```

The dedicated course positioning remains on:

```text
/courses/cybersecurity/cyber-security-essentials
```

## Recommendation Map

| PDF recommendation | Status | File path | Notes |
| --- | --- | --- | --- |
| Platform-level homepage title | Implemented | `cyberscout/index.html`, `cyberscout/src/pages/auth/WelcomePage.jsx` | Title is `Online Cybersecurity Courses with Hands-On Labs \| Cyber Lab IN`. |
| Platform-level meta description | Implemented | `cyberscout/index.html`, `cyberscout/src/pages/auth/WelcomePage.jsx` | Uses the recommended guided lessons, hands-on labs and practical scenarios copy. |
| H1: Learn Cybersecurity Online with Hands-On Labs | Implemented | `cyberscout/src/pages/auth/WelcomePage.jsx` | Exact H1 used. |
| Remove homepage course breadcrumb | Implemented | `cyberscout/src/pages/auth/WelcomePage.jsx` | Homepage no longer renders `Home / Courses / Cybersecurity / Cyber Security Essentials`. |
| Keep full Course schema off homepage | Implemented | `cyberscout/src/pages/auth/WelcomePage.jsx` | Homepage uses EducationalOrganization, WebSite, WebPage and ItemList only. |
| Featured course cards with crawlable links | Implemented | `cyberscout/src/pages/auth/WelcomePage.jsx` | Course cards use normal `href` links. Future courses are clearly labelled as curriculum roadmap pages. |
| Direct brand answer section | Implemented | `cyberscout/src/pages/auth/WelcomePage.jsx` | Adds `What Is Cyber Lab IN?` answer-summary box. |
| Learning paths section | Implemented | `cyberscout/src/pages/auth/WelcomePage.jsx`, `cyberscout/src/pages/public/PlatformInfoPages.jsx` | Adds homepage cards and valid path routes. |
| Why learn with Cyber Lab IN | Implemented | `cyberscout/src/pages/auth/WelcomePage.jsx` | Uses the requested value points. |
| Platform workflow | Implemented | `cyberscout/src/pages/auth/WelcomePage.jsx` | Adds the four-step process without HowTo schema. |
| Audience section | Implemented | `cyberscout/src/pages/auth/WelcomePage.jsx` | Uses the requested audience groups. |
| Skills learners can build | Implemented | `cyberscout/src/pages/auth/WelcomePage.jsx` | Uses the requested skill clusters. |
| Featured beginner course | Implemented | `cyberscout/src/pages/auth/WelcomePage.jsx` | Condensed summary only; full course details remain on the course page. |
| Instructor and expertise | Implemented | `cyberscout/src/pages/auth/WelcomePage.jsx`, `cyberscout/src/pages/public/PlatformInfoPages.jsx` | Adds founder/CEO positioning, expertise links, authored content and instructor profile schema. |
| Learner evidence and trust | Implemented | `cyberscout/src/pages/auth/WelcomePage.jsx` | Avoids fake reviews, counts and placement claims; adds reviewed-by, last-reviewed and course ownership signals. |
| Career guidance wording | Implemented | `cyberscout/src/pages/auth/WelcomePage.jsx` | Explicitly states training supports preparation and does not guarantee employment. |
| Latest resources section | Implemented | `cyberscout/src/pages/auth/WelcomePage.jsx`, `cyberscout/src/pages/public/BlogListPage.jsx`, `cyberscout-server/db/migrations/006_blog_metadata.sql` | Uses database-backed published blogs with title, excerpt, category, author and published date. |
| Homepage FAQ content | Implemented | `cyberscout/src/pages/auth/WelcomePage.jsx` | FAQ is visible content only; no FAQ rich-result dependency. |
| Platform-level nav/footer | Implemented | `cyberscout/src/pages/auth/WelcomePage.jsx` | Adds requested top nav and footer link set. |
| Missing public routes | Implemented | `cyberscout/src/App.jsx`, `cyberscout/src/pages/public/PlatformInfoPages.jsx` | Adds courses roadmap, learning paths, labs, resources, instructors, contact and policy aliases. |
| Robots and sitemap | Implemented | `cyberscout/public/robots.txt`, `cyberscout/public/sitemap.xml` | Static Vite public assets. |
| OG image declaration | Partially implemented | `cyberscout/index.html`, `cyberscout/src/pages/auth/WelcomePage.jsx` | Uses existing brand logo asset. A proper 1200x630 marketing OG image should be created before large-scale launch. |
| Testimonials/reviews | Not implemented | N/A | No real review data was available. Fake testimonials were not added. |
| Full Course schema on course page | Existing | `cyberscout/src/pages/public/PublicCoursePage.jsx` | Dedicated course page retains course-specific schema. |
| AEO answer paragraphs under H2 sections | Implemented | `cyberscout/src/pages/auth/WelcomePage.jsx` | Major H2 sections now include concise extractable answer paragraphs. |
| GEO entity associations | Implemented | `cyberscout/src/pages/auth/WelcomePage.jsx` | Homepage schema and copy associate Cyber Lab IN with cybersecurity education, hands-on labs, ethical hacking, SOC, web security and defensive security. |
| Blog category structure | Implemented | `cyberscout/src/pages/public/BlogListPage.jsx`, `cyberscout/src/pages/public/PlatformInfoPages.jsx` | Adds visible categories and category-filterable `/blog?category=...` links. |
| Internal links across blogs, courses and paths | Implemented | `cyberscout/src/pages/public/BlogDetailPage.jsx`, `cyberscout/src/pages/public/PublicCoursePage.jsx`, `cyberscout/src/pages/public/PlatformInfoPages.jsx` | Blogs link to courses and learning paths; courses and learning paths link back to guides. |

## Important Notes

- Future course URLs are valid but clearly marked as roadmap pages until course details are ready.
- The homepage does not add HowTo, Review, AggregateRating or fake testimonial schema.
- The canonical homepage URL remains `https://cyberlabin.com/`.
- Homepage latest resources now come from the existing blog API and Supabase PostgreSQL database.
- The instructor profile page uses Person and ProfilePage schema.
- `cyberscout-server` uses the same PostgreSQL data layer locally and in production; production points `DATABASE_URL` at Supabase.
