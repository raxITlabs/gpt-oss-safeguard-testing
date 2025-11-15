"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InferenceEvent, TestCategory } from "@/types/test-results"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { analyzeFailure } from "@/lib/failure-analyzer"
import { ArrowRight, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"

interface PolicyDetailCardProps {
  category: TestCategory
  tests: InferenceEvent[]
  strictPolicyValidation?: boolean
  className?: string
}

export function PolicyDetailCard({ category, tests, strictPolicyValidation = true, className }: PolicyDetailCardProps) {
  const totalTests = tests.length
  const passedTests = tests.filter(t => analyzeFailure(t, strictPolicyValidation) === null).length
  const failedTests = totalTests - passedTests
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0

  const avgLatency = tests.length > 0
    ? tests.reduce((acc, t) => acc + (t.latency_ms ?? t.metrics?.latency_ms ?? 0), 0) / tests.length
    : 0

  const totalCost = tests.reduce((acc, t) => acc + (t.cost_usd ?? t.metrics?.cost_usd ?? 0), 0)

  const formatCategory = (cat: string) => {
    return cat
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getCategoryIcon = () => {
    if (passRate >= 95) return <CheckCircle2 className="size-5 text-[color:var(--status-success)]" />
    if (passRate >= 80) return <AlertTriangle className="size-5 text-[color:var(--status-warning)]" />
    return <XCircle className="size-5 text-[color:var(--status-error)]" />
  }

  const getStatusColor = () => {
    if (passRate >= 95) return "border-[color:var(--status-success)] bg-[color:var(--status-success-bg)]"
    if (passRate >= 80) return "border-[color:var(--status-warning)] bg-[color:var(--status-warning-bg)]"
    return "border-[color:var(--status-error)] bg-[color:var(--status-error-bg)]"
  }

  // Group tests by test type
  const testsByType = tests.reduce((acc, test) => {
    const type = test.test_type || "baseline"
    if (!acc[type]) acc[type] = []
    acc[type].push(test)
    return acc
  }, {} as Record<string, InferenceEvent[]>)

  // Get failed test patterns
  const failedTestPatterns = tests
    .filter(t => analyzeFailure(t, strictPolicyValidation) !== null)
    .slice(0, 5)

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <Card className={cn("p-6 border-2", getStatusColor())}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {getCategoryIcon()}
              <h2 className="text-2xl font-bold text-foreground">
                {formatCategory(category)}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Policy category test results and analysis
            </p>
          </div>

          <Badge className={cn("border", getStatusColor())}>
            {passRate.toFixed(1)}% Pass Rate
          </Badge>
        </div>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-xs font-medium text-muted-foreground">Total Tests</div>
            <InfoTooltip content="Total number of tests run for this policy category" />
          </div>
          <div className="text-2xl font-bold text-foreground">{totalTests}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-xs font-medium text-muted-foreground">Passed</div>
            <InfoTooltip content="Number of tests that passed" />
          </div>
          <div className="text-2xl font-bold text-[color:var(--status-success)]">
            {passedTests}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-xs font-medium text-muted-foreground">Failed</div>
            <InfoTooltip content="Number of tests that failed" />
          </div>
          <div className="text-2xl font-bold text-[color:var(--status-error)]">
            {failedTests}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-xs font-medium text-muted-foreground">Avg Latency</div>
            <InfoTooltip content="Average response latency for this category" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {avgLatency.toFixed(0)}ms
          </div>
        </Card>
      </div>

      {/* Tests by Type */}
      {Object.keys(testsByType).length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            Tests by Type
            <InfoTooltip content="Breakdown of test results by test type (baseline, edge_case, stress)" />
          </h3>
          <div className="space-y-2">
            {Object.entries(testsByType).map(([type, typeTests]) => {
              const typePassed = typeTests.filter(t => analyzeFailure(t, strictPolicyValidation) === null).length
              const typePassRate = (typePassed / typeTests.length) * 100
              return (
                <div key={type} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="shrink-0">
                      {type}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {typePassed}/{typeTests.length} passed
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all",
                          typePassRate >= 95 ? "bg-[color:var(--status-success)]" :
                          typePassRate >= 80 ? "bg-[color:var(--status-warning)]" :
                          "bg-[color:var(--status-error)]"
                        )}
                        style={{ width: `${typePassRate}%` }}
                      />
                    </div>
                    <div className="text-sm font-medium text-foreground w-12 text-right">
                      {typePassRate.toFixed(0)}%
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Failed Test Patterns */}
      {failedTestPatterns.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            Recent Failed Tests
            <InfoTooltip content="Sample of failed tests for this policy category" />
          </h3>
          <div className="space-y-2">
            {failedTestPatterns.map((test, idx) => (
              <Link
                key={idx}
                href={`/results/${test.test_id || test.test_number || idx}`}
                className="block p-3 rounded border border-border hover:border-primary hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground mb-1">
                      {test.test_name || `Test #${test.test_number}`}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      Expected: {test.test_result?.expected || test.expected || "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      Actual: {test.test_result?.actual || test.model_output || "N/A"}
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
          {failedTests > 5 && (
            <Button
              asChild
              variant="outline"
              className="w-full mt-3"
            >
              <Link href={`/results?category=${category}&status=failed`}>
                View All {failedTests} Failed Tests
              </Link>
            </Button>
          )}
        </Card>
      )}

      {/* Cost Analysis */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          Cost Analysis
          <InfoTooltip content="Total cost and efficiency metrics for this category" />
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Total Cost</div>
            <div className="text-lg font-semibold text-foreground">
              ${totalCost.toFixed(4)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Cost per Test</div>
            <div className="text-lg font-semibold text-foreground">
              ${(totalCost / totalTests).toFixed(4)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Cost per Passed Test</div>
            <div className="text-lg font-semibold text-foreground">
              ${passedTests > 0 ? (totalCost / passedTests).toFixed(4) : "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Efficiency</div>
            <div className="text-lg font-semibold text-foreground">
              {passedTests > 0 ? ((passedTests / totalCost) * 100).toFixed(0) : "0"} tests/$
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
