import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true, message: "Consent reset successfully" });
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    // Clear the session
    session.destroy();

    return response;
  } catch (error) {
    console.error("Error resetting consent:", error);
    return NextResponse.json(
      { error: "Failed to reset consent" },
      { status: 500 }
    );
  }
}
