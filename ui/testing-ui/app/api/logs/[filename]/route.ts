import { NextResponse } from "next/server";
import { loadLogFile } from "@/lib/log-parser";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Security: prevent directory traversal
    if (filename.includes("..") || filename.includes("/") || !filename.endsWith(".jsonl")) {
      return NextResponse.json(
        { error: "Invalid filename" },
        { status: 400 }
      );
    }

    const data = await loadLogFile(filename);

    if (!data) {
      return NextResponse.json(
        { error: "Log file not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching log file:", error);
    return NextResponse.json(
      { error: "Failed to fetch log file" },
      { status: 500 }
    );
  }
}
