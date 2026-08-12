"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Box,
  ClipboardList,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { cn } from "@/lib/utils";

export const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/projects", label: "Projects", icon: Box },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/registrations", label: "Registrations", icon: ClipboardList },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function useSignOut() {
  const router = useRouter();
  return async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };
}

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const signOut = useSignOut();

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/40 md:flex">
      <div className="border-b border-border p-5">
        <Link href="/admin">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {ADMIN_LINKS.map((link) => {
          const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-border p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="size-3.5" />
          View site
        </Link>
        <p className="truncate px-3 py-1 font-mono text-[11px] text-muted-foreground/60">{email}</p>
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
