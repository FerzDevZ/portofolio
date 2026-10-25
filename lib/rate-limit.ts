/* ------------------------------------------------------------------ */
/* Rate limiting for server actions                                    */
/*                                                                     */
/* A `Map` in module scope is not a limit on serverless: every cold    */
/* start gets its own map, concurrent instances never see each other,  */
/* and a deploy resets all of them. The contact form's old limiter was */
/* exactly that — it only ever limited a single warm lambda.           */
/*                                                                     */
/* The durable backend is Upstash Redis over its REST API, which is    */
/* usable from a serverless function without a connection pool. The    */
/* in-memory window stays as a development fallback (and as a          */
/* resilience path if the store is unreachable), and the caller can    */
/* ask `hasDurableRateLimitStore()` whether the deployment is actually */
/* protected or merely pretending to be.                               */
/* ------------------------------------------------------------------ */

import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";

export type RateLimitOptions = {
  /** Requests allowed inside one window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  /** Requests left in the current window; 0 once denied. */
  remaining: number;
  /** Seconds until the window resets; 0 when the request was allowed. */
  retryAfterSeconds: number;
};

const redisRestUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
const redisRestToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

/**
 * One client per process, created only when both variables are present.
 * `Redis.fromEnv()` would throw at import time, which would take the whole
 * action down on a deployment that has not configured the store yet.
 */
const durableStore =
  redisRestUrl && redisRestToken
    ? new Redis({ url: redisRestUrl, token: redisRestToken })
    : null;

/** Whether this process is limiting against a store every instance shares. */
export function hasDurableRateLimitStore(): boolean {
  return durableStore !== null;
}

/**
 * Hashing keeps raw visitor IPs out of Redis and out of error messages while
 * still giving every address its own bucket.
 */
function hashIdentifier(identifier: string): string {
  return createHash("sha256").update(identifier).digest("hex").slice(0, 32);
}

type WindowState = { count: number; resetAt: number };

const memoryWindows = new Map<string, WindowState>();

/** Entries are dropped once their window ends; the sweep is bounded by size. */
const MEMORY_SWEEP_THRESHOLD = 1_000;

function readResult(
  requestCount: number,
  resetAt: number,
  nowMs: number,
  limit: number,
): RateLimitResult {
  const allowed = requestCount <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - requestCount),
    retryAfterSeconds: allowed
      ? 0
      : Math.max(1, Math.ceil((resetAt - nowMs) / 1_000)),
  };
}

function consumeFromMemory(
  key: string,
  { limit, windowMs }: RateLimitOptions,
  nowMs: number,
): RateLimitResult {
  const storedWindow = memoryWindows.get(key);
  const currentWindow =
    storedWindow && storedWindow.resetAt > nowMs
      ? storedWindow
      : { count: 0, resetAt: nowMs + windowMs };

  currentWindow.count += 1;
  memoryWindows.set(key, currentWindow);

  if (memoryWindows.size > MEMORY_SWEEP_THRESHOLD) {
    for (const [candidateKey, candidateWindow] of memoryWindows) {
      if (candidateWindow.resetAt <= nowMs) memoryWindows.delete(candidateKey);
    }
  }

  return readResult(currentWindow.count, currentWindow.resetAt, nowMs, limit);
}

async function consumeFromRedis(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): Promise<RateLimitResult> {
  /* A fixed window, not a sliding one: one INCR per request, and the expiry is
     set by whichever request created the key. `INCR` is atomic, so the counter
     is correct across concurrent instances. */
  const store = durableStore;
  if (!store) throw new Error("Durable rate limit store is not configured");

  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1_000));
  const counterPipeline = store.pipeline();
  counterPipeline.incr(key);
  const [requestCount] = await counterPipeline.exec<[number]>();

  if (requestCount === 1) {
    try {
      await store.expire(key, windowSeconds);
    } catch (expiryFailure) {
      /* A counter that never expires would deny this visitor forever, which is
         worse than one uncounted request. Drop the key and let the caller's
         fallback handle the outage. */
      await store.del(key).catch(() => undefined);
      throw expiryFailure;
    }
  }

  if (requestCount <= limit) {
    return {
      allowed: true,
      remaining: Math.max(0, limit - requestCount),
      retryAfterSeconds: 0,
    };
  }

  const remainingSeconds = await store.ttl(key);
  return {
    allowed: false,
    remaining: 0,
    retryAfterSeconds:
      remainingSeconds > 0 ? remainingSeconds : windowSeconds,
  };
}

/**
 * Counts one request against `identifier` inside `scope`.
 *
 * A store outage falls back to the per-instance window rather than failing the
 * action: a contact form that refuses every message because Redis is down is a
 * worse outcome than one limiter that is briefly weaker.
 */
export async function consumeRateLimit(
  scope: string,
  identifier: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const key = `rate:${scope}:${hashIdentifier(identifier)}`;

  if (!durableStore) return consumeFromMemory(key, options, Date.now());

  try {
    return await consumeFromRedis(key, options);
  } catch (storeFailure) {
    console.error(
      "Rate limit store unavailable; falling back to per-instance memory:",
      storeFailure,
    );
    return consumeFromMemory(key, options, Date.now());
  }
}
