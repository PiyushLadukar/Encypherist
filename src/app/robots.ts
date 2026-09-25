import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /certificates also carries a noindex meta tag, which is the stronger
        // signal — listing it here as well keeps crawlers off the search UI.
        disallow: ["/admin", "/api", "/certificates"],
      },
      // Training crawlers. They ignore nothing here that a person needs.
      {
        userAgent: ["GPTBot", "CCBot", "ClaudeBot", "Google-Extended", "anthropic-ai", "PerplexityBot"],
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
