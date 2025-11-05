import { NextResponse } from "next/server";
import { getLogFiles } from "@/lib/log-parser";

export async function GET() {
  try {
    const logFiles = await getLogFiles();
    return NextResponse.json(logFiles);
  } catch (error) {
    console.error("Error fetching log files:", error);
    return NextResponse.json(
      { error: "Failed to fetch log files" },
      { status: 500 }
    );
  }
}
