"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut, ExternalLink } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";
import { ADMIN_LINKS, useSignOut } from "@/components/admin/sidebar";
import { cn } from "@/lib/utils";

export function AdminMobileNav() {
  const pathname = usePathname();
  const signOut = useSignOut();

  return (
    <div className="flex items-center justify-between border-b border-border bg-card/40 px-4 py-3 md:hidden">
      <Logo />
      <Sheet>
        <SheetTrigger
          render={<Button variant="ghost" size="icon" aria-label="Open admin menu" />}
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="right" className="w-full max-w-xs border-l border-border bg-background">
          <SheetHeader>
            <SheetTitle>Admin menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-4">
            {ADMIN_LINKS.map((link) => {
              const active =
                link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <SheetClose
                  key={link.href}
                  nativeButton={false}
                  render={
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm",
                        active ? "bg-primary/10 text-primary" : "text-foreground"
                      )}
                    />
                  }
                >
                  <Icon className="size-4" />
                  {link.label}
                </SheetClose>
              );
            })}
            <SheetClose
              nativeButton={false}
              render={
                <Link
                  href="/"
                  target="_blank"
                  className="mt-4 flex items-center gap-2.5 rounded-md px-3 py-2.5 font-mono text-xs text-muted-foreground"
                />
              }
            >
              <ExternalLink className="size-3.5" />
              View site
            </SheetClose>
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-muted-foreground"
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
