/* ------------------------------------------------------------------ */
/* The contact notification e-mail                                      */
/*                                                                      */
/* Rendering lives here rather than inside the server action so the     */
/* escaping rules can be tested as data instead of inferred from a      */
/* sent message. The action validates, rate-limits, and hands the       */
/* result to Resend; this module only decides what that message says.  */
/* ------------------------------------------------------------------ */

import { escapeHtml, escapeHtmlWithLineBreaks } from "@/lib/escape-html";

export type ContactMessage = {
  name: string;
  email: string;
  message: string;
};

export type RenderedContactEmail = {
  subject: string;
  text: string;
  html: string;
};

/**
 * Flattens a value that is going into a mail header.
 *
 * A newline inside `name` would let a visitor append headers to the message
 * (`Bcc: …`) in any mail client that trusts the sender's header block.
 */
function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

/**
 * Builds the notification e-mail for one visitor message.
 *
 * The plain-text part carries the values as typed — it has no markup, so there
 * is nothing to escape. The HTML part escapes every visitor-supplied value:
 * without it, a message is markup in the recipient's mail client, and the
 * sender's own domain lends the link its credibility.
 */
export function renderContactEmail(
  contactMessage: ContactMessage,
): RenderedContactEmail {
  const senderName = escapeHtml(contactMessage.name);
  const senderEmail = escapeHtml(contactMessage.email);

  return {
    subject: `New contact from ${singleLine(contactMessage.name)}`,
    text: `Name: ${contactMessage.name}\nEmail: ${contactMessage.email}\n\nMessage:\n${contactMessage.message}`,
    html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${senderName}</p>
        <p><strong>Email:</strong> <a href="mailto:${senderEmail}">${senderEmail}</a></p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtmlWithLineBreaks(contactMessage.message)}</p>
      `,
  };
}
