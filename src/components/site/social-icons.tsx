import { useId, type SVGProps } from "react";

/**
 * Lucide (this project's icon set) deliberately ships no brand logos —
 * Instagram/LinkedIn/GitHub aren't in it. These are hand-drawn to match its
 * exact conventions (24x24, stroke-based, currentColor, strokeWidth 2,
 * round caps/joins) so they sit next to `lucide-react` icons without
 * looking like a different icon set was mixed in.
 */
function IconBase(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

/**
 * Instagram's mark is its gradient as much as its shape, so — unlike the
 * other two, which are a single flat brand color — this one carries its own
 * `<linearGradient>`. The id is per-instance via `useId()` since the card
 * grids render this icon dozens of times on one page; a hardcoded id would
 * collide and silently break the gradient on every instance after the
 * first.
 */
export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  const gradientId = `instagram-gradient-${useId()}`;
  return (
    <IconBase {...props} stroke={`url(#${gradientId})`}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFDD55" />
          <stop offset="30%" stopColor="#FF543E" />
          <stop offset="60%" stopColor="#C837AB" />
          <stop offset="100%" stopColor="#5851DB" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </IconBase>
  );
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props} stroke="#0A66C2">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </IconBase>
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props} stroke="#1877F2">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </IconBase>
  );
}

/**
 * GitHub's mark has no brand color — it's just ink — so this one keeps
 * `stroke="currentColor"` (inherited from `IconBase`) and is expected to be
 * colored by its container (`text-foreground`) so it flips black/white
 * with the theme instead of disappearing in dark mode.
 */
export function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </IconBase>
  );
}
