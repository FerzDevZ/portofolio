import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * These cover the fallback path, which is the one that runs when the Upstash
 * variables are absent — development, CI, and a store outage. The durable path
 * is exercised against the real REST API, so it is not mocked here.
 */

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

const OPTIONS = { limit: 2, windowMs: 60_000 };

async function loadLimiter() {
  return import("./rate-limit");
}

describe("hasDurableRateLimitStore", () => {
  it("is false when the Upstash variables are absent", async () => {
    const { hasDurableRateLimitStore } = await loadLimiter();
    expect(hasDurableRateLimitStore()).toBe(false);
  });
});

describe("consumeRateLimit (in-memory fallback)", () => {
  it("allows requests up to the limit and denies the next one", async () => {
    const { consumeRateLimit } = await loadLimiter();

    const first = await consumeRateLimit("contact", "198.51.100.7", OPTIONS);
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(1);
    expect(first.retryAfterSeconds).toBe(0);

    const second = await consumeRateLimit("contact", "198.51.100.7", OPTIONS);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);

    const third = await consumeRateLimit("contact", "198.51.100.7", OPTIONS);
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
    expect(third.retryAfterSeconds).toBe(60);
  });

  it("keeps a separate window per identifier", async () => {
    const { consumeRateLimit } = await loadLimiter();

    await consumeRateLimit("contact", "198.51.100.7", OPTIONS);
    await consumeRateLimit("contact", "198.51.100.7", OPTIONS);
    expect((await consumeRateLimit("contact", "198.51.100.7", OPTIONS)).allowed).toBe(
      false,
    );

    /* A different address has its own budget; one visitor must never be able
       to spend another's. */
    expect((await consumeRateLimit("contact", "203.0.113.9", OPTIONS)).allowed).toBe(
      true,
    );
  });

  it("keeps a separate window per scope", async () => {
    const { consumeRateLimit } = await loadLimiter();

    await consumeRateLimit("contact", "198.51.100.7", OPTIONS);
    await consumeRateLimit("contact", "198.51.100.7", OPTIONS);
    expect((await consumeRateLimit("contact", "198.51.100.7", OPTIONS)).allowed).toBe(
      false,
    );

    expect(
      (await consumeRateLimit("newsletter", "198.51.100.7", OPTIONS)).allowed,
    ).toBe(true);
  });

  it("counts down the seconds left in a denied window", async () => {
    const { consumeRateLimit } = await loadLimiter();

    await consumeRateLimit("contact", "198.51.100.7", { limit: 1, windowMs: 60_000 });
    vi.setSystemTime(new Date("2026-01-01T00:00:30Z"));

    const denied = await consumeRateLimit("contact", "198.51.100.7", {
      limit: 1,
      windowMs: 60_000,
    });
    expect(denied.allowed).toBe(false);
    expect(denied.retryAfterSeconds).toBe(30);
  });

  it("opens a fresh window once the old one has elapsed", async () => {
    const { consumeRateLimit } = await loadLimiter();

    await consumeRateLimit("contact", "198.51.100.7", { limit: 1, windowMs: 60_000 });
    vi.setSystemTime(new Date("2026-01-01T00:01:01Z"));

    expect(
      (await consumeRateLimit("contact", "198.51.100.7", {
        limit: 1,
        windowMs: 60_000,
      })).allowed,
    ).toBe(true);
  });
});
