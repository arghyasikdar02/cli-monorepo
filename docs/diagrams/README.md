# Cyber Lab IN Diagrams

This folder contains developer handoff diagrams for the current Cyber Lab IN legacy app.

## Files

- `ER_DIAGRAM.md` - readable ERD sections, constraints, delete behavior, and database limitations.
- `DFD.md` - context-level and Level 1 data flow diagrams.
- `CLASS_COMPONENT_DIAGRAM.md` - React/Express component and service map.
- `er-diagram.mmd` - complete Mermaid ERD source from the current PostgreSQL migrations.
- `context-dfd.mmd` - context DFD Mermaid source.
- `level-1-dfd.mmd` - Level 1 DFD Mermaid source.
- `class-component-diagram.mmd` - component/service diagram Mermaid source.

## Export Diagrams To SVG Or PNG

Mermaid CLI is free and works locally.

```bash
npm install -g @mermaid-js/mermaid-cli
```

Export SVG:

```bash
mmdc -i docs/diagrams/er-diagram.mmd -o docs/diagrams/er-diagram.svg
mmdc -i docs/diagrams/context-dfd.mmd -o docs/diagrams/context-dfd.svg
mmdc -i docs/diagrams/level-1-dfd.mmd -o docs/diagrams/level-1-dfd.svg
mmdc -i docs/diagrams/class-component-diagram.mmd -o docs/diagrams/class-component-diagram.svg
```

Export PNG:

```bash
mmdc -i docs/diagrams/er-diagram.mmd -o docs/diagrams/er-diagram.png
mmdc -i docs/diagrams/context-dfd.mmd -o docs/diagrams/context-dfd.png
mmdc -i docs/diagrams/level-1-dfd.mmd -o docs/diagrams/level-1-dfd.png
mmdc -i docs/diagrams/class-component-diagram.mmd -o docs/diagrams/class-component-diagram.png
```

On macOS, if Mermaid CLI cannot find its bundled Chrome but Google Chrome is installed, run:

```bash
PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  mmdc -i docs/diagrams/er-diagram.mmd -o docs/diagrams/er-diagram.svg
```

If Chrome/Chromium sandboxing blocks export on a local machine, use:

```bash
mmdc -p docs/diagrams/puppeteer-config.json -i docs/diagrams/er-diagram.mmd -o docs/diagrams/er-diagram.svg
```

Create `docs/diagrams/puppeteer-config.json` only if needed:

```json
{
  "args": ["--no-sandbox", "--disable-setuid-sandbox"]
}
```

## Developer Handoff Summary

- Auth works through Express routes, bcrypt password hashing, JWT signing, and the HTTP-only `cli_session` cookie.
- Roles are stored in `users.role` and `users.roles`; middleware reads the parsed role list.
- Course access is guarded through centralized middleware and authorization service checks.
- Lead capture writes to the `leads` table from landing forms, course popups, and chatbot flows.
- Public course pages are marketing pages. LMS course pages are protected and must check enrollment before showing private materials.
- Blog and public course routes are cacheable. Private dashboards and account APIs are `no-store`.

## Known Limitations

- Supabase PostgreSQL is the active production database adapter.
- Direct anon/authenticated table access is denied by `supabase/rls-policies.sql`; application authorization lives in Express.
- Render is stateless and does not store application data on its filesystem.
- Course category relationships remain slug-based rather than foreign-key enforced.
- Some mounted advanced modules are still MVP/starter quality compared with the full PRD.

## Before Real Production Use

- Apply tracked migrations and deny-by-default Supabase access controls.
- Verify course isolation against the target Supabase project before cutover.
- Add persistent storage for protected documents and any generated assets.
- Replace starter payment, certificates, lab, and advanced RAG persistence with production tables and service integrations.
- Re-run build, route smoke tests, and role/course isolation tests after migration.
