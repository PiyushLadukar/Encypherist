import Link from "next/link";
import { Mail, Phone, MapPin, ArrowUpRight, Globe } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { FacebookIcon, InstagramIcon, LinkedinIcon, GithubIcon } from "@/components/site/social-icons";
import { NAV_LINKS, ORG } from "@/lib/constants";
import { TextHoverEffect, FooterBackgroundGradient } from "@/components/ui/hover-footer";
import type { SiteSettings, SocialLink } from "@/types/database";

const SOCIAL_ICONS: Record<string, typeof FacebookIcon> = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  linkedin: LinkedinIcon,
  github: GithubIcon,
};

export function Footer({
  settings,
  socialLinks,
}: {
  settings: SiteSettings;
  socialLinks: SocialLink[];
}) {
  const resourceLinks = [
    { label: "Meet the Team", href: "/member", pulse: true },
    { label: "Upcoming & Past Events", href: "/events" },
    { label: "Student Projects", href: "/projects" },
    { label: "Gallery Archive", href: "/gallery" },
    { label: "About Forum", href: "/about" },
  ];

  return (
    <footer className="relative mx-3 my-6 sm:mx-6 sm:my-10 lg:mx-8 overflow-hidden rounded-3xl border border-white/80 bg-white/75 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-foreground">
      <div className="relative z-20 mx-auto max-w-7xl p-8 sm:p-12 lg:p-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 md:gap-8 lg:gap-12 pb-10">
          {/* Brand section */}
          <div className="flex flex-col space-y-4">
            <Link href="/" className="w-fit">
              <Logo />
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {settings.description}
            </p>
            <p className="font-mono text-xs text-muted-foreground/80">
              {ORG.department} · {ORG.college}
              <br />
              {ORG.city}, {ORG.state}
            </p>
          </div>

          {/* Navigation links */}
          <div>
            <h4 className="font-heading text-base font-semibold uppercase tracking-wider text-foreground mb-5">
              Navigate
            </h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Portal */}
          <div>
            <h4 className="font-heading text-base font-semibold uppercase tracking-wider text-foreground mb-5">
              Resources
            </h4>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label} className="relative w-fit">
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                    {link.pulse && (
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact section */}
          <div>
            <h4 className="font-heading text-base font-semibold uppercase tracking-wider text-foreground mb-5">
              Contact Us
            </h4>
            <ul className="space-y-3.5">
              {settings.contact_email && (
                <li className="flex items-center space-x-3 text-sm">
                  <Mail size={16} className="text-primary shrink-0" />
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="truncate text-muted-foreground transition-colors hover:text-primary"
                  >
                    {settings.contact_email}
                  </a>
                </li>
              )}
              <li className="flex items-center space-x-3 text-sm">
                <Phone size={16} className="text-primary shrink-0" />
                <a
                  href="tel:+917122667780"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  +91 (0712) 2667780
                </a>
              </li>
              <li className="flex items-start space-x-3 text-sm">
                <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground leading-snug">
                  {ORG.college}, {ORG.city}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-t border-border/70 my-6 relative z-20" />

        {/* Footer bottom bar */}
        <div className="relative z-20 flex flex-col md:flex-row justify-between items-center text-xs space-y-4 md:space-y-0 text-muted-foreground">
          {/* Social icons */}
          <div className="flex space-x-5 text-muted-foreground">
            {socialLinks.map((link) => {
              const Icon = SOCIAL_ICONS[link.platform];
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.platform}
                  className="transition-all hover:scale-110 hover:text-primary text-foreground/80"
                  title={link.platform}
                >
                  {Icon ? <Icon className="size-4" /> : <Globe className="size-4" />}
                </a>
              );
            })}
            {settings.contact_email && (
              <a
                href={`mailto:${settings.contact_email}`}
                aria-label="Email"
                className="transition-all hover:scale-110 hover:text-primary text-foreground/80"
                title="Email"
              >
                <Mail className="size-4" />
              </a>
            )}
          </div>

          {/* Copyright & Tagline */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center">
            <p>&copy; {new Date().getFullYear()} Encypherist. All rights reserved.</p>
            <span className="hidden sm:inline text-border">·</span>
            <p className="font-mono text-[11px] text-muted-foreground/80">Built by the forum, for the forum.</p>
          </div>
        </div>
      </div>

      {/* Text hover effect */}
      <div className="lg:flex hidden h-[22rem] -mt-32 -mb-20 justify-center relative z-10 pointer-events-auto overflow-hidden">
        <TextHoverEffect text="ENCYPHERIST" className="w-full max-w-5xl" />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}
