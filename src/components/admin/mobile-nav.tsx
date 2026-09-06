"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, LogOut, PlusCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Admin } from "@/types/models";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/events/archived", label: "Archived Events" },
] as const;

export function AdminMobileNav({ admin }: { admin: Admin }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between border-b border-border bg-card/40 px-4 py-3 lg:hidden">
      <p className="font-heading text-base font-semibold text-foreground">Admin</p>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" />}>
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left">
          <SheetTitle className="px-4 pt-4">Admin</SheetTitle>
          <nav className="flex flex-col gap-1 px-3 py-2">
            <Link
              href="/admin/events/new"
              onClick={() => setOpen(false)}
              className="mb-2 flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            >
              <PlusCircle className="size-4" />
              Create Event
            </Link>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  pathname === item.href ? "bg-muted font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
            {admin.role === "super_admin" && (
              <Link
                href="/admin/admins"
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  pathname.startsWith("/admin/admins") ? "bg-muted font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                Admin Management
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
