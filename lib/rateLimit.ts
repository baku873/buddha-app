import { kv } from "@vercel/kv";

/**
 * lib/rateLimit.ts
 * Redis-backed sliding window rate limiter with in-memory fallback for development.
 */

// Simple in-memory fallback for environments without Redis/Vercel KV
const localLimits = new Map<string, { count: number; resetAt: number }>();
const isKVConfigured = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

if (!isKVConfigured && process.env.NODE_ENV === 'development') {
  console.warn('⚠️ [RateLimit] Vercel KV environment variables are missing. Falling back to in-memory rate limiting.');
}

/**
 * Returns true if the request is ALLOWED, false if rate limited.
 */
export async function rateLimit(
  ip: string, 
  limit: number = 100, 
  windowMs: number = 60_000
): Promise<boolean> {
  const windowSeconds = Math.floor(windowMs / 1000);
  const bucket = Math.floor(Date.now() / windowMs);
  const key = `ratelimit:${ip}:${bucket}`;

  if (isKVConfigured) {
    try {
      const count = await kv.incr(key);
      if (count === 1) {
        await kv.expire(key, windowSeconds);
      }
      return count <= limit;
    } catch (error) {
      console.error("[RateLimit] KV error:", error);
      // Fall through to local fallback on failure
    }
  }

  // Local In-Memory Fallback
  const now = Date.now();
  const entry = localLimits.get(key);

  if (!entry) {
    localLimits.set(key, { count: 1, resetAt: now + windowMs });
    
    // Periodically clean up old buckets
    if (localLimits.size > 1000) {
      for (const [k, v] of localLimits.entries()) {
        if (now > v.resetAt) localLimits.delete(k);
      }
    }
    
    return true;
  }

  entry.count++;
  return entry.count <= limit;
}

/**
 * Extract the real client IP from a Next.js Request object.
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  return (
    headers.get("cf-connecting-ip") ||         // Cloudflare
    headers.get("x-real-ip") ||                 // Nginx
    headers.get("x-forwarded-for")?.split(",")[0].trim() || // Standard proxy
    "unknown"
  );
}
