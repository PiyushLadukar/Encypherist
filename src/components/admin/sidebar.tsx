"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarDays,
  Archive,
  ShieldCheck,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Admin } from "@/types/models";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/events", label: "Events", icon: CalendarDays, exact: false },
  { href: "/admin/events/archived", label: "Archived Events", icon: Archive, exact: false },
] as const;

export function AdminSidebar({ admin }: { admin: Admin }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card/40 lg:flex">
      <div className="border-b border-border px-5 py-5">
        <p className="font-heading text-lg font-semibold text-foreground">Admin</p>
        <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{admin.email}</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <Link
          href="/admin/events/new"
          className="mb-3 flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          <PlusCircle className="size-4" />
          Create Event
        </Link>

        {NAV_ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}

        {admin.role === "super_admin" && (
          <Link
            href="/admin/admins"
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname.startsWith("/admin/admins")
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <ShieldCheck className="size-4" />
            Admin Management
          </Link>
        )}
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-destructive"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
