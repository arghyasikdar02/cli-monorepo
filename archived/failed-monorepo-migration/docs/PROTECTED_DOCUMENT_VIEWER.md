# Protected Document Viewer

## Current Status
- Manifest route checks auth and enrollment.
- Page route requires short-lived user/document token.
- Page response is watermarked and never returns a raw PDF URL.
- Page access writes `document_page_views` and `audit_logs`.

## Routes
- `GET /api/documents/:id/manifest`
- `GET /api/documents/:id/pages/:page?token=...`

## Production Hardening
- Replace SVG placeholder rendering with real PDF rasterization from private storage.
- Store raw PDFs only in private Supabase/R2/S3 buckets.
- Add durable rate limits to prevent scraping.
- Add blur/copy/print deterrents in the viewer UI.

