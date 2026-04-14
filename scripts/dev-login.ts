import { connectToDatabase } from "../database/db";
import { SignJWT } from "jose";

// =========================================================================
// DEV ONLY — never expose as API route
// This script is used exclusively for localized development testing 
// allowing authentication bypass without compromising production environments
// =========================================================================

async function generateDevToken() {
  if (process.env.NODE_ENV !== "development") {
    console.error("❌ ABORT: This script can only be run in development mode.");
    process.exit(1);
  }

  const emailToBypass = process.argv[2];
  
  if (!emailToBypass) {
    console.log("Usage: npx ts-node scripts/dev-login.ts <email-or-phone>");
    process.exit(1);
  }

  try {
    const { db } = await connectToDatabase();
    
    // Find User
    const user = await db.collection("users").findOne({
      $or: [
        { email: emailToBypass },
        { phone: emailToBypass }
      ]
    });

    if (!user) {
      console.error(`❌ User not found with identifier: ${emailToBypass}`);
      process.exit(1);
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing from .env");
      process.exit(1);
    }

    const token = await new SignJWT({
      sub: user._id?.toString(),
      role: user.role,
      clerkId: user.clerkId
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    console.log("\n=================================");
    console.log("✅ DEV LOGIN SUCCESS");
    console.log("=================================");
    console.log(`User: ${user.firstName} ${user.lastName}`);
    console.log(`Role: ${user.role}`);
    console.log(`\nLocal Auth Token:\n${token}\n`);
    console.log("Insert this token into your local browser's cookies Application tab under 'auth_token'");

    process.exit(0);

  } catch (error) {
    console.error("Error generating dev token:", error);
    process.exit(1);
  }
}

generateDevToken();
