import { NextResponse } from "next/server";
import { ablyRest } from "@/lib/ably";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const tokenRequest = await ablyRest.auth.createTokenRequest({
      clientId: user.dbId,
    });

    return NextResponse.json(tokenRequest);
  } catch (error) {
    console.error("Ably token error:", error);
    return NextResponse.json({ message: "Failed to create token" }, { status: 500 });
  }
}
