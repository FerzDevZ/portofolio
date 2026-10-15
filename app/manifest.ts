import type { MetadataRoute } from "next";
import { defaultLocale, formatTemplate, getContent } from "@/lib/content";

/**
 * Web app manifest, served by Next at /manifest.webmanifest and linked from
 * the document head automatically. The colours are the resolved sRGB values of
 * the dark canvas token in globals.css, so the splash surface and the status
 * bar chrome sit flush with the page instead of flashing a different dark.
 *
 * A manifest cannot carry a media query, so these two stay pinned to the dark
 * palette while the page itself follows `prefers-color-scheme`. It also cannot
 * negotiate a language: one URL, one document. So the name, description and
 * `lang` come from the default-locale dictionary, and `start_url` stays at
 * `/` — the middleware sends the visitor on to the locale their header or
 * cookie asks for, rather than hard-coding English into an installed app.
 */
export default function manifest(): MetadataRoute.Manifest {
  const content = getContent(defaultLocale);

  return {
    id: "/",
    name: formatTemplate(content.meta.homeTitleTemplate, {
      name: content.site.name,
      role: content.site.role,
    }),
    short_name: content.site.homeScreenName,
    description: content.site.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#050709",
    theme_color: "#050709",
    lang: defaultLocale,
    dir: "ltr",
    categories: ["portfolio", "developer", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
