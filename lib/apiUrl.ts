/**
 * Resolves API paths for mobile Capacitor builds.
 *
 * In the browser (web), relative paths like `/api/foo` work because the
 * same origin serves both the SPA and the API routes. Inside Capacitor
 * the origin is `capacitor://localhost` (iOS) or `https://localhost` (Android),
 * so relative API calls fail — they need an absolute URL pointing at the
 * production server.
 *
 * @param path - A path starting with `/api/…`
 * @returns The original path on web, or the fully-qualified URL on native.
 *
 * CRITICAL CALL-SITES (grep for `fetch("/api/` or `fetch(\`/api/`):
 *   - contexts/AuthContext.tsx          → /api/auth/* (login, register, verify)
 *   - app/[locale]/booking/[id]/page.tsx → /api/bookings/*
 *   - app/[locale]/monks/[id]/page.tsx  → /api/monks/*
 *   - app/components/checkout/QPay.tsx  → /api/qpay/*
 *   - app/[locale]/dashboard/page.tsx   → /api/bookings/*, /api/monks/*
 *   - app/capacitor/plugins/pushNotifications.ts → /api/notifications/*
 */
export const apiUrl = (path: string): string => {
  if (
    typeof window !== 'undefined' &&
    (window as Record<string, unknown>).Capacitor &&
    typeof ((window as Record<string, unknown>).Capacitor as Record<string, unknown>)?.isNativePlatform === 'function' &&
    ((window as Record<string, unknown>).Capacitor as { isNativePlatform: () => boolean }).isNativePlatform()
  ) {
    return `${process.env.NEXT_PUBLIC_API_URL || 'https://gevabal.mn'}${path}`;
  }
  return path;
};
