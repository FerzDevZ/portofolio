"use server";

import { z } from "zod";
import { Resend } from "resend";
import { headers } from "next/headers";

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

type ContactFormData = z.infer<typeof contactSchema>;

/**
 * In-memory rate limiter. Production would use Redis with a sliding window.
 * Maps IP address to timestamp of last request.
 */
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

function getRealIP(headersList: Headers): string {
  // Vercel provides the real IP in x-real-ip and x-forwarded-for
  const xRealIP = headersList.get("x-real-ip");
  if (xRealIP) return xRealIP;

  const xForwardedFor = headersList.get("x-forwarded-for");
  if (xForwardedFor) {
    // x-forwarded-for can be a comma-separated list; take the first
    return xForwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  // Fallback for local dev
  return "unknown";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimitMap.get(ip);

  if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW_MS) {
    return false; // Rate limited
  }

  rateLimitMap.set(ip, now);

  // Clean up old entries to prevent memory leak
  for (const [key, timestamp] of rateLimitMap.entries()) {
    if (now - timestamp > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(key);
    }
  }

  return true;
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
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  try {
    // Rate limiting
    const headersList = await headers();
    const ip = getRealIP(headersList);

    if (!checkRateLimit(ip)) {
      return {
        success: false,
        error: "Too many requests. Please wait a minute before trying again.",
      };
    }

    // Validate input
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    const validationResult = contactSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        fieldErrors: validationResult.error.flatten().fieldErrors,
      };
    }

    const data: ContactFormData = validationResult.data;

    // Check for required env var
    if (!process.env.CONTACT_EMAIL) {
      console.error("CONTACT_EMAIL environment variable is not set");
      return {
        success: false,
        error: "Service configuration error. Please try again later.",
      };
    }

    // Send email via Resend
    const { error: sendError } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL,
      replyTo: data.email,
      subject: `New contact from ${data.name}`,
      text: `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, "<br>")}</p>
      `,
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
