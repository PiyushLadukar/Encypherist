import { requireAdminPage } from "@/lib/admin-guard";
import { listAdmins } from "@/lib/data/admins";
import { AdminsTable } from "@/components/admin/admins/admins-table";
import { AdminFormDialog } from "@/components/admin/admins/admin-form-dialog";

export const dynamic = "force-dynamic";

export default async function AdminManagementPage() {
  // Page-level RBAC: only super admins may reach this screen or its actions
  // (createAdminAccount/setAdminActive also independently call
  // requireAdminApi("super_admin") — never trust the page guard alone).
  const currentAdmin = await requireAdminPage("super_admin");
  const admins = await listAdmins();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Admin Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Only Super Admins can manage other admin accounts.</p>
        </div>
        <AdminFormDialog />
      </div>

      <AdminsTable admins={admins} currentAdminId={currentAdmin.id} />
    </div>
  );
}
