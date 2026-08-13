"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { EASE_PREMIUM, DURATION } from "@/lib/motion";
import { ORG } from "@/lib/constants";
import { cn } from "@/lib/utils";

const MOBILE_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/member", label: "Members" },
  { href: "/projects", label: "Projects" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
] as const;

const panelVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: DURATION.section,
      ease: EASE_PREMIUM,
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.standard, ease: EASE_PREMIUM } },
};

/**
 * Fullscreen premium mobile nav, replacing the generic Sheet drawer below
 * `lg`. Desktop's inline link block in `nav.tsx` is untouched — this only
 * ever mounts below 1024px, since its trigger is `lg:hidden`.
 */
export function MobileNav({
  featuredEvent,
}: {
  featuredEvent: { slug: string; title: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] outline-none lg:hidden"
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={panelVariants}
          >
            <div className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
              <Logo />
              <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X className="size-5" />
              </Button>
            </div>

            <nav className="flex flex-1 flex-col justify-center gap-1 px-6">
              {MOBILE_NAV_LINKS.map((link) => (
                <motion.div key={link.href} variants={itemVariants}>
                  <Link
                    href={link.href}
                    className={cn(
                      "block py-2.5 font-heading text-4xl font-semibold tracking-tight text-foreground transition-colors",
                      pathname === link.href ? "text-primary" : "hover:text-primary"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div variants={itemVariants} className="flex flex-col gap-4 px-6 pb-6">
              {featuredEvent && (
                <Link
                  href={`/events/${featuredEvent.slug}`}
                  className="truncate font-mono text-xs text-primary"
                >
                  → {featuredEvent.title}
                </Link>
              )}
              <Button className="w-full font-mono text-xs" render={<Link href="/#contact" />}>
                Join
              </Button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex shrink-0 items-center justify-between gap-2 border-t border-border px-6 py-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              <span>{ORG.name}</span>
              <span>{ORG.collegeShort} × CSE</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="status-dot" />
                System online
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
