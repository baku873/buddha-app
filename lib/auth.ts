import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connectToDatabase } from "@/database/db";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Unified user shape returned by getAuthUser.
 * Every authenticated route gets the same object.
 */
export interface AuthUser {
  /** Primary identifier — MongoDB _id (string) for custom users, Clerk ID for Clerk users */
  id: string;
  /** Always the MongoDB _id (string), resolved from Clerk or JWT */
  dbId: string;
  /** Display name */
  fullName: string;
  /** "client" | "monk" | "admin" */
  role: string;
  /** True if authenticated via Clerk */
  isClerk: boolean;
}

/**
 * Resolve the authenticated user from a request.
 *
 * Resolution order (first match wins):
 *  1. `auth_token` cookie → verify JWT → lookup MongoDB user
 *  2. `Authorization: Bearer <token>` header → same JWT flow
 *  3. Clerk `currentUser()` → resolve MongoDB user by clerkId
 *
 * @param request - The incoming Request object
 * @returns AuthUser if authenticated, null otherwise
 */
export async function getAuthUser(request?: Request): Promise<AuthUser | null> {
  try {
    // ── 1. Try custom JWT (cookie or bearer) ──
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("auth_token")?.value;

    const authHeader = request?.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    const token = cookieToken || bearerToken;

    if (token && JWT_SECRET) {
      try {
        const { payload } = await jwtVerify(
          token,
          new TextEncoder().encode(JWT_SECRET)
        );

        if (payload?.sub) {
          const { db } = await connectToDatabase();
          const dbUser = await db
            .collection("users")
            .findOne({ _id: new ObjectId(payload.sub as string) });

          if (dbUser) {
            return {
              id: dbUser._id.toString(),
              dbId: dbUser._id.toString(),
              fullName: dbUser.firstName
                ? `${dbUser.firstName} ${dbUser.lastName || ""}`.trim()
                : dbUser.phone || "User",
              role: dbUser.role || "client",
              isClerk: false,
            };
          }
        }
      } catch {
        // Invalid/expired custom JWT — fall through to Clerk
      }
    }

    // ── 2. Try Clerk ──
    const clerkUser = await currentUser();
    if (clerkUser) {
      const { db } = await connectToDatabase();
      const dbUser = await db
        .collection("users")
        .findOne({ clerkId: clerkUser.id });

      if (dbUser) {
        return {
          id: clerkUser.id,
          dbId: dbUser._id.toString(),
          fullName:
            clerkUser.fullName ||
            `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
            "User",
          role: dbUser.role || (clerkUser.publicMetadata?.role as string) || "client",
          isClerk: true,
        };
      }

      // Clerk user exists but no DB record — return minimal info
      return {
        id: clerkUser.id,
        dbId: clerkUser.id, // No DB record yet; use Clerk ID as fallback
        fullName: clerkUser.fullName || "User",
        role: (clerkUser.publicMetadata?.role as string) || "client",
        isClerk: true,
      };
    }

    return null;
  } catch (error) {
    console.error("[lib/auth] getAuthUser error:", error);
    return null;
  }
}

/**
 * Higher-order wrapper that enforces authentication.
 *
 * Usage:
 * ```ts
 * export const GET = withAuth(async (req, user) => {
 *   // user is guaranteed to be non-null here
 *   return NextResponse.json({ hello: user.fullName });
 * });
 * ```
 *
 * @param handler - Async function receiving (request, user)
 * @returns A Next.js route handler
 */
export function withAuth(
  handler: (req: Request, user: AuthUser) => Promise<Response>
) {
  return async (req: Request) => {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return handler(req, user);
  };
}
