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

**Two data modes, by design.** Members/Projects/Gallery/Settings run on **in-memory
fake data** — a deliberate scope decision (see
[Data mode](#data-mode-membersprojectsgallerysettings-run-on-in-memory-fake-data)
below); content resets when the server restarts, and there's currently no admin UI
for this content (edit `seed/*.json` directly). The **admin dashboard and event
system** (`/admin` — events, eligibility, dynamic registration forms, team/individual
registration, participant management, CSV/Excel export) is a real, separate subsystem
backed by **MongoDB** and **Auth.js** sessions — see
[Admin & MongoDB setup](#admin--mongodb-setup) below. A complete but unrelated
Supabase backend (schema, RLS policies, migrations) also sits in the repo, written but
unwired — see
[Switching Members/Projects/Gallery to Supabase](#switching-membersprojectsgallery-to-supabase-optional).

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
- **Admin event platform** (`/admin`) — real authentication (Auth.js + MongoDB,
  bcrypt-hashed passwords, RBAC with `admin`/`super_admin` roles), a dashboard with
  event/registration stats, a sectioned event editor (basic details, registration
  settings, eligibility, a dynamic registration-form builder, publish state), poster
  upload, per-event participant/team management with search/filter/status changes,
  and CSV/Excel export. See [Admin & MongoDB setup](#admin--mongodb-setup) below —
  this is a separate subsystem from the rest of the site, backed by MongoDB rather
  than the in-memory store.
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
- **Data (Members/Projects/Gallery/Settings):** an in-memory store seeded from `seed/*.json`
- **Data (Admin/Events/Registrations):** MongoDB, via the official `mongodb` driver
- **Admin auth:** Auth.js (NextAuth v5), Credentials provider, JWT sessions, bcrypt password hashing
- **File storage (admin uploads):** local disk (`public/uploads/`)
- **Data (written, not wired):** Supabase (Postgres, Auth, Storage) — schema in
  `supabase/migrations/`; this predates and is unrelated to the MongoDB-backed admin
  system, see [Switching Members/Projects/Gallery to Supabase](#switching-membersprojectsgallery-to-supabase-optional)
- **Deployment target:** Vercel (or any Node host)

## Architecture

```
src/
  app/
    (public)/            homepage, members, events, gallery — public route group
    admin/
      login/              standalone, unauthenticated (Auth.js Credentials sign-in)
      (protected)/        dashboard, events (list/new/edit/archived), participants, admins
    api/
      auth/[...nextauth]/       Auth.js route handler
      events/[slug]/register/   public registration endpoint (dynamic per event config)
      events/[slug]/upload/     public upload endpoint for "file" registration fields
      admin/events/[id]/export/ CSV/Excel export (admin-only)
  components/
    site/                nav, footer, logo, section heading, confidence badge, reveal,
                         boot-sequence, system-status-card
    members/, events/, projects/, gallery/    public-site components (in-memory store)
    admin/               admin dashboard UI: event-form/ (basic/registration/eligibility/
                         form-builder/publish sections), participants/, admins/, sidebar
    ui/                  shadcn/ui primitives
  lib/
    store.ts             the in-memory data store for Members/Projects/Gallery/Settings
    mongodb.ts           MongoDB client singleton (admin/events/registrations)
    admin-guard.ts       requireAdminPage()/requireAdminApi() — the real authorization
                         boundary, re-checks isActive/role against MongoDB every call
    audit.ts             admin action audit log writer
    uploads.ts           poster/file upload validation (extension+MIME+magic bytes) + disk write
    export.ts            CSV/Excel row-building + formula-injection-safe escaping
    event-status.ts       derives Draft/Upcoming/Registration Open|Closed/Ongoing/
                         Completed/Archived from an event's dates + admin-set status
    data/                typed query functions — events.ts (public, Mongo), admin-events.ts,
                         registrations.ts, admins.ts (Mongo); members/projects/gallery/
                         settings.ts (in-memory store, untouched)
    actions/             "use server" Server Actions for events/registrations/admins,
                         each starting with requireAdminApi()
    validation/          zod schemas — event.ts, registration.ts (builds a per-event
                         dynamic schema from its live form config), form-field.ts, admin.ts
    supabase/            Supabase client wrappers — present, currently unused (see below)
  auth.ts                Auth.js (NextAuth) config — Credentials provider, JWT sessions
  proxy.ts               UX-only redirect for logged-out /admin/* visits (Next.js 16's
                         renamed `middleware` convention) — NOT the security boundary
  types/
    database.ts          hand-written types mirroring the (unused) Supabase schema
    models.ts            hand-written types for the MongoDB-backed admin/event system
supabase/
  migrations/001_init.sql  full schema + RLS policies + storage bucket policies (predates
                            and is unrelated to the MongoDB admin system — see below)
scripts/
  run-migrations.ts      applies supabase/migrations/*.sql via SUPABASE_DB_URL
  seed/index.ts          loads seed/*.json into a live Supabase project
  seed-admin.ts          creates/promotes an admin account in MongoDB (the only way to
                         provision one — no public admin-registration endpoint exists)
  seed-mongo-events.ts   one-time migration of seed/events.json into MongoDB
seed/                    the verified content — members.json, events.json, projects.json, etc.
docs/
  research.md            Encypherist research trail and source citations
  cidc-analysis.md        CIDC design reverse-engineering + translation to Encypherist
```

## Data mode: Members/Projects/Gallery/Settings run on in-memory fake data

`src/lib/store.ts` is a plain in-process object seeded once from `seed/*.json` at
server start, stashed on `globalThis` so every route in the process shares one
instance. **This part of the app is unrelated to the admin/event system below** and
was not touched by it.

**What this means:**
- Everything for Members/Projects/Gallery/Settings works end-to-end for local/demo use.
- Data **resets whenever the dev/prod server process restarts.**
- If deployed to a serverless platform with multiple instances, state can become
  inconsistent across instances. Fine for a demo/local run, not real multi-instance
  production.
- There is currently no admin UI for editing Members/Projects/Gallery content — a
  previous admin CMS for these existed on this repo's `main` branch but was removed
  from `development` in an earlier commit. Edit `seed/*.json` directly and restart the
  dev server, or see [Switching Members/Projects/Gallery to Supabase](#switching-membersprojectsgallery-to-supabase-optional).

## Admin & MongoDB setup

The admin dashboard and event-management system (`/admin`) is a separate subsystem
from the section above — it's backed by **MongoDB** and real **Auth.js** sessions, not
the in-memory store or a fake login. It won't function until you provide a MongoDB
connection string.

1. **Create a MongoDB database** — a free [MongoDB Atlas](https://www.mongodb.com/atlas)
   cluster works, or run MongoDB locally.
2. **Copy `.env.local.example` to `.env.local`** and fill in:
   - `MONGODB_URI` — your connection string
   - `MONGODB_DB_NAME` — defaults to `encypherist` if unset
   - `AUTH_SECRET` — generate with `npx auth secret` or `openssl rand -base64 32`
3. **Create the first admin account** — there is deliberately no public
   admin-registration page, so this is the only way in:
   ```bash
   npm run db:seed-admin -- --name="Jane Doe" --email=jane@example.com --password=ChangeMe123 --role=super_admin
   ```
   Indexes (`admins.email` unique) are created automatically by this script.
4. **(Optional) Migrate existing seed events into MongoDB**, so anything already in
   `seed/events.json` isn't lost:
   ```bash
   npm run db:seed-mongo-events
   ```
   Safe to re-run (upserts by slug). Old events had no eligibility/team/form config,
   so those come out at generic defaults (open to everyone, individual registration,
   no custom fields) — edit each event afterwards to configure them properly.
5. **Sign in** at `/admin/login` with the account from step 3.

**Authorization model** (spec-driven, see `src/lib/admin-guard.ts`): every admin page
and every Server Action/API route independently calls `requireAdminPage()` /
`requireAdminApi()`, which re-reads `isActive` and `role` from MongoDB on every call —
never just trusting the JWT session claim. This means deactivating an admin (from
Admin Management, super-admin only) takes effect immediately, not at next token
refresh. `src/proxy.ts`'s redirect for logged-out `/admin/*` visits is a UX
convenience only, exactly like the old fake-auth system's stated principle — it is
never the actual security boundary.

**Roles:** `admin` and `super_admin`. Only super admins can reach `/admin/admins` to
create new admins or activate/deactivate existing ones (a super admin can't deactivate
themselves, and the last active super admin can't be deactivated, to avoid locking
everyone out).

**File uploads** (event posters, and registrant-submitted "file" fields) write to
`public/uploads/` on local disk after validating file size, extension, declared MIME
type, and actual file content (magic-byte sniffing via `file-type`) — filenames are
server-generated UUIDs, never the uploaded filename. This has the same multi-instance/
serverless caveat as the in-memory store above; migrating to Cloudinary/S3 is a
drop-in replacement for `src/lib/uploads.ts`'s two functions if you outgrow local disk.

## Local development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. The public site (Home/Members/Projects/Gallery/About)
works immediately with zero configuration. `/admin` needs the MongoDB setup above.

Other scripts:

```bash
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run build         # production build
```

## Environment variables

None are required to run the **public site** (Members/Projects/Gallery/Settings) —
fake-data mode needs nothing. `MONGODB_URI`, `MONGODB_DB_NAME` and `AUTH_SECRET` are
required for the **admin/event system** — see [Admin & MongoDB setup](#admin--mongodb-setup).
`.env.local.example` documents all of these, plus the Supabase variables needed only
if you switch Members/Projects/Gallery/Settings to Supabase (see below).

## Switching Members/Projects/Gallery to Supabase (optional)

A full Supabase implementation (Postgres, RLS, storage buckets) is written and sitting
in the repo, unused — but note it predates the MongoDB-backed admin/event system
above and its `events` / `event_registrations` / `admin_profiles` tables are now
**superseded, not to be revived**: events, registrations and admin accounts live in
MongoDB going forward. This section only applies to Members, Projects, Gallery and
Settings, which still run on `src/lib/store.ts` today.

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. **Copy `.env.local.example` to `.env.local`** and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API)
   - `SUPABASE_SERVICE_ROLE_KEY` (same page — server-only, never expose to the client)
   - `SUPABASE_DB_URL` (Project Settings → Database → Connection string → Session pooler)
3. **Run the migration:** `npm run db:migrate` — applies `supabase/migrations/001_init.sql`.
4. **Seed verified content:** `npm run db:seed` — loads `seed/*.json` into the new tables.
5. **Swap the data layer:** `src/lib/data/members.ts`, `projects.ts`, `gallery.ts`,
   `settings.ts` currently import from `@/lib/store`; point them at
   `src/lib/supabase/server.ts`'s `createClient()` instead. Leave `src/lib/data/events.ts`,
   `admin-events.ts`, `registrations.ts` and `admins.ts` alone — those stay on MongoDB.
6. There is intentionally no admin UI yet for Members/Projects/Gallery (see
   [Data mode](#data-mode-membersprojectsgallerysettings-run-on-in-memory-fake-data)
   above) — editing still means either `seed/*.json` + `db:seed`, or the Supabase
   dashboard directly, until that admin surface is rebuilt.

## Adding members, events and projects

- **Members/Projects/Gallery:** edit `seed/members.json` / `seed/projects.json` /
  `seed/gallery.ts` directly and restart the dev server (or migrate to Supabase, above).
- **Events:** use the admin dashboard at `/admin/events/new` (see
  [Admin & MongoDB setup](#admin--mongodb-setup)) — this is the only supported way to
  create/edit events now that they're MongoDB-backed and configuration-driven
  (eligibility, team size, dynamic form fields all live on the event document, not in
  seed files). `npm run db:seed-mongo-events` is a one-time import for pre-existing
  `seed/events.json` content only.

## Deployment (Vercel)

```bash
vercel
```
The public site (Members/Projects/Gallery/Settings) deploys with zero configuration.
For the admin/event system, set `MONGODB_URI`, `MONGODB_DB_NAME` and `AUTH_SECRET` in
the Vercel project settings before deploying, and run `npm run db:seed-admin` against
that MongoDB instance to provision the first admin. Note local-disk uploads
(`public/uploads/`) don't persist across deploys/instances on serverless platforms —
migrate `src/lib/uploads.ts` to Cloudinary/S3 before relying on posters surviving a
redeploy in production.

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