import { requireAdminPage } from "@/lib/admin-guard";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminMobileNav } from "@/components/admin/mobile-nav";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  // The real authorization boundary — see lib/admin-guard.ts. The
  // middleware redirect (src/middleware.ts) is a UX convenience only.
  const admin = await requireAdminPage();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar admin={admin} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileNav admin={admin} />
        <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
