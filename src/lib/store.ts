import "server-only";
import { randomUUID } from "node:crypto";
import membersSeed from "../../seed/members.json";
import eventsSeed from "../../seed/events.json";
import projectsSeed from "../../seed/projects.json";
import siteSettingsSeed from "../../seed/site-settings.json";
import socialLinksSeed from "../../seed/social-links.json";
import type {
  Member,
  Event,
  EventGalleryItem,
  EventFaq,
  EventSpeaker,
  EventOrganizer,
  EventRegistration,
  SiteSettings,
  SocialLink,
  Project,
} from "@/types/database";

/**
 * In-memory data store, seeded from seed/*.json (the same verified content
 * that would otherwise seed Supabase — see scripts/seed/index.ts and
 * docs/research.md). This is a deliberate, temporary swap: the site runs
 * fully standalone with zero external services for now. All the Supabase
 * schema/RLS/client code is still in the repo (supabase/, src/lib/supabase/)
 * and untouched — see README "Switching to live Supabase" to wire it back
 * in later. Data here resets whenever the server process restarts, and
 * (being a plain in-process object) will NOT stay consistent across
 * multiple serverless instances if deployed that way — fine for local/demo
 * use, not for multi-instance production.
 */

const now = new Date().toISOString();

type OptionalMemberKey = "bio" | "photo_url" | "socials" | "skills" | "published";
type SeedMember = Omit<Member, "id" | "created_at" | "updated_at" | OptionalMemberKey> &
  Partial<Pick<Member, OptionalMemberKey>>;

type OptionalEventKey =
  | "summary"
  | "description"
  | "location"
  | "poster_url"
  | "registration_deadline"
  | "capacity"
  | "eligibility"
  | "rules"
  | "schedule";
type SeedEvent = Omit<Event, "id" | "created_at" | "updated_at" | OptionalEventKey> &
  Partial<Pick<Event, OptionalEventKey>>;

function initMembers(): Member[] {
  return (membersSeed as SeedMember[]).map((m) => ({
    ...m,
    id: randomUUID(),
    bio: m.bio ?? null,
    photo_url: m.photo_url ?? null,
    socials: m.socials ?? {},
    skills: m.skills ?? [],
    published: m.published ?? true,
    created_at: now,
    updated_at: now,
  }));
}

function initEvents(): Event[] {
  return (eventsSeed as SeedEvent[]).map((e) => ({
    ...e,
    id: randomUUID(),
    summary: e.summary ?? null,
    description: e.description ?? null,
    location: e.location ?? null,
    poster_url: e.poster_url ?? null,
    registration_deadline: e.registration_deadline ?? null,
    capacity: e.capacity ?? null,
    eligibility: e.eligibility ?? null,
    rules: e.rules ?? null,
    schedule: e.schedule ?? [],
    created_at: now,
    updated_at: now,
  }));
}

type OptionalProjectKey =
  | "summary"
  | "problem"
  | "solution"
  | "tech_stack"
  | "contributors"
  | "link_url"
  | "repo_url"
  | "image_url"
  | "published";
type SeedProject = Omit<Project, "id" | "created_at" | "updated_at" | OptionalProjectKey> &
  Partial<Pick<Project, OptionalProjectKey>>;

function initProjects(): Project[] {
  return (projectsSeed as SeedProject[]).map((p) => ({
    ...p,
    id: randomUUID(),
    summary: p.summary ?? null,
    problem: p.problem ?? null,
    solution: p.solution ?? null,
    tech_stack: p.tech_stack ?? [],
    contributors: p.contributors ?? [],
    link_url: p.link_url ?? null,
    repo_url: p.repo_url ?? null,
    image_url: p.image_url ?? null,
    published: p.published ?? true,
    created_at: now,
    updated_at: now,
  }));
}

function initSettings(): SiteSettings {
  const s = siteSettingsSeed as Omit<SiteSettings, "id" | "singleton" | "updated_at">;
  return { ...s, id: randomUUID(), singleton: true, updated_at: now };
}

function initSocialLinks(): SocialLink[] {
  return (socialLinksSeed as Omit<SocialLink, "id">[]).map((s) => ({ id: randomUUID(), ...s }));
}

interface Store {
  members: Member[];
  events: Event[];
  projects: Project[];
  eventGallery: EventGalleryItem[];
  eventFaqs: EventFaq[];
  eventSpeakers: EventSpeaker[];
  eventOrganizers: EventOrganizer[];
  eventRegistrations: EventRegistration[];
  siteSettings: SiteSettings;
  socialLinks: SocialLink[];
}

const globalForStore = globalThis as unknown as { __encyStore?: Store };

function createStore(): Store {
  return {
    members: initMembers(),
    events: initEvents(),
    projects: initProjects(),
    eventGallery: [],
    eventFaqs: [],
    eventSpeakers: [],
    eventOrganizers: [],
    eventRegistrations: [],
    siteSettings: initSettings(),
    socialLinks: initSocialLinks(),
  };
}

/** Stashed on globalThis so every route/module in the same process shares one instance. */
export const store: Store = globalForStore.__encyStore ?? (globalForStore.__encyStore = createStore());
