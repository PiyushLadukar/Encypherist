"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Lock, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Nav({
  featuredEvent,
}: {
  featuredEvent: { slug: string; title: string } | null;
}) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors duration-300",
        scrolled
          ? "border-border bg-background/90 backdrop-blur-md"
          : "border-transparent bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="focus-visible:ring-ring rounded-sm outline-none focus-visible:ring-2">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground",
                pathname === link.href && "text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <span className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70 xl:inline-flex">
            <span className="status-dot" />
            System // Online
          </span>
          {featuredEvent && (
            <Link
              href={`/events/${featuredEvent.slug}`}
              className="hidden max-w-[180px] truncate font-mono text-xs text-muted-foreground transition-colors hover:text-primary lg:inline-block"
            >
              → {featuredEvent.title}
            </Link>
          )}
          <Button
            size="sm"
            className="font-mono text-xs"
            nativeButton={false}
            render={<Link href="/#contact" />}
          >
            Join
            <ArrowUpRight className="size-3.5" />
          </Button>
          <Link
            href="/admin/login"
            aria-label="Admin login"
            className="text-muted-foreground/50 transition-colors hover:text-muted-foreground"
          >
            <Lock className="size-4" />
          </Link>
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-sm border-l border-border bg-background">
            <SheetHeader>
              <SheetTitle>
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-4">
              {NAV_LINKS.map((link) => (
                <SheetClose
                  key={link.href}
                  nativeButton={false}
                  render={
                    <Link
                      href={link.href}
                      className="rounded-md px-3 py-3 font-heading text-lg text-foreground transition-colors hover:text-primary"
                    />
                  }
                >
                  {link.label}
                </SheetClose>
              ))}
              {featuredEvent && (
                <SheetClose
                  key="featured-event"
                  nativeButton={false}
                  render={<Link href={`/events/${featuredEvent.slug}`} className="rounded-md px-3 py-3 font-mono text-xs text-primary" />}
                >
                  → {featuredEvent.title}
                </SheetClose>
              )}
              <SheetClose
                nativeButton={false}
                render={
                  <Button
                    className="mt-4 w-full font-mono text-xs"
                    nativeButton={false}
                    render={<Link href="/#contact" />}
                  />
                }
              >
                Join
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    href="/admin/login"
                    className="mt-8 flex items-center gap-2 rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground/60"
                  />
                }
              >
                <Lock className="size-3.5" />
                Admin login
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
