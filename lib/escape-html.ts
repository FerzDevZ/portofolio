/* ------------------------------------------------------------------ */
/* HTML escaping for interpolated email copy                           */
/*                                                                     */
/* The contact form's notification e-mail is HTML with visitor-supplied */
/* values inside it. Escaping is the only thing that separates a        */
/* message like `<a href="https://evil">Reset your password</a>` from a */
/* working phishing link rendered by the sender's own mail client.      */
/* ------------------------------------------------------------------ */

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Replaces the five characters that can change HTML structure.
 *
 * Ordering is handled by the character class in one pass, so an input that is
 * already an entity (`&amp;`) is escaped again (`&amp;amp;`) and renders
 * literally — which is what a visitor typed, and what a single pass gives.
 */
export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) => HTML_ENTITIES[character] ?? character,
  );
}

/**
 * Escapes, then turns line breaks into `<br>`.
 *
 * Escaping happens first on purpose: the `<br>` tags are the only markup this
 * function may introduce, so nothing a visitor typed can become markup.
 */
export function escapeHtmlWithLineBreaks(value: string): string {
  return escapeHtml(value).replace(/\r\n|\r|\n/g, "<br>");
}
