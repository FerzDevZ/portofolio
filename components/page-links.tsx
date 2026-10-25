import Link from "next/link";
import {
  localizedPath,
  type Locale,
  type NavItem,
} from "@/lib/content";

/**
 * Site-page links: the routes that are not in-page anchors.
 *
 * `content.nav` is a list of `#section` anchors that only exist on the home
 * page, and the header's active-section tracking reads them as anchors. A page
 * route cannot join that list without breaking both, so the page routes travel
 * separately and are rendered here — in the footer, and in the mobile panel as
 * full-width rows.
 *
 * A server component: the links are plain `<Link>`s, so they work before
 * hydration and are prefetched like every other internal route.
 */
export function PageLinks({
  locale,
  links,
  label,
  className = "",
}: {
  locale: Locale;
  links: NavItem[];
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={className}>
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
        {links.map((pageLink) => (
          <li key={pageLink.href}>
            <Link
              href={localizedPath(locale, pageLink.href)}
              className="link-sweep inline-flex min-h-6 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint transition-colors duration-150 hover:text-ink"
            >
              {pageLink.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
