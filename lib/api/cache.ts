import { kv } from '@vercel/kv';

/**
 * lib/api/cache.ts
 * Reliable caching with in-memory fallback for local development.
 */

// Simple in-memory fallback for environments without Redis/Vercel KV
const localCache = new Map<string, { data: any; expiresAt: number }>();

const isKVConfigured = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

if (!isKVConfigured && process.env.NODE_ENV === 'development') {
    console.warn('⚠️ [ApiCache] Vercel KV environment variables are missing. Falling back to in-memory cache.');
}

class ApiCache {
    /**
     * Set a cache entry
     */
    async set(key: string, data: any, ttl: number = 300): Promise<void> {
        if (isKVConfigured) {
            try {
                await kv.set(key, JSON.stringify(data), { ex: ttl });
                return;
            } catch (err) {
                console.error('[ApiCache] KV set error:', err);
            }
        }
        
        // Fallback or development
        localCache.set(key, {
            data,
            expiresAt: Date.now() + (ttl * 1000)
        });
    }

    /**
     * Get a cache entry
     */
    async get<T>(key: string): Promise<T | null> {
        if (isKVConfigured) {
            try {
                const data = await kv.get<string | T>(key);
                if (!data) return null;
                
                if (typeof data === 'string') {
                    try {
                        return JSON.parse(data) as T;
                    } catch {
                        return data as unknown as T;
                    }
                }
                return data as T;
            } catch (err) {
                console.error('[ApiCache] KV get error:', err);
                // Fall through to local cache or return null
            }
        }

        const entry = localCache.get(key);
        if (entry) {
            if (Date.now() > entry.expiresAt) {
                localCache.delete(key);
                return null;
            }
            return entry.data as T;
        }
        return null;
    }

    /**
     * Delete a cache entry
     */
    async delete(key: string): Promise<void> {
        if (isKVConfigured) {
            try {
                await kv.del(key);
                return;
            } catch (err) {
                console.error('[ApiCache] KV delete error:', err);
            }
        }
        localCache.delete(key);
    }

    /**
     * Delete all keys matching a pattern
     */
    async deletePattern(pattern: string): Promise<void> {
        if (isKVConfigured) {
            try {
                const redisPattern = pattern.replace(/\*/g, '*');
                const keys = await kv.keys(redisPattern);
                if (keys.length > 0) {
                    await kv.del(...keys);
                }
                return;
            } catch (err) {
                console.error('[ApiCache] KV deletePattern error:', err);
            }
        }

        const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        for (const key of localCache.keys()) {
            if (regexPattern.test(key)) {
                localCache.delete(key);
            }
        }
    }

    /**
     * Clear all cache
     */
    async clear(): Promise<void> {
        if (isKVConfigured) {
            try {
                const keys = await kv.keys('*');
                if (keys.length > 0) {
                    await kv.del(...keys);
                }
                return;
            } catch (err) {
                console.error('[ApiCache] KV clear error:', err);
            }
        }
        localCache.clear();
    }
}

// Singleton instance
export const apiCache = new ApiCache();

/**
 * Cache helper for API routes
 */
export async function getCached<T>(key: string): Promise<T | null> {
    return apiCache.get<T>(key);
}

export async function setCached(key: string, data: any, ttl: number = 300): Promise<void> {
    await apiCache.set(key, data, ttl);
}

export async function invalidateCache(pattern: string): Promise<void> {
    await apiCache.deletePattern(pattern);
}

/**
 * Cached response helper
 */
export async function withCache<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = 300
): Promise<T> {
    const cached = await getCached<T>(key);
    if (cached !== null) {
        return cached;
    }

    const data = await fn();
    await setCached(key, data, ttl);
    return data;
}

/**
 * Create cache headers for Next.js responses
 */
export function getCacheHeaders(maxAge: number = 300): {
    'Cache-Control': string;
} {
    return {
        'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
    };
}
