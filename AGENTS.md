# Project guide

Team LU is a static, faithful adaptation of https://teamvale.netlify.app/ with a protected content editor. Preserve the reference's Spanish copy, blue and gold design, images, layout, and animations unless asked to change them.

## Architecture

- `public/index.html`: original page structure, Team LU branding, social metadata, stable `data-copy` identifiers.
- `public/assets/site.css`: reference styling, with original embedded images extracted into local assets.
- `public/assets/runtime-0.js` through `runtime-10.js`: original interactions; structured content comes from `window.TEAM_CONTENT`.
- `public/assets/bootstrap.js`: loads published content with initial seed fallback, applies text, then loads runtime scripts in order.
- `public/assets/default-content.json`: immutable initial reference content, not a persistence layer.
- `public/editor.html` and `public/assets/editor.*`: Spanish editor, nested record forms, Identity invitation/recovery UI, publishing.
- `netlify/functions/session.mts`: server-side Identity session operations. Never return tokens or passwords.
- `netlify/functions/content.mts`: public read endpoint, admin-only writes, content validation, optimistic revision checks.
- `db/schema.ts`, `db/index.ts`, `drizzle.config.ts`: Drizzle schema and Netlify Database adapter.
- `netlify/database/migrations`: generated migrations applied by the platform on deployment.

## Conventions and decisions

No frontend framework or build step is needed because the reference supplied a complete HTML page. Netlify publishes `public` directly. Functions use TypeScript and the modern Web Request/Response API. Use `@netlify/identity` for auth, and check server-controlled `user.roles` for `admin` on every write. First administrator invitation and role assignment happen in the Netlify dashboard. There is no public administrator signup or first-visitor ownership claim.

Use `textContent` for editable text, validate structured content server-side, and never interpret saved content as HTML or JavaScript. Member histories are ordered newest first. Keep stable text identifiers when changing page structure. Preserve dynamic values generated from progress and calendar data rather than exposing their fallback labels as editable copy. Only change persistent data through Netlify Database; defaults provide initial content and a public-page fallback during service outages. Editor load failures must not silently offer stale seed data for publishing.

Install Drizzle packages from the beta dist-tag to retain the Netlify adapter. Generate a migration after schema changes; do not apply migrations manually. The platform handles build validation. Do not run local build, dev-server, typecheck, or test commands during automated editing sessions. Review edited files instead. For human local development use `npm run dev` on port 8889.
