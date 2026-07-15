# Blog and Resources Restoration

Date: June 11, 2026

## Summary

The blog/resources section remains active and has been improved instead of removed. Homepage resources now use the database-backed blog API.

## Backend Changes

Added migration:

```text
cyberscout-server/db/migrations/006_blog_metadata.sql
```

Added blog metadata:

- `category`
- `author_name`
- `published_at`
- `last_reviewed_at`

Repository mapping updated:

```text
cyberscout-server/src/db/repositories.js
```

## Frontend Changes

Updated:

```text
cyberscout/src/pages/auth/WelcomePage.jsx
cyberscout/src/pages/public/BlogListPage.jsx
cyberscout/src/pages/public/BlogDetailPage.jsx
cyberscout/src/pages/public/PlatformInfoPages.jsx
cyberscout/src/pages/public/PublicCoursePage.jsx
```

## Blog Category Structure

Visible category structure on `/blog`:

- Beginner Cybersecurity
- Ethical Hacking
- Web Security
- SOC & Defensive Security
- Digital Forensics
- Cloud Security
- Career Guidance

Categories are exposed as crawlable/filterable links using:

```text
/blog?category=...
```

## Homepage Blog Cards

The homepage now displays latest published blogs with:

- title
- excerpt
- category
- author
- published date

## Internal Linking

- Blogs link to courses and learning paths.
- Course pages link to related blog guides.
- Learning path pages link to related blog guides.
- Resource pages link to category-filtered blog listings.

## Notes

- No thin SEO spam pages were created.
- Empty future categories are shown as categories, not fake posts.
