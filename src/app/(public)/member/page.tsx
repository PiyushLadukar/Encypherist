import type { Metadata } from "next";
import { SectionHeading } from "@/components/site/section-heading";
import { MemberDirectory } from "@/components/members/member-directory";
import { Reveal } from "@/components/site/reveal";
import { getPublishedMembers } from "@/lib/data/members";

export const metadata: Metadata = {
  title: "Members — Encypherist",
  description:
    "Meet the people behind Encypherist, the CSE student forum at Jhulelal Institute of Technology, Nagpur.",
};

export const revalidate = 0;

export default async function MembersPage() {
  const members = await getPublishedMembers().catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="The roster"
          title="Meet the people behind the community."
          description="Every tenure, a new council keeps Encypherist running — technical, creative, strategic and everything in between."
        />
      </Reveal>

      {members.length === 0 ? (
        <p className="mt-16 text-sm text-muted-foreground">
          Member data isn&apos;t connected yet — once the database is live, the full roster
          will appear here.
        </p>
      ) : (
        <div className="mt-4">
          <MemberDirectory members={members} />
        </div>
      )}
    </div>
  );
}
