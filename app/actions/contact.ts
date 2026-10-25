"use server";

import { z } from "zod";
import { Resend } from "resend";
import { headers } from "next/headers";
import { renderContactEmail } from "@/lib/contact-email";
import { consumeRateLimit, hasDurableRateLimitStore } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

type ContactFormData = z.infer<typeof contactSchema>;

/** One message per minute per address, counted in a store every instance shares. */
const RATE_LIMIT = { limit: 1, windowMs: 60_000 } as const;

let warnedAboutMemoryOnlyLimiting = false;

/**
 * The Resend client is built per send rather than at module scope.
 *
 * `new Resend()` throws when the key is missing, and a module-scope throw turns
 * a missing environment variable into an action module that cannot load at all.
 * Reading it here makes the failure a message the visitor (and the log) can see.
 */
function readResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  return apiKey ? new Resend(apiKey) : null;
}

/**
 * The visitor's address, from the headers the platform sets.
 *
 * `x-real-ip` is written by the hosting proxy; `x-forwarded-for` is a fallback
 * whose first entry is the client. Both are read-only here — nothing in this
 * action sets them, so a visitor cannot choose the bucket by sending their own
 * header on a deployment that overwrites them.
 */
function getRealIP(headersList: Headers): string {
  const realIp = headersList.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? "unknown";

  return "unknown";
}

export type ContactFormState = {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    name?: string[];
    email?: string[];
    message?: string[];
  };
};

export async function submitContactForm(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  try {
    const headersList = await headers();
    const visitorIp = getRealIP(headersList);

    if (!hasDurableRateLimitStore() && !warnedAboutMemoryOnlyLimiting) {
      warnedAboutMemoryOnlyLimiting = true;
      console.warn(
        "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set: contact rate limiting is per-instance only.",
      );
    }

    const rateLimit = await consumeRateLimit("contact", visitorIp, RATE_LIMIT);
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Too many requests. Please wait ${rateLimit.retryAfterSeconds} seconds and try again.`,
      };
    }

    const validationResult = contactSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    });

    if (!validationResult.success) {
      return {
        success: false,
        fieldErrors: validationResult.error.flatten().fieldErrors,
      };
    }

    const message: ContactFormData = validationResult.data;

    const resendClient = readResendClient();
    const contactEmail = process.env.CONTACT_EMAIL?.trim();
    if (!resendClient || !contactEmail) {
      console.error(
        `Contact form is not configured: ${
          resendClient ? "CONTACT_EMAIL" : "RESEND_API_KEY"
        } is missing.`,
      );
      return {
        success: false,
        error: "Service configuration error. Please try again later.",
      };
    }

    const { error: sendError } = await resendClient.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: contactEmail,
      replyTo: message.email,
      /* Subject, text and HTML are rendered by `lib/contact-email`, which
         escapes the HTML part and flattens header-injecting newlines. */
      ...renderContactEmail(message),
    });

    if (sendError) {
      console.error("Resend error:", sendError);
      return {
        success: false,
        error: "Failed to send message. Please try again later.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Contact form error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}
