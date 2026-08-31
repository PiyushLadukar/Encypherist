# Encypherist

The official website for **Encypherist**, the Computer Science & Engineering student
forum at Jhulelal Institute of Technology (JIT), Nagpur.

> A place where geeks get together — because geeks are code blooded.

## Project overview

This is a full Next.js site: a public-facing homepage, member roster, event system
with registration, and photo gallery, plus an admin CMS to manage all of it. Every
piece of content — the current 2026-27 roster, the session 2024-25 event history, the
tagline — was pulled from verified public sources (the college's own site, an official
PDF hosted there, and the forum's public Instagram bio), not invented. See
[`docs/research.md`](docs/research.md) for the full research trail: what's verified,
what's "likely" but unconfirmed, and what's flagged as a placeholder.

The visual language is an original system reverse-engineered from what makes
[cidc.dev](https://www.cidc.dev/) read as a premium engineering-org site rather than a
college club page — bounded canvas framing, a two-accent-color discipline, monospace
system metadata, a vertical event timeline — translated into Encypherist's own dark,
cipher-themed identity rather than copied. The full analysis and the principle-by-
principle translation live in [`docs/cidc-analysis.md`](docs/cidc-analysis.md).

**Current data mode: in-memory fake data**, not a live database. This was a deliberate
scope decision (see [Data mode](#data-mode-in-memory-fake-data) below) — the app is
fully functional end-to-end, but content resets when the server restarts. A complete
Supabase backend (schema, RLS policies, migrations) is already written and sitting in
the repo, ready to be wired in — see
[Switching to live Supabase](#switching-to-live-supabase-optional).

## Features

- **Boot sequence** — a ~1.2s session-scoped system-boot animation on first visit per
  browser session (`INITIALIZING... → NETWORK // ONLINE → SYSTEM // READY`), skipped
  instantly on repeat navigation and under `prefers-reduced-motion`.
- **Homepage** — a bounded-canvas hero with corner-bracket framing, a manifesto
  statement, four numbered core principles with hover-reveal detail, a decorative
  system-status readout, featured event, project build-log teaser, core team, recent
  events archive, gallery preview, community CTA.
- **Members** (`/members`) — filterable/searchable roster grouped by year, styled as
  digital ID cards with a terminal-window title strip (`ency://member/slug`), a
  derived functional domain tag, and an ACTIVE/ARCHIVED status; individual profile
  pages at `/members/[slug]`.
- **Projects** (`/projects`) — a real build-log: numbered project cards
  (`PROJECT_001`) with status (`ACTIVE` / `IN_DEVELOPMENT` / `DEPLOYED` / `ARCHIVED`),
  tech stack, contributors; detail pages at `/projects/[slug]` with problem/solution/
  stack/team sections. Ships with zero seeded entries — no real Encypherist project
  was found during research (see `docs/research.md` §11) — and shows an honest empty
  state rather than inventing one.
- **Events** (`/events`) — upcoming/announced events render as a vertical timeline
  (`REF_LOG`-numbered nodes down a rail, one CIDC mechanism adopted directly since it
  reads as a roadmap rather than a generic card grid); past events stay a grid
  ("archive" framing). Detail pages at `/events/[slug]` add a live countdown for
  future dates, plus schedule, FAQs, speakers, organizers, gallery.
- **Registration** — a real form at `/events/[slug]/register`, server-validated
  (zod), duplicate-email blocked, capacity- and deadline-aware.
- **Gallery** (`/gallery`) — masonry layout with a full keyboard-navigable lightbox.
- **Admin CMS** (`/admin`) — session-cookie auth, dashboard, full CRUD for events,
  projects and members (with an event preview that renders the exact same component
  as the public page), registrations viewer with CSV export, gallery manager with
  image upload, site settings.
- **Confidence badges** — anything not fully verified (see `docs/research.md`) carries
  a visible "Likely" or "Unverified" badge on the public site instead of being
  presented as fact.
- **SEO** — sitemap, robots.txt, per-page metadata, OpenGraph/Twitter cards.
- **Accessibility & motion** — keyboard-navigable lightbox/menus, focus states,
  `prefers-reduced-motion` respected throughout (boot sequence, scroll reveals).

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack), React 19, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui (base-ui primitives)
- **Animation:** Motion (`motion/react`)
- **Validation:** Zod
- **Data (current):** an in-memory store seeded from `seed/*.json`
- **Data (ready, not wired):** Supabase (Postgres, Auth, Storage) — schema in
  `supabase/migrations/`
- **Deployment target:** Vercel (or any Node host)

## Architecture

```
src/
  app/
    (public)/            homepage, members, events, gallery — public route group
    admin/
      login/              standalone, unauthenticated
      (protected)/        dashboard, events, members, registrations, gallery, settings
    api/
      events/[slug]/register/   public registration endpoint
      admin/                    admin-only CRUD endpoints (all guarded server-side)
      admin/login, admin/logout
  components/
    site/                nav, footer, logo, section heading, confidence badge, reveal,
                         boot-sequence, system-status-card
    members/, events/, projects/, gallery/, admin/
    ui/                  shadcn/ui primitives
  lib/
    store.ts             the in-memory data store (see below)
    fake-auth.ts         cookie-based admin session (see below)
    auth.ts              requireAdmin() — the real authorization boundary
    admin-guard.ts        requireAdminApi() — same boundary for API routes
    data/                typed query functions (members, events, projects, gallery, settings, admin)
    validation/          zod schemas (registration, event, member, project)
    supabase/            Supabase client wrappers — present, currently unused (see below)
  types/database.ts      hand-written types mirroring the Supabase schema
supabase/
  migrations/001_init.sql  full schema + RLS policies + storage bucket policies
scripts/
  run-migrations.ts      applies supabase/migrations/*.sql via SUPABASE_DB_URL
  seed/index.ts          loads seed/*.json into a live Supabase project
seed/                    the verified content — members.json, events.json, projects.json, etc.
docs/
  research.md            Encypherist research trail and source citations
  cidc-analysis.md        CIDC design reverse-engineering + translation to Encypherist
```

## Data mode: in-memory fake data

The app currently runs on `src/lib/store.ts` — a plain in-process object seeded once
from `seed/*.json` at server start, stashed on `globalThis` so every route in the
process shares one instance. Admin CRUD operations mutate this object directly (see
`src/app/api/admin/*/route.ts`).

**What this means:**
- Everything works end-to-end — create an event in the admin, it appears on the public
  site immediately.
- Data **resets whenever the dev/prod server process restarts.**
- If deployed to a serverless platform with multiple instances (e.g. Vercel's default
  behavior), state can become inconsistent across instances. Fine for a demo/local
  run, not for real multi-instance production.
- Admin auth is a minimal cookie-based session (`src/lib/fake-auth.ts`), not Supabase
  Auth — see [Admin access](#admin-access) below.
- Image uploads write to `public/uploads/<bucket>/` on local disk
  (`src/app/api/admin/upload/route.ts`), not Supabase Storage.

This was a deliberate pivot mid-build, requested to get a fully working MVP without
requiring Supabase project setup first. The original plan (see `docs/` git history /
project plan) was live Supabase from the start; that implementation — full schema,
RLS policies, typed client wrappers — is still in the repo and described below.

## Admin access

Demo credentials (change via env vars before sharing this beyond local use):

```
Email:    admin@encypherist.local
Password: encypherist2k26
```

Override with `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env.local`. Sessions are an
httpOnly cookie referencing a token held in an in-process `Map` — good enough for a
single-instance demo, not a real auth system. `src/lib/auth.ts`'s `requireAdmin()` is
the actual authorization boundary (checked independently in every admin page and every
`/api/admin/*` route) — the `/admin/*` proxy (middleware) redirect is a UX convenience
only, not the security boundary.

## Local development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Sign in at `/admin/login` with the credentials above.

Other scripts:

```bash
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run build         # production build
```

## Environment variables

None are required to run the app as-is (fake-data mode needs nothing). `.env.local.example`
documents the variables needed only if you switch to live Supabase (see below).
`ADMIN_EMAIL` / `ADMIN_PASSWORD` are optional overrides for the demo admin login.

## Switching to live Supabase (optional)

The full Supabase implementation is written and sitting in the repo, unused. To wire
it back in:

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. **Copy `.env.local.example` to `.env.local`** and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API)
   - `SUPABASE_SERVICE_ROLE_KEY` (same page — server-only, never expose to the client)
   - `SUPABASE_DB_URL` (Project Settings → Database → Connection string → Session pooler)
3. **Run the migration:** `npm run db:migrate` — applies `supabase/migrations/001_init.sql`
   (tables, indexes, RLS policies, the `event_registration_count` RPC, storage bucket
   policies).
4. **Seed verified content:** `npm run db:seed` — loads `seed/*.json` into the new
   tables.
5. **Create an admin user:** in the Supabase dashboard, add a user under
   Authentication, then insert a row into `admin_profiles` for that user's `id` via
   the SQL editor (there is intentionally no signup/self-elevation endpoint):
   ```sql
   insert into admin_profiles (id, role) values ('<user-uuid>', 'admin');
   ```
6. **Swap the data layer:** `src/lib/data/*.ts` currently import from `@/lib/store`;
   point them back at `src/lib/supabase/server.ts`'s `createClient()` instead (the
   original Supabase-backed versions follow the same function signatures — diff
   against `supabase/migrations/001_init.sql` and the RLS policies described there to
   confirm query shape).
7. **Swap auth:** replace `src/lib/fake-auth.ts` / `src/lib/auth.ts` usage with
   Supabase Auth (`src/lib/supabase/client.ts` + `server.ts` are already written for
   this), and restore `src/middleware.ts` from `src/lib/supabase/middleware.ts`
   (currently `src/proxy.ts` checks a plain cookie instead).
8. **Swap uploads:** point `src/app/api/admin/upload/route.ts` at Supabase Storage
   (bucket policies for `forum-assets`, `member-images`, `event-posters`,
   `event-gallery` are already created by the migration) instead of local disk.

The migration includes a `projects` table (mirroring the Projects feature) with the
same public-read-when-published / admin-write RLS pattern as everything else, and
`scripts/seed/index.ts` seeds it from `seed/projects.json` (currently an empty array —
see `docs/research.md` §11 for why).

RLS design (already in the migration): public reads are scoped to
`published`/`status = 'published'` rows; `event_registrations` has **no public read
policy at all** (registrant PII is admin-only); a `security definer` RPC
(`event_registration_count`) lets the public UI show a capacity counter without ever
exposing individual registrant rows.

## Adding members, events and projects

**Right now (fake-data mode):** either use the admin UI (`/admin/members/new`,
`/admin/events/new`, `/admin/projects/new`), or edit `seed/members.json` /
`seed/events.json` / `seed/projects.json` directly and restart the dev server (the
store re-seeds from these files on every process start).

**After switching to Supabase:** the admin UI is unchanged; `seed/*.json` becomes the
input to `npm run db:seed` for the initial load, and everything after that goes
through the admin UI as normal.

## Deployment (Vercel)

```bash
vercel
```
Fake-data mode deploys with zero configuration. If you've switched to Supabase, set
the environment variables from `.env.local` in the Vercel project settings before
deploying. Note the fake-data mode's known limitation on multi-instance serverless
platforms (see [Data mode](#data-mode-in-memory-fake-data)) — this is a strong reason
to switch to Supabase before any real deployment beyond a demo link.

## Research methodology

Summarized in [`docs/research.md`](docs/research.md); the short version:

- **Verified** — sourced from official documents hosted on jitnagpur.edu.in (the
  member roster PDF, matched byte-for-byte against the one supplied for this build;
  a dated "Forum Activity Plan" PDF for session 2024-25) and the public Instagram bio.
- **Likely** — named in public sources (Instagram highlight titles, a department page
  summary) but without confirmed dates/descriptions. Rendered with a visible "Likely"
  badge and "details coming soon" copy — never presented as settled fact.
- **Not fabricated, ever** — no invented statistics, attendance numbers, sponsors, or
  event outcomes. Where information wasn't publicly available, the UI says so
  explicitly instead of guessing.
No forum logo, brand colors, or real photography could be found through available
research tools (text-based fetching only — no image extraction or Instagram
scraping). The visual identity (dark cipher/terminal theme, original wordmark) was
designed from scratch, grounded in the forum's real tagline and name; all imagery is
an honestly-labeled placeholder with a clear slot for real photos to replace later.