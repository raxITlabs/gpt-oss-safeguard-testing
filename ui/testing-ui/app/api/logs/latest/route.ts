import { NextResponse } from "next/server";
import { getLatestLogPerCategory, loadLogFile, mergeTestRunData } from "@/lib/log-parser";
import type { TestRunData } from "@/types/test-results";

export async function GET() {
  try {
    // Get the latest log file for each category
    const latestPerCategory = await getLatestLogPerCategory();

    if (latestPerCategory.size === 0) {
      return NextResponse.json(
        { error: "No log files found" },
        { status: 404 }
      );
    }

    // Load and parse each latest log file
    const allData: TestRunData[] = [];
    for (const [category, logFile] of latestPerCategory) {
      const data = await loadLogFile(logFile.filename);
      if (data) {
        allData.push(data);
      }
    }

    if (allData.length === 0) {
      return NextResponse.json(
        { error: "Failed to parse log files" },
        { status: 500 }
      );
    }

    // Merge all data into a single response
    const mergedData = mergeTestRunData(allData);

    return NextResponse.json(mergedData);
  } catch (error) {
    console.error("Error fetching latest results:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest results" },
      { status: 500 }
    );
  }
}
