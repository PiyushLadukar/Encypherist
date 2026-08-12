# Asset Inventory — Encypherist

Every visual asset the site could plausibly use, whether or not it was actually
found. Cross-referenced with [`docs/research.md`](research.md) §8. Research tools in
this environment fetch and summarize **text only** — there is no image extraction,
OCR, or Instagram-scraping capability, and private/authenticated content was never
attempted. That is a tooling limit, not evidence the assets don't exist; JIT and the
forum's Instagram very likely do have real photos that simply couldn't be retrieved
here. Nothing below was fabricated to fill a gap — see the "Status" column.

| Asset | Source | Purpose | Associated with | Confidence |
|---|---|---|---|---|
| Forum logo (official) | — (not found) | Nav/footer wordmark, favicon, hero mark | Org-wide | **UNVERIFIED** — not found |
| Logo variations (light/dark/mono) | — (not found) | Theming | Org-wide | **UNVERIFIED** — not found |
| Favicon (official) | — (not found) | Browser tab icon | Org-wide | **UNVERIFIED** — not found |
| Brand color spec | — (not found) | Design tokens | Org-wide | **UNVERIFIED** — not found |
| Event poster — Healing Horizons | — (not found) | Event card/detail hero | Event, 1 Aug 2024 | **UNVERIFIED** — not found |
| Event poster — Code Craft | — (not found) | Event card/detail hero | Event, 18–21 Sep 2024 | **UNVERIFIED** — not found |
| Event poster — QuizGen AI | — (not found) | Event card/detail hero | Event, 7 Feb 2025 | **UNVERIFIED** — not found |
| Event poster — Hackroot | — (not found) | Event card/detail hero | Event, 22 Mar 2025 | **UNVERIFIED** — not found |
| Event poster — Algorithm Arena | — (not found) | Event card/detail hero | Event, 4 Apr 2025 | **UNVERIFIED** — not found |
| Event poster — Byte Design Pitch | — (not found) | Event card/detail hero | Event, 4 Apr 2025 | **UNVERIFIED** — not found |
| Event posters — remaining 5 verified 2024-25 activities | — (not found) | Event card/detail hero | Events (Meeting the Expectations of Software Engineering, Magic of MBA, Forum Installation, Threads of Future, Sense & Simplicity) | **UNVERIFIED** — not found |
| Event photography (any) | — (not found) | `/gallery`, event detail galleries | All events | **UNVERIFIED** — not found |
| Team/group photograph | — (not found) | About/homepage | Org-wide | **UNVERIFIED** — not found |
| Member photographs (41 current + 25 history) | — (not found) | Member cards, member profiles | All members | **UNVERIFIED** — not found |
| Project screenshots | — (not found) | `/projects` cards, project detail | N/A — no verified project exists (see below) | **UNVERIFIED** — not applicable |
| Social media graphics | — (not found) | N/A | Org-wide | **UNVERIFIED** — not found |
| College institutional imagery | Not sourced (out of scope) | N/A | N/A | Not attempted — this is a forum site, not a college site |
| Ency-Forum-Members.pdf (letterhead) | `jitnagpur.edu.in/wp-content/uploads/2025/10/Ency-Forum-Members.pdf` | Source document only, not a usable image asset | Members (2026-27 + 2024-25 rosters) | **VERIFIED** — official document, matched against user-supplied PDF |
| Ency-Forum-plan-1.pdf (letterhead) | `jitnagpur.edu.in/wp-content/uploads/2025/10/Ency-Forum-plan-1.pdf` | Source document only, not a usable image asset | Events (session 2024-25 activity plan) | **VERIFIED** — official document |

## Projects: no assets because no verified project exists

Section 18 of the build brief asks specifically for project repositories/demos/
screenshots. A targeted search (2026-08-12) for a GitHub presence or shipped project
tied to Encypherist returned nothing — see `docs/research.md` §11. (A GitHub org named
"enCypher Technologies" exists but is an unrelated company, not this forum, and is not
referenced anywhere in this build.) There is therefore no project asset to inventory;
`/projects` ships with zero seeded entries and an honest empty state instead of a
placeholder screenshot standing in for a project that may not exist.

## What the site uses instead

Every "asset" slot above is filled with an **original, honestly-labeled placeholder**,
never a stock photo standing in for the real thing:

- **Logo** — an original wordmark (`src/components/site/logo.tsx`), designed from the
  forum's real cipher pun on its own name, not a guess at what the real logo looks
  like.
- **Event/project imagery** — a deterministic hex-byte pattern generated from the
  title (`PosterPlaceholder` in `src/components/events/event-card.tsx`), so the slot
  visibly reads as a placeholder rather than pretending to be a real photo.
- **Member photos** — initials-based avatar tiles, standard practice for an
  unavailable headshot.
- **Favicon** — generated from the same original wordmark, not sourced.

All of the above are swap-in-ready: dropping a real file at the same prop/field
(`photo_url`, `poster_url`, `image_url`) replaces the placeholder with zero code
changes, whether the content is edited via the admin CMS or `seed/*.json` directly.

## If real assets surface later

Ask the forum directly for: the logo (any format), a handful of event posters, and
photos from any past event. Those alone would upgrade the highest-visibility
placeholder slots (hero, event cards, gallery) with minimal effort — everything is
already wired to accept them.
