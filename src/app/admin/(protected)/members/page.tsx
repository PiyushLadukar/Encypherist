import Link from "next/link";
import { Plus } from "lucide-react";
import { MembersTable } from "@/components/admin/members-table";
import { getMembers } from "@/lib/data/members";

export default async function AdminMembersPage() {
  const members = await getMembers();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Members</h1>
        <Link
          href="/admin/members/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 font-mono text-xs text-primary-foreground transition-colors hover:bg-primary/80"
        >
          <Plus className="size-4" />
          New member
        </Link>
      </div>
      <MembersTable members={members} />
    </div>
  );
}
