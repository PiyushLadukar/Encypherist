import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { getSiteSettings, getSocialLinks } from "@/lib/data/settings";
import { getPublishedEvents, splitUpcomingPast } from "@/lib/data/events";
import type { SiteSettings } from "@/types/database";

const FALLBACK_SETTINGS: SiteSettings = {
  id: "fallback",
  singleton: true,
  name: "Encypherist",
  tagline: "Because geeks are code blooded.",
  description:
    "Encypherist is the Computer Science & Engineering student forum at Jhulelal Institute of Technology (JIT), Nagpur.",
  contact_email: "admin@jitnagpur.edu.in",
  updated_at: new Date(0).toISOString(),
};

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, socialLinks, events] = await Promise.all([
    getSiteSettings().catch(() => FALLBACK_SETTINGS),
    getSocialLinks().catch(() => []),
    getPublishedEvents().catch(() => []),
  ]);

  const { upcoming } = splitUpcomingPast(events);
  const featuredEvent = upcoming[0]
    ? { slug: upcoming[0].slug, title: upcoming[0].title }
    : null;

  return (
    <>
      <Nav featuredEvent={featuredEvent} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} socialLinks={socialLinks} />
    </>
  );
}
