/**
 * Hand-written types mirroring supabase/migrations/001_init.sql, shaped to
 * satisfy @supabase/supabase-js's GenericSchema constraints (Row/Insert/
 * Update/Relationships per table, Views/Functions on the schema). Keep in
 * sync with the schema; there is no live project yet to run
 * `supabase gen types` against (see README "Supabase setup").
 *
 * Row shapes use `type`, not `interface` — TypeScript only treats plain
 * type-literal aliases as satisfying the `Record<string, unknown>`
 * constraint that @supabase/supabase-js's GenericTable requires; interfaces
 * fail that check even with an identical shape.
 */

export type Confidence = "verified" | "likely" | "unverified";
export type TeamGroup = "final" | "third" | "second" | "history";
export type EventType =
  | "hackathon"
  | "workshop"
  | "talk"
  | "competition"
  | "seminar"
  | "donation_drive"
  | "other";
export type EventStatus = "draft" | "published" | "archived";
export type ProjectStatus = "active" | "in_development" | "deployed" | "archived";

export type MemberSocials = {
  instagram?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
};

export type ScheduleItem = {
  time?: string;
  title: string;
  description?: string;
};

export type AdminProfileRow = {
  id: string;
  role: "admin" | "super_admin";
  created_at: string;
};

export type MemberRow = {
  id: string;
  slug: string;
  name: string;
  designation: string;
  team_group: TeamGroup;
  year_session: string;
  bio: string | null;
  skills: string[];
  photo_url: string | null;
  socials: MemberSocials;
  is_core: boolean;
  sort_order: number;
  published: boolean;
  confidence: Confidence;
  created_at: string;
  updated_at: string;
};

export type EventRow = {
  id: string;
  slug: string;
  title: string;
  type: EventType;
  status: EventStatus;
  summary: string | null;
  description: string | null;
  start_at: string | null;
  end_at: string | null;
  location: string | null;
  poster_url: string | null;
  registration_enabled: boolean;
  registration_deadline: string | null;
  capacity: number | null;
  eligibility: string | null;
  rules: string | null;
  schedule: ScheduleItem[];
  confidence: Confidence;
  created_at: string;
  updated_at: string;
};

export type EventRegistrationRow = {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  phone: string;
  college: string;
  branch: string | null;
  year: string | null;
  extra: Record<string, unknown>;
  created_at: string;
};

export type EventGalleryRow = {
  id: string;
  event_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

export type EventFaqRow = {
  id: string;
  event_id: string;
  question: string;
  answer: string;
  sort_order: number;
};

export type EventSpeakerRow = {
  id: string;
  event_id: string;
  name: string;
  title: string | null;
  photo_url: string | null;
  sort_order: number;
};

export type EventOrganizerRow = {
  id: string;
  event_id: string;
  name: string;
  role: string | null;
  sort_order: number;
};

export type SiteSettingsRow = {
  id: string;
  singleton: true;
  name: string;
  tagline: string | null;
  description: string | null;
  contact_email: string | null;
  updated_at: string;
};

export type SocialLinkRow = {
  id: string;
  platform: string;
  url: string;
  visible: boolean;
  sort_order: number;
};

export type ProjectRow = {
  id: string;
  slug: string;
  name: string;
  status: ProjectStatus;
  summary: string | null;
  problem: string | null;
  solution: string | null;
  tech_stack: string[];
  contributors: string[];
  link_url: string | null;
  repo_url: string | null;
  image_url: string | null;
  published: boolean;
  sort_order: number;
  confidence: Confidence;
  created_at: string;
  updated_at: string;
};

/** Builds a GenericTable-shaped entry: Row/Insert/Update/Relationships. */
type Table<Row extends Record<string, unknown>, RequiredInsertKeys extends keyof Row> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, RequiredInsertKeys>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      admin_profiles: Table<AdminProfileRow, "id">;
      members: Table<MemberRow, "slug" | "name" | "designation" | "team_group" | "year_session">;
      events: Table<EventRow, "slug" | "title">;
      event_registrations: Table<
        EventRegistrationRow,
        "event_id" | "full_name" | "email" | "phone" | "college"
      >;
      event_gallery: Table<EventGalleryRow, "event_id" | "image_url">;
      event_faqs: Table<EventFaqRow, "event_id" | "question" | "answer">;
      event_speakers: Table<EventSpeakerRow, "event_id" | "name">;
      event_organizers: Table<EventOrganizerRow, "event_id" | "name">;
      site_settings: Table<SiteSettingsRow, "name">;
      social_links: Table<SocialLinkRow, "platform" | "url">;
      projects: Table<ProjectRow, "slug" | "name">;
    };
    Views: Record<string, never>;
    Functions: {
      event_registration_count: {
        Args: { p_event_id: string };
        Returns: number;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
};

export type Member = MemberRow;
export type Event = EventRow;
export type EventRegistration = EventRegistrationRow;
export type EventGalleryItem = EventGalleryRow;
export type EventFaq = EventFaqRow;
export type EventSpeaker = EventSpeakerRow;
export type EventOrganizer = EventOrganizerRow;
export type SiteSettings = SiteSettingsRow;
export type SocialLink = SocialLinkRow;
export type Project = ProjectRow;

export type EventWithDetails = Event & {
  gallery: EventGalleryItem[];
  faqs: EventFaq[];
  speakers: EventSpeaker[];
  organizers: EventOrganizer[];
};
