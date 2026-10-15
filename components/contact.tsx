import { formatTemplate, type PortfolioContent } from "@/lib/content";
import { LocalClock } from "@/components/local-clock";
import { RevealSection } from "@/components/reveal-section";

/**
 * The address is wider than its display column, so it is split at the `@`.
 * The `<wbr>` marks the preferred wrap point and `overflow-wrap: anywhere` on
 * the anchor is the fallback that stops a narrow viewport from overflowing.
 */
function splitEmail(email: string): { localPart: string; domain: string } {
  const atIndex = email.indexOf("@");
  return atIndex === -1
    ? { localPart: email, domain: "" }
    : { localPart: email.slice(0, atIndex), domain: email.slice(atIndex) };
}

/**
 * Contact: display-scale mailto on the left axis, socials as a plain index.
 */
export function Contact({ content }: { content: PortfolioContent }) {
  const { contact, site, socials } = content;
  const { localPart, domain } = splitEmail(site.email);

  return (
    <section id="contact" className="mx-auto max-w-6xl px-5 pt-24 sm:px-8">
      <RevealSection>
        <header className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
            {contact.heading}
          </h2>
          <span className="flex items-center gap-2 font-mono text-xs text-ink-faint">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-live shadow-[0_0_6px_var(--color-live)]"
            />
            {site.availability}
          </span>
        </header>
      </RevealSection>

      <div className="grid grid-cols-1 gap-10 py-14 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
            {contact.kicker}
          </p>
          <a
            href={`mailto:${site.email}`}
            className="link-sweep mt-4 inline-block text-email text-ink [overflow-wrap:anywhere]"
          >
            {localPart}
            <wbr />
            {domain}
          </a>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-ink-muted">
            {contact.body}
          </p>
        </div>

        <nav aria-label={contact.socialsLabel} className="lg:col-span-5">
          <ul className="border-t border-line">
            {socials.map((socialLink) => (
              <li key={socialLink.label}>
                <a
                  href={socialLink.href}
                  target={socialLink.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="group flex flex-wrap items-center justify-between gap-y-1 border-b border-line py-4 transition-colors duration-150 hover:text-ink"
                >
                  <span className="text-sm text-ink-muted transition-colors duration-150 group-hover:text-ink">
                    {socialLink.label}
                  </span>
                  {/* `ml-auto` keeps the handle flush right once `flex-wrap`
                      drops it to its own line on the narrowest phones. */}
                  <span className="ml-auto flex items-center gap-3 font-mono text-xs text-ink-faint">
                    {socialLink.handle}
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                      className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    >
                      <path
                        d="M3.5 8.5L8.5 3.5M4.5 3.5h4v4"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}

export function Footer({ content }: { content: PortfolioContent }) {
  return (
    <footer className="mt-10 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-mono text-[11px] text-ink-faint">
          {formatTemplate(content.footer.copyrightTemplate, {
            year: new Date().getFullYear(),
            name: content.site.name,
          })}
        </p>
        <div className="flex items-center gap-5">
          <LocalClock
            label={content.ui.clockLabel}
            timeZone={content.site.timezone}
          />
          <a
            href="#top"
            className="inline-flex min-h-6 items-center font-mono text-[11px] text-ink-faint transition-colors duration-150 hover:text-ink"
          >
            {content.footer.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
