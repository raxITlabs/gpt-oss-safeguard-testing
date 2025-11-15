import { promises as fs } from "fs";
import path from "path";
import type {
  LogEntry,
  TestRunData,
  InferenceEvent,
  SessionStart,
  SessionSummary,
  ErrorEvent,
  LogFileInfo,
  TestCategory
} from "@/types/test-results";
import { analyzeFailure } from "./failure-analyzer";

// Path to logs directory (relative to project root, not UI directory)
// When running Next.js, process.cwd() is the ui/testing-ui directory
// We need to go up two levels to reach the project root, then into logs
const LOGS_DIR = path.join(process.cwd(), "..", "..", "logs");

/**
 * Parse a JSONL file and return all log entries
 */
export async function parseLogFile(filePath: string): Promise<LogEntry[]> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.trim().split("\n").filter(line => line.trim());

    return lines.map(line => {
      try {
        return JSON.parse(line) as LogEntry;
      } catch (e) {
        console.error(`Failed to parse line: ${line}`, e);
        return null;
      }
    }).filter((entry): entry is LogEntry => entry !== null);
  } catch (error) {
    console.error(`Error reading log file ${filePath}:`, error);
    return [];
  }
}

/**
 * Parse and aggregate log entries into structured test run data
 * @param entries - Log entries to aggregate
 * @param strictPolicyValidation - Whether to use strict policy validation for failure detection
 */
export function aggregateLogData(entries: LogEntry[], strictPolicyValidation: boolean = true): TestRunData {
  const data: TestRunData = {
    sessionStart: null,
    sessionSummary: null,
    inferences: [],
    errors: []
  };

  for (const entry of entries) {
    switch (entry.event_type) {
      case "session_start":
        data.sessionStart = entry as SessionStart;
        break;

      case "session_summary":
        data.sessionSummary = entry as SessionSummary;
        break;

      case "session_end":
        // NEW FORMAT: Convert session_end to session_summary for backward compatibility
        const sessionEnd = entry as any;
        data.sessionSummary = {
          event_type: "session_summary",
          timestamp: sessionEnd.timestamp,
          model: data.sessionStart?.model || "",
          results: {
            total_tests: sessionEnd.results.total_tests,
            passed: sessionEnd.results.passed,
            failed: sessionEnd.results.failed,
            accuracy_percent: sessionEnd.results.accuracy
          },
          usage: {
            total_prompt_tokens: sessionEnd.results.tokens?.prompt || 0,
            total_completion_tokens: sessionEnd.results.tokens?.completion || 0,
            total_tokens: sessionEnd.results.tokens?.total || 0
          },
          metrics: {
            total_cost_usd: sessionEnd.results.cost || 0,
            cost_usd: sessionEnd.results.cost || 0,
            average_latency_ms: sessionEnd.results.avg_latency || 0,
            latency_ms: sessionEnd.results.avg_latency || 0,
            total_latency_ms: (sessionEnd.results.avg_latency || 0) * sessionEnd.results.total_tests
          },
          failures: [] // Will be populated below
        };
        break;

      case "inference":
        const inf = entry as InferenceEvent;

        // Normalize inference event to old format
        const normalized: InferenceEvent = {
          ...inf,
          // Ensure usage field exists
          usage: inf.usage || (inf.tokens ? {
            prompt_tokens: inf.tokens.prompt,
            completion_tokens: inf.tokens.completion,
            total_tokens: inf.tokens.total
          } : { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }),

          // Ensure metrics field exists
          metrics: inf.metrics || {
            cost_usd: inf.cost_usd || 0,
            latency_ms: inf.latency_ms || 0
          },

          // Ensure test_result field exists
          test_result: inf.test_result || {
            expected: inf.expected || "",
            actual: inf.model_output || inf.response?.content || "",
            passed: inf.passed !== undefined ? inf.passed : false
          }
        };

        data.inferences.push(normalized);
        break;

      case "error":
        data.errors.push(entry as ErrorEvent);
        break;
    }
  }

  // Compute failures from inferences if session_summary exists but has no failures
  if (data.sessionSummary && data.sessionSummary.failures.length === 0 && data.inferences.length > 0) {
    data.sessionSummary.failures = data.inferences
      .filter(inf => analyzeFailure(inf, strictPolicyValidation) !== null)
      .map(inf => ({
        test_name: inf.test_name,
        expected: inf.test_result?.expected || "",
        actual: inf.test_result?.actual || ""
      }));
  }

  return data;
}

/**
 * Get all log files from the logs directory
 */
export async function getLogFiles(): Promise<LogFileInfo[]> {
  try {
    const files = await fs.readdir(LOGS_DIR);
    const jsonlFiles = files.filter(file => file.endsWith(".jsonl"));

    const logFileInfos: LogFileInfo[] = jsonlFiles.map(filename => {
      const filePath = path.join(LOGS_DIR, filename);

      // Extract category from filename if present
      // Format 1: safeguard_test_{category}_{timestamp}.jsonl
      // Format 2: {attack_type}_{timestamp}.jsonl (for attack vectors)
      let category: string | undefined;

      // Try content test pattern first: safeguard_test_{category}_{timestamp}.jsonl
      const contentTestMatch = filename.match(/^safeguard_(?:test|debug)_([a-z-]+)_\d{8}_\d{6}\.jsonl$/);
      if (contentTestMatch) {
        category = contentTestMatch[1];
      } else {
        // Try attack vector pattern: {attack_type}_{timestamp}.jsonl
        const attackMatch = filename.match(/^([a-z_]+)_\d{8}_\d{6}\.jsonl$/);
        if (attackMatch) {
          category = attackMatch[1]; // e.g., "multi_turn", "prompt_injection"
        }
      }

      // Normalize category name to handle legacy filename formats
      // Strip 'safeguard_test_' prefix and convert underscores to hyphens
      if (category) {
        category = category.replace(/^safeguard_test_/, '').replace(/_/g, '-');
      }

      // Extract timestamp from filename
      // Format: safeguard_test_spam_20251102_002342.jsonl
      const timestampMatch = filename.match(/(\d{8}_\d{6})/);
      let timestamp = new Date();

      if (timestampMatch) {
        const ts = timestampMatch[1];
        const year = ts.substring(0, 4);
        const month = ts.substring(4, 6);
        const day = ts.substring(6, 8);
        const hour = ts.substring(9, 11);
        const minute = ts.substring(11, 13);
        const second = ts.substring(13, 15);
        timestamp = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
      }

      return {
        filename,
        path: filePath,
        timestamp,
        category: category as TestCategory | undefined
      };
    });

    // Sort by timestamp, most recent first
    return logFileInfos.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    console.error("Error reading logs directory:", error);
    return [];
  }
}

/**
 * Get the latest log file
 */
export async function getLatestLogFile(): Promise<LogFileInfo | null> {
  const files = await getLogFiles();
  return files.length > 0 ? files[0] : null;
}

/**
 * Get log files for a specific category
 */
export async function getLogFilesByCategory(category: TestCategory): Promise<LogFileInfo[]> {
  const files = await getLogFiles();
  return files.filter(file => file.category === category);
}

/**
 * Get the latest log file for each category
 * Returns a Map of category -> latest LogFileInfo
 */
export async function getLatestLogPerCategory(): Promise<Map<string, LogFileInfo>> {
  const files = await getLogFiles();
  const latestPerCategory = new Map<string, LogFileInfo>();

  for (const file of files) {
    if (!file.category) continue; // Skip files without a category

    const existing = latestPerCategory.get(file.category);
    if (!existing || file.timestamp > existing.timestamp) {
      latestPerCategory.set(file.category, file);
    }
  }

  return latestPerCategory;
}

/**
 * Merge multiple TestRunData objects into a single combined response
 * Aggregates all metrics, inferences, and creates a combined sessionSummary
 */
export function mergeTestRunData(dataArray: TestRunData[]): TestRunData {
  if (dataArray.length === 0) {
    return {
      sessionStart: null,
      sessionSummary: null,
      inferences: [],
      errors: []
    };
  }

  if (dataArray.length === 1) {
    return dataArray[0];
  }

  // Merge all inferences
  const mergedInferences: InferenceEvent[] = [];
  for (const data of dataArray) {
    mergedInferences.push(...data.inferences);
  }

  // Merge all errors
  const mergedErrors: ErrorEvent[] = [];
  for (const data of dataArray) {
    mergedErrors.push(...data.errors);
  }

  // Use the most recent sessionStart (or create a synthetic one)
  let sessionStart: SessionStart | null = null;
  for (const data of dataArray) {
    if (data.sessionStart) {
      if (!sessionStart || new Date(data.sessionStart.timestamp) > new Date(sessionStart.timestamp)) {
        sessionStart = data.sessionStart;
      }
    }
  }

  // Aggregate sessionSummary from all data
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  let totalTokens = 0;
  let totalCost = 0;
  let totalLatency = 0;

  for (const data of dataArray) {
    if (data.sessionSummary) {
      totalTests += data.sessionSummary.results.total_tests;
      totalPassed += data.sessionSummary.results.passed;
      totalFailed += data.sessionSummary.results.failed;
      totalPromptTokens += data.sessionSummary.usage.total_prompt_tokens;
      totalCompletionTokens += data.sessionSummary.usage.total_completion_tokens;
      totalTokens += data.sessionSummary.usage.total_tokens;
      totalCost += data.sessionSummary.metrics.total_cost_usd || data.sessionSummary.metrics.cost_usd || 0;

      // For latency, multiply average by number of tests to get total
      const avgLatency = data.sessionSummary.metrics.average_latency_ms || data.sessionSummary.metrics.latency_ms || 0;
      totalLatency += avgLatency * data.sessionSummary.results.total_tests;
    }
  }

  // Calculate aggregated metrics
  const accuracy = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;
  const averageLatency = totalTests > 0 ? totalLatency / totalTests : 0;

  // Collect all failures
  const allFailures = dataArray.flatMap(data => data.sessionSummary?.failures || []);

  // Create merged sessionSummary
  const mergedSummary: SessionSummary = {
    event_type: "session_summary",
    timestamp: new Date().toISOString(),
    model: sessionStart?.model || "multiple",
    results: {
      total_tests: totalTests,
      passed: totalPassed,
      failed: totalFailed,
      accuracy_percent: accuracy
    },
    usage: {
      total_prompt_tokens: totalPromptTokens,
      total_completion_tokens: totalCompletionTokens,
      total_tokens: totalTokens
    },
    metrics: {
      total_cost_usd: totalCost,
      cost_usd: totalCost,
      average_latency_ms: averageLatency,
      latency_ms: averageLatency,
      total_latency_ms: totalLatency
    },
    failures: allFailures
  };

  return {
    sessionStart,
    sessionSummary: mergedSummary,
    inferences: mergedInferences,
    errors: mergedErrors
  };
}

/**
 * Load and parse a log file by filename
 */
export async function loadLogFile(filename: string): Promise<TestRunData | null> {
  try {
    const filePath = path.join(LOGS_DIR, filename);
    const entries = await parseLogFile(filePath);
    return aggregateLogData(entries);
  } catch (error) {
    console.error(`Error loading log file ${filename}:`, error);
    return null;
  }
}

/**
 * Load the latest test results
 */
export async function loadLatestResults(): Promise<TestRunData | null> {
  const latest = await getLatestLogFile();
  if (!latest) return null;

  return loadLogFile(latest.filename);
}
