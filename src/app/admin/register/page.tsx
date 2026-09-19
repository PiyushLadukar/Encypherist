import type { Metadata } from "next";
import { AdminRegisterForm } from "@/components/admin/register-form";

export const metadata: Metadata = { title: "Create account — Encypherist" };

/**
 * Server component purely so this route segment can opt out of static
 * prerendering. A fully static page is deployed without a server function, so
 * the POST that a Server Action makes to its own route has nothing to hit and
 * fails with UnrecognizedActionError. Every other Server Action in the app sits
 * under /admin/(protected), which is already force-dynamic.
 */
export const dynamic = "force-dynamic";

export default function AdminRegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <AdminRegisterForm />
      </div>
    </div>
  );
}
