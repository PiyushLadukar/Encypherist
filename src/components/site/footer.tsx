import Link from "next/link";
import { AtSign, ArrowUpRight, Share2, Mail } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { NAV_LINKS, ORG } from "@/lib/constants";
import type { SiteSettings, SocialLink } from "@/types/database";

const SOCIAL_ICONS: Record<string, typeof AtSign> = {
  instagram: AtSign,
  facebook: Share2,
  linkedin: Share2,
};

export function Footer({
  settings,
  socialLinks,
}: {
  settings: SiteSettings;
  socialLinks: SocialLink[];
}) {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {settings.description}
            </p>
            <p className="mt-4 font-mono text-xs text-muted-foreground/70">
              {ORG.department} · {ORG.college} · {ORG.city}, {ORG.state}
            </p>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Navigate
            </h3>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/80 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Connect
            </h3>
            <ul className="mt-4 flex gap-3">
              {socialLinks.map((link) => {
                const Icon = SOCIAL_ICONS[link.platform] ?? ArrowUpRight;
                return (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-foreground/80 transition-colors hover:text-primary"
                      title={link.platform}
                    >
                      <Icon className="size-5" />
                    </a>
                  </li>
                );
              })}
              <li>
                <a
                  href="mailto:contact@example.com"
                  className="inline-flex items-center text-foreground/80 transition-colors hover:text-primary"
                  title="Email"
                >
                  <Mail className="size-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 font-mono text-[11px] text-muted-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Encypherist. All rights reserved.</p>
          <p>Built by the forum, for the forum.</p>
        </div>
      </div>
    </footer>
  );
}
