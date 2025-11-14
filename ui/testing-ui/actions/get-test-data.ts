'use server'

import { cacheTag, revalidateTag, updateTag } from 'next/cache'
import { getLatestLogPerCategory, loadLogFile, mergeTestRunData } from "@/lib/log-parser"
import type { TestRunData } from "@/types/test-results"

/**
 * Fetches the latest test data from log files.
 *
 * This function is cached using Next.js 16's "use cache" directive with the following behavior:
 * - **Cache Duration:** 15 minutes (default server-side revalidation period)
 * - **Cache Tag:** 'test-data' (for on-demand revalidation)
 * - **Deduplication:** Multiple calls with same inputs share the same cache entry
 *
 * The cache is automatically shared across:
 * - All dashboard pages (Overview, Results, Performance, Cost, Failures)
 * - Client and server components
 * - Multiple concurrent requests
 *
 * @returns {Promise<TestRunData>} Merged test data from all log categories
 * @throws {Error} If no log files found or parsing fails
 *
 * @example
 * ```typescript
 * // In any dashboard page component
 * const data = await getTestData()
 * // First call: fetches and caches
 * // Subsequent calls within 15 min: returns cached data
 * ```
 */
export async function getTestData() {
  'use cache'
  cacheTag('test-data')

  try {
    // Get the latest log file for each category
    const latestPerCategory = await getLatestLogPerCategory()

    if (latestPerCategory.size === 0) {
      throw new Error("No log files found")
    }

    // Load and parse each latest log file
    const allData: TestRunData[] = []
    for (const [category, logFile] of latestPerCategory) {
      const data = await loadLogFile(logFile.filename)
      if (data) {
        allData.push(data)
      }
    }

    if (allData.length === 0) {
      throw new Error("Failed to parse log files")
    }

    // Merge all data into a single response
    const mergedData = mergeTestRunData(allData)

    return mergedData
  } catch (error) {
    console.error("Error fetching latest results:", error)
    throw error
  }
}

/**
 * Revalidates the cached test data with stale-while-revalidate behavior.
 *
 * **Behavior:**
 * - Marks the cache as stale
 * - Users continue seeing cached data while revalidation happens in the background
 * - New data becomes available on next request after revalidation completes
 *
 * **Use Cases:**
 * - Background data refresh without user interaction
 * - Periodic cache updates via cron jobs or webhooks
 * - Content that can tolerate eventual consistency (e.g., analytics dashboards)
 *
 * **Performance:**
 * - Non-blocking: users don't wait for fresh data
 * - Best for scenarios where immediate updates aren't critical
 *
 * @example
 * ```typescript
 * // In a webhook handler or scheduled job
 * export async function POST() {
 *   await processNewTestResults()
 *   await revalidateTestData() // Refresh cache in background
 *   return Response.json({ success: true })
 * }
 * ```
 */
export async function revalidateTestData() {
  'use server'
  revalidateTag('test-data', 'max')
}

/**
 * Immediately expires and refreshes the cached test data.
 *
 * **Behavior:**
 * - Instantly invalidates the cache
 * - Forces immediate revalidation within the same request
 * - User sees updated data right away (read-your-own-writes)
 *
 * **Use Cases:**
 * - After running new tests (user expects to see their results immediately)
 * - After manual data import/update operations
 * - User-initiated refresh actions
 * - Interactive features requiring instant feedback
 *
 * **Performance:**
 * - Blocking: waits for fresh data before responding
 * - Higher latency than revalidateTag
 * - Best for user-facing actions where consistency is critical
 *
 * **Important:**
 * - Only works in Server Actions (not Route Handlers)
 * - Use revalidateTag() in Route Handlers instead
 *
 * @example
 * ```typescript
 * // In a form submission handler
 * export async function runNewTests(formData: FormData) {
 *   'use server'
 *   await executeTests(formData)
 *   await updateTestDataCache() // User sees new results immediately
 *   redirect('/dashboard/results')
 * }
 * ```
 */
export async function updateTestDataCache() {
  'use server'
  updateTag('test-data')
}
