/**
 * Clerk server shim for Capacitor static export builds.
 * Provides no-op stubs for server-side Clerk functions.
 */
export async function currentUser() {
  return null;
}

export function clerkClient() {
  return {
    users: {
      getUser: async () => null,
      getUserList: async () => [],
      updateUser: async () => null,
    },
  };
}

export function auth() {
  return { userId: null, getToken: async () => null };
}

/**
 * No-op middleware wrapper for Capacitor builds.
 * Returns a passthrough middleware that just calls next().
 */
export function clerkMiddleware(handler: (...args: any[]) => any) {
  return handler;
}
