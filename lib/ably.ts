import Ably from "ably";

/**
 * Server-side Ably REST client for publishing real-time messages.
 * Used by API routes to push events to channels.
 *
 * @throws {Error} If ABLY_API_KEY environment variable is not configured.
 */
let _ablyRest: Ably.Rest | null = null;

export function getAblyRest(): Ably.Rest {
  if (!process.env.ABLY_API_KEY) {
    throw new Error("ABLY_API_KEY environment variable is not set");
  }
  if (!_ablyRest) {
    _ablyRest = new Ably.Rest({ key: process.env.ABLY_API_KEY });
  }
  return _ablyRest;
}

/**
 * Lazy singleton — only instantiates when first accessed.
 * Throws at call-time (not import-time) if ABLY_API_KEY is missing.
 */
export const ablyRest = new Proxy({} as Ably.Rest, {
  get(_target, prop) {
    return (getAblyRest() as any)[prop];
  },
});
