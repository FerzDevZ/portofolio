"use client";

import { useActionState } from "react";
import { submitContactForm, type ContactFormState } from "@/app/actions/contact";
import type { PortfolioContent } from "@/lib/content";

/**
 * Every string the form renders, from the dictionary. The labels, placeholders
 * and status lines used to be hard-coded English, so the Indonesian contact
 * page spoke the wrong language.
 *
 * The server action's own messages (rate limit, configuration and delivery
 * failures) stay English: they are rare, and localising them would pull a
 * dictionary into a "use server" module.
 */
export type ContactFormLabels = Pick<
  PortfolioContent["contactPage"],
  | "nameLabel"
  | "namePlaceholder"
  | "emailLabel"
  | "emailPlaceholder"
  | "messageLabel"
  | "messagePlaceholder"
  | "submitLabel"
  | "submittingLabel"
  | "successTitle"
  | "successBody"
  | "errorLabel"
  | "rateLimitNote"
>;

const initialState: ContactFormState = {};

const FIELD_CLASS =
  "w-full rounded-lg border border-line bg-canvas/50 px-4 py-3 text-ink transition-colors duration-150 placeholder:text-ink-faint hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-50";

export function ContactForm({ labels }: { labels: ContactFormLabels }) {
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.success && (
        <div
          role="status"
          className="rounded-lg border border-line bg-veil-soft p-4 text-sm text-ink-muted"
        >
          <strong className="font-medium text-ink">
            {labels.successTitle}
          </strong>{" "}
          {labels.successBody}
        </div>
      )}

      {state.error && (
        <div className="rounded-lg border border-line bg-veil p-4 text-sm text-ink-muted">
          <strong className="font-medium text-signal">
            {labels.errorLabel}
          </strong>{" "}
          {state.error}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint"
        >
          {labels.nameLabel}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={100}
          disabled={isPending}
          className={FIELD_CLASS}
          placeholder={labels.namePlaceholder}
          aria-invalid={state.fieldErrors?.name ? "true" : "false"}
          aria-describedby={state.fieldErrors?.name ? "name-error" : undefined}
        />
        {state.fieldErrors?.name && (
          <p id="name-error" className="mt-1 text-sm text-signal">
            {state.fieldErrors.name[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint"
        >
          {labels.emailLabel}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          disabled={isPending}
          className={FIELD_CLASS}
          placeholder={labels.emailPlaceholder}
          aria-invalid={state.fieldErrors?.email ? "true" : "false"}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
        />
        {state.fieldErrors?.email && (
          <p id="email-error" className="mt-1 text-sm text-signal">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint"
        >
          {labels.messageLabel}
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={2000}
          disabled={isPending}
          rows={6}
          className={`${FIELD_CLASS} resize-y`}
          placeholder={labels.messagePlaceholder}
          aria-invalid={state.fieldErrors?.message ? "true" : "false"}
          aria-describedby={
            state.fieldErrors?.message ? "message-error" : undefined
          }
        />
        {state.fieldErrors?.message && (
          <p id="message-error" className="mt-1 text-sm text-signal">
            {state.fieldErrors.message[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary w-full justify-center"
      >
        {isPending ? labels.submittingLabel : labels.submitLabel}
      </button>

      <p className="text-center font-mono text-[11px] text-ink-faint">
        {labels.rateLimitNote}
      </p>
    </form>
  );
}
