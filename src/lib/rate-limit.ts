// In-memory rate limiter — 5 failed attempts per key per 15 minutes.
// Key format: "student:<username>" or "parent:<email>".
// NOTE: This is per-process; in multi-instance deployments, use Redis instead.

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// Map is module-level singleton; persists across requests in the same process.
const store = new Map<string, RateLimitEntry>();

/**
 * Check and record a failed login attempt.
 * Returns `{ limited: true }` when the key has exceeded MAX_ATTEMPTS in the window.
 * Call this ONLY on failed attempts — successful logins should call `resetLoginRateLimit`.
 */
export function checkLoginRateLimit(key: string): { limited: boolean } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    // New window — start fresh
    store.set(key, { count: 1, windowStart: now });
    return { limited: false };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { limited: true };
  }

  entry.count += 1;
  return { limited: false };
}

/** Reset the counter after a successful login so a real user isn't locked out. */
export function resetLoginRateLimit(key: string): void {
  store.delete(key);
}
