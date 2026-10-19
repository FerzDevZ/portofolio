"use client";

import { useActionState } from "react";
import { submitContactForm, type ContactFormState } from "@/app/actions/contact";

const initialState: ContactFormState = {};

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.success && (
        <div className="rounded-lg bg-[#F0E3D0] p-4 text-sm text-[#2A2723]">
          <strong className="font-semibold">Message sent!</strong> You&apos;ll get a reply soon.
        </div>
      )}

      {state.error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-900">
          <strong className="font-semibold">Error:</strong> {state.error}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-semibold text-[#1F2421]"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          disabled={isPending}
          className="w-full rounded-lg border border-[#E2D9C8] bg-[#FBF7EF] px-4 py-3 text-[#1F2421] transition-colors placeholder:text-[#8A8A80] hover:border-[#C8853F]/40 focus:border-[#C8853F] focus:outline-none focus:ring-2 focus:ring-[#C8853F]/20 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Your name"
          aria-invalid={state.fieldErrors?.name ? "true" : "false"}
          aria-describedby={state.fieldErrors?.name ? "name-error" : undefined}
        />
        {state.fieldErrors?.name && (
          <p id="name-error" className="mt-1 text-sm text-red-600">
            {state.fieldErrors.name[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-semibold text-[#1F2421]"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          disabled={isPending}
          className="w-full rounded-lg border border-[#E2D9C8] bg-[#FBF7EF] px-4 py-3 text-[#1F2421] transition-colors placeholder:text-[#8A8A80] hover:border-[#C8853F]/40 focus:border-[#C8853F] focus:outline-none focus:ring-2 focus:ring-[#C8853F]/20 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="your@email.com"
          aria-invalid={state.fieldErrors?.email ? "true" : "false"}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
        />
        {state.fieldErrors?.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-2 block text-sm font-semibold text-[#1F2421]"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          disabled={isPending}
          rows={6}
          className="w-full resize-none rounded-lg border border-[#E2D9C8] bg-[#FBF7EF] px-4 py-3 text-[#1F2421] transition-colors placeholder:text-[#8A8A80] hover:border-[#C8853F]/40 focus:border-[#C8853F] focus:outline-none focus:ring-2 focus:ring-[#C8853F]/20 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Tell me about your project..."
          aria-invalid={state.fieldErrors?.message ? "true" : "false"}
          aria-describedby={state.fieldErrors?.message ? "message-error" : undefined}
        />
        {state.fieldErrors?.message && (
          <p id="message-error" className="mt-1 text-sm text-red-600">
            {state.fieldErrors.message[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[#C8853F] px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-[#A86B2C] hover:shadow-md active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#C8853F] disabled:hover:shadow-sm"
      >
        {isPending ? "Sending..." : "Send message"}
      </button>

      <p className="text-center text-xs text-[#8A8A80]">
        Rate limited to 1 request per minute. Your message is never shared.
      </p>
    </form>
  );
}
