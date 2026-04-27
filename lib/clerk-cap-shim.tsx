/**
 * Clerk shim for Capacitor static export builds.
 *
 * When building with `output: 'export'`, @clerk/nextjs cannot be imported because
 * it registers server actions at the module level. This shim provides no-op stubs
 * for every Clerk symbol used in the app, allowing the static build to succeed.
 *
 * The native app uses custom JWT auth (AuthContext + /api/auth/*), not Clerk sessions.
 * These stubs will never be called in production — they exist only to satisfy imports.
 */
"use client";

import React from "react";

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// ─── Guard Components ─────────────────────────────────────────────────────────
export function ClerkLoaded({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function ClerkLoading({ children }: { children?: React.ReactNode }) {
  return null;
}

// ─── UI Components ────────────────────────────────────────────────────────────
export function UserButton() {
  return null;
}

export function SignInButton({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function SignUpButton({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

// ─── Hooks (return safe defaults) ─────────────────────────────────────────────
export function useUser() {
  return { isLoaded: true, isSignedIn: false, user: null };
}

export function useClerk() {
  return { signOut: () => Promise.resolve(), openSignIn: () => {}, openSignUp: () => {} };
}

export function useSignIn() {
  return {
    isLoaded: true,
    signIn: {
      create: () => Promise.resolve({}),
      prepareFirstFactor: () => Promise.resolve({}),
      attemptFirstFactor: () => Promise.resolve({}),
      supportedFirstFactors: [],
      status: null,
    },
    setActive: () => Promise.resolve(),
  };
}

export function useSignUp() {
  return {
    isLoaded: true,
    signUp: {
      create: () => Promise.resolve({}),
      prepareEmailAddressVerification: () => Promise.resolve({}),
      attemptEmailAddressVerification: () => Promise.resolve({}),
      preparePhoneNumberVerification: () => Promise.resolve({}),
      attemptPhoneNumberVerification: () => Promise.resolve({}),
      status: null,
    },
    setActive: () => Promise.resolve(),
  };
}

export function useAuth() {
  return { isLoaded: true, isSignedIn: false, userId: null, getToken: () => Promise.resolve(null) };
}
