import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { verifyToken } from "@clerk/nextjs/server";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * app/api/livekit/route.ts
 * GET handler to issue LiveKit access tokens for rooms.
 * Securely verifies user identity via Custom JWT or Clerk before issuing.
 */

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room");
  const username = req.nextUrl.searchParams.get("username");

  if (!room || !username) {
    return NextResponse.json({ error: 'Missing "room" or "username"' }, { status: 400 });
  }

  // --- AUTHENTICATION CHECK ---
  let authenticatedUserId: string | null = null;
  
  // 1. Check for Bearer token in Authorization header
  const authHeader = req.headers.get("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  
  // 2. Check for custom 'auth-token' cookie
  const cookieToken = req.cookies.get("auth-token")?.value;
  
  const effectiveCustomToken = bearerToken || cookieToken;

  if (effectiveCustomToken && JWT_SECRET) {
    try {
      const { payload } = await jwtVerify(
        effectiveCustomToken, 
        new TextEncoder().encode(JWT_SECRET)
      );
      authenticatedUserId = payload.sub as string;
    } catch (e) {
      console.warn("LiveKit: Custom JWT verification failed");
    }
  }

  // 3. Check for Clerk session if not authenticated by custom JWT
  if (!authenticatedUserId) {
    const clerkSessionToken = req.cookies.get("__session")?.value;
    const clerkSecret = process.env.CLERK_SECRET_KEY;
    if (clerkSessionToken && clerkSecret) {
      try {
        const payload = await verifyToken(clerkSessionToken, { secretKey: clerkSecret });
        authenticatedUserId = (payload as any)?.sub as string;
      } catch (e) {
        console.warn("LiveKit: Clerk token verification failed");
      }
    }
  }

  // Fallback: If still not authenticated, reject
  if (!authenticatedUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // --- TOKEN GENERATION ---
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Create an access token, using the AUTHENTICATED user ID as the identity
  const at = new AccessToken(apiKey, apiSecret, {
    identity: authenticatedUserId, // Secure identity
    name: username,                // Display name only
  });

  // Grant full permissions for two-way video/audio communication
  at.addGrant({
    roomJoin: true,
    room: room,
    canPublish: true,      
    canSubscribe: true,    
    canPublishData: true   
  });

  return NextResponse.json({ token: await at.toJwt() });
}
