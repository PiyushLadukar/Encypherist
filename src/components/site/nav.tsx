"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, Home, Images, Info, Users } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { MobileNav } from "@/components/site/mobile-nav";
import { MenuBar } from "@/components/ui/animated-menu-bar";
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
        "sticky top-0 z-50 w-full border-b transition-all duration-300 max-lg:pt-[env(safe-area-inset-top)]",
        scrolled
          ? "border-black/20 bg-white/85 backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]"
          : "border-black/15 bg-white/60 backdrop-blur-md"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="focus-visible:ring-ring rounded-sm outline-none focus-visible:ring-2">
          <Logo />
        </Link>

        <div className="hidden items-center lg:flex">
          <MenuBar
            active={pathname}
            items={[
              {
                key: "home",
                label: "Home",
                href: "/",
                icon: <Home className="h-4 w-4" />,
              },
              {
                key: "member",
                label: "Members",
                href: "/member",
                icon: <Users className="h-4 w-4" />,
              },
              {
                key: "events",
                label: "Events",
                href: "/events",
                icon: <Calendar className="h-4 w-4" />,
              },
              {
                key: "gallery",
                label: "Gallery",
                href: "/gallery",
                icon: <Images className="h-4 w-4" />,
              },
              {
                key: "about",
                label: "About",
                href: "/about",
                icon: <Info className="h-4 w-4" />,
              },
            ]}
          />
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {featuredEvent && (
            <Link
              href={`/events/${featuredEvent.slug}`}
              className="hidden max-w-[180px] truncate rounded-full border border-border/80 bg-white/60 px-3 py-1 font-mono text-xs text-muted-foreground backdrop-blur-md transition-colors hover:border-emerald-400/60 hover:text-primary lg:inline-block"
            >
              → {featuredEvent.title}
            </Link>
          )}
        </div>

        <MobileNav featuredEvent={featuredEvent} />
      </nav>
    </header>
  );
}


