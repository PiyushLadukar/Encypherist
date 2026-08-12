import { MemberForm } from "@/components/admin/member-form";

export default function NewMemberPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">New member</h1>
      <div className="mt-8">
        <MemberForm />
      </div>
    </div>
  );
}
