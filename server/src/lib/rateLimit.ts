type Bucket = {count: number; resetAt: number}

const buckets = new Map<string, Bucket>()

/** Simple fixed-window limiter (per-process). Enough for a single Node instance. */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): {ok: true} | {ok: false; retryAfterSec: number} {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, {count: 1, resetAt: now + windowMs})
    return {ok: true}
  }

  if (existing.count >= limit) {
    return {ok: false, retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000))}
  }

  existing.count += 1
  return {ok: true}
}

/** Periodic cleanup to avoid unbounded Map growth. */
export function pruneRateLimits(): void {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

setInterval(pruneRateLimits, 60_000).unref?.()
