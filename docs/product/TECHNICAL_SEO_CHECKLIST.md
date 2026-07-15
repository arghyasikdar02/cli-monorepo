# Technical SEO Checklist

Date: June 10, 2026

## Implemented

- [x] Root `/` renders the actual homepage.
- [x] `/welcome` redirects to `/`.
- [x] Homepage title is platform-level.
- [x] Homepage meta description is platform-level.
- [x] Homepage canonical URL is `https://cyberlabin.com/`.
- [x] Homepage Open Graph title and description are platform-level.
- [x] Open Graph image metadata is declared.
- [x] Twitter card metadata is declared.
- [x] Homepage H1 is `Learn Cybersecurity Online with Hands-On Labs`.
- [x] Homepage course-specific breadcrumb removed.
- [x] Homepage schema uses EducationalOrganization, WebSite, WebPage and ItemList.
- [x] Homepage does not use Course, HowTo, Review or AggregateRating schema.
- [x] Course cards use crawlable links.
- [x] Footer includes all requested policy and certificate links.
- [x] `robots.txt` added.
- [x] `sitemap.xml` added.
- [x] Public policy aliases added for `/privacy-policy` and `/refund-policy`.
- [x] Cookie policy route added.

## Partially Implemented

- [ ] Open Graph image uses an existing brand asset. Create a dedicated 1200x630 OG image for production.
- [ ] Future course pages are valid roadmap pages, not full published course pages.
- [ ] Certificate verification route exists, but public certificate lookup is not live yet.

## Do Not Add Without Real Data

- Fake review schema.
- Fake ratings.
- Fake placement claims.
- Fake testimonials.
- Fake partner logos.

## Production Follow-Up

- Validate sitemap in Google Search Console after deployment.
- Confirm `https://cyberlabin.com/sitemap.xml` and `https://cyberlabin.com/robots.txt` are served by Vercel.
- Replace the logo OG image with a purpose-built social preview image.
- Keep course schema limited to real dedicated course pages.
