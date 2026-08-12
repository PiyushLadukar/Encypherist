import { notFound } from "next/navigation";
import { MemberForm } from "@/components/admin/member-form";
import { getMemberById } from "@/lib/data/members";

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getMemberById(id);

  if (!member) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Edit member</h1>
      <div className="mt-8">
        <MemberForm member={member} />
      </div>
    </div>
  );
}
