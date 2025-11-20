"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getTestData } from "@/actions/get-test-data"
import { InferenceEvent, TestType } from "@/types/test-results"
import { ALL_CATEGORIES, ALL_TEST_TYPES } from "@/lib/constants"
import { useBreadcrumbs } from "@/contexts/breadcrumb-context"
import { useSettings } from "@/contexts/settings-context"
import { analyzeFailure } from "@/lib/failure-analyzer"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MetricCard } from "@/components/metric-card-enhanced"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { CollapsibleSection } from "@/components/ui/collapsible-section"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, AlertCircle } from "lucide-react"

interface MethodPageProps {
  params: Promise<{
    testType: string
  }>
}

export default function MethodPage({ params }: MethodPageProps) {
  const { setBreadcrumbs } = useBreadcrumbs()
  const { strictPolicyValidation } = useSettings()
  const [testType, setTestType] = useState<string>("")
  const [tests, setTests] = useState<InferenceEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setTestType(p.testType))
  }, [params])

  const formatTestType = (type: string) => {
    return type
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Set breadcrumbs when test type is available
  useEffect(() => {
    if (testType) {
      setBreadcrumbs([
        { label: "Dashboard", href: "/" },
        { label: "Results", href: "/results" },
        { label: formatTestType(testType) },
      ])
    }
  }, [testType, setBreadcrumbs])

  useEffect(() => {
    if (!testType) return

    async function fetchTests() {
      try {
        setLoading(true)
        setError(null)

        const data = await getTestData()

        // Normalize test type (handle both underscore and hyphen versions)
        const normalizedType = testType.replace(/-/g, "_")

        // Filter tests by test type
        const typeTests = data.inferences.filter(
          t => t.test_type === testType || t.test_type === normalizedType
        )

        if (typeTests.length === 0) {
          setError(`No tests found for test type "${testType}"`)
          return
        }

        setTests(typeTests)
      } catch (err) {
        console.error("Error fetching tests:", err)
        setError("Failed to load test method data")
      } finally {
        setLoading(false)
      }
    }

    fetchTests()
  }, [testType])

  const getTestTypeDescription = (type: string) => {
    const normalized = type.replace(/-/g, "_")
    const descriptions = {
      baseline: "Standard test cases that form the foundation of testing",
      edge_case: "Boundary and unusual scenarios that test edge conditions",
      stress: "High-load and extreme scenarios that test system limits",
    }
    return descriptions[normalized as TestType] || "Test method analysis"
  }

  if (loading) {
    return (
      <main className="flex-1 px-4 py-6 space-y-6 lg:px-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </main>
    )
  }

  if (error || tests.length === 0) {
    return (
      <main className="flex-1 px-4 py-6 space-y-6 lg:px-6">
        <PageHeader
          title="Test Method"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "No tests found for this test method."}
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline">
          <Link href="/results">
            <ArrowLeft className="size-4 mr-2" />
            Back to Results
          </Link>
        </Button>
      </main>
    )
  }

  const totalTests = tests.length
  const passedTests = tests.filter(t => analyzeFailure(t, strictPolicyValidation) === null).length
  const failedTests = totalTests - passedTests
  const passRate = (passedTests / totalTests) * 100

  const avgLatency = tests.reduce((acc, t) => acc + (t.latency_ms ?? t.metrics?.latency_ms ?? 0), 0) / tests.length
  const totalCost = tests.reduce((acc, t) => acc + (t.cost_usd ?? t.metrics?.cost_usd ?? 0), 0)

  // Group by category - filter out invalid categories (e.g., test types mistakenly set as categories)
  const testsByCategory = tests.reduce((acc, test) => {
    const cat = test.category || "uncategorized"

    // Skip if the category value is actually a test type (invalid data)
    const isValidCategory = ALL_CATEGORIES.includes(cat as any) || cat === "uncategorized"
    const isTestTypeMisusedAsCategory = ALL_TEST_TYPES.some(testType =>
      testType.replace(/_/g, '-') === cat.replace(/_/g, '-')
    )

    if (!isValidCategory || isTestTypeMisusedAsCategory) {
      console.warn(`Skipping invalid category "${cat}" for test ${test.test_name || 'unknown'}`)
      return acc
    }

    if (!acc[cat]) acc[cat] = []
    acc[cat].push(test)
    return acc
  }, {} as Record<string, InferenceEvent[]>)

  // Group by model
  const testsByModel = tests.reduce((acc, test) => {
    const model = test.request.model || test.response.model
    if (!acc[model]) acc[model] = []
    acc[model].push(test)
    return acc
  }, {} as Record<string, InferenceEvent[]>)

  const getStatusColor = () => {
    if (passRate >= 95) return "border-[color:var(--status-success)] bg-[color:var(--status-success-bg)]"
    if (passRate >= 80) return "border-[color:var(--status-warning)] bg-[color:var(--status-warning-bg)]"
    return "border-[color:var(--status-error)] bg-[color:var(--status-error-bg)]"
  }

  return (
    <main className="flex-1 px-4 py-6 space-y-6 lg:px-6">
      <PageHeader
        title={`Test Method: ${formatTestType(testType)}`}
        description={getTestTypeDescription(testType)}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/results">
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Link>
          </Button>
        }
      />

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Pass Rate"
          value={`${passRate.toFixed(1)}%`}
          variant={passRate >= 95 ? "success" : passRate >= 80 ? "warning" : "destructive"}
          className={getStatusColor() + " border-2"}
          footer={{
            primary: `${passedTests} passed`,
            secondary: `${failedTests} failed`
          }}
        />

        <MetricCard
          title="Total Tests"
          value={totalTests.toString()}
          variant="default"
          footer={{
            primary: "Test executions",
            secondary: `${passedTests} passed / ${failedTests} failed`
          }}
        />

        <MetricCard
          title="Avg Latency"
          value={`${avgLatency.toFixed(0)}ms`}
          variant={avgLatency < 1000 ? "success" : avgLatency < 2000 ? "warning" : "default"}
          footer={{
            primary: "Response time",
            secondary: avgLatency < 1000 ? "Within SLA" : "Above target"
          }}
        />

        <MetricCard
          title="Total Cost"
          value={`$${totalCost.toFixed(4)}`}
          variant="default"
          footer={{
            primary: `$${(totalCost / totalTests).toFixed(4)} per test`,
            secondary: "Average cost"
          }}
        />
      </div>

      {/* By Category */}
      <CollapsibleSection
        title="Results by Policy Category"
        description="Test results broken down by policy category"
        defaultOpen={true}
      >
        <div className="space-y-2">
          {Object.entries(testsByCategory)
            .sort(([, a], [, b]) => b.length - a.length)
            .map(([category, categoryTests]) => {
              const catPassed = categoryTests.filter(t => analyzeFailure(t, strictPolicyValidation) === null).length
              const catPassRate = (catPassed / categoryTests.length) * 100
              return (
                <Link
                  key={category}
                  href={`/policy/${category}`}
                  className="flex items-center justify-between gap-4 p-3 rounded border border-border hover:border-primary hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline">
                      {category.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {catPassed}/{categoryTests.length} passed
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={
                          catPassRate >= 95 ? "h-full bg-[color:var(--status-success)]" :
                          catPassRate >= 80 ? "h-full bg-[color:var(--status-warning)]" :
                          "h-full bg-[color:var(--status-error)]"
                        }
                        style={{ width: `${catPassRate}%` }}
                      />
                    </div>
                    <div className="text-sm font-medium text-foreground w-12 text-right">
                      {catPassRate.toFixed(0)}%
                    </div>
                  </div>
                </Link>
              )
            })}
        </div>
      </CollapsibleSection>

      {/* By Model */}
      <CollapsibleSection
        title="Results by Model"
        description="Test results broken down by AI model"
        defaultOpen={false}
      >
        <div className="space-y-2">
          {Object.entries(testsByModel)
            .sort(([, a], [, b]) => b.length - a.length)
            .map(([model, modelTests]) => {
              const modelPassed = modelTests.filter(t => analyzeFailure(t, strictPolicyValidation) === null).length
              const modelPassRate = (modelPassed / modelTests.length) * 100
              return (
                <Link
                  key={model}
                  href={`/model/${encodeURIComponent(model)}`}
                  className="flex items-center justify-between gap-4 p-3 rounded border border-border hover:border-primary hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline">{model}</Badge>
                    <div className="text-sm text-muted-foreground">
                      {modelPassed}/{modelTests.length} passed
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={
                          modelPassRate >= 95 ? "h-full bg-[color:var(--status-success)]" :
                          modelPassRate >= 80 ? "h-full bg-[color:var(--status-warning)]" :
                          "h-full bg-[color:var(--status-error)]"
                        }
                        style={{ width: `${modelPassRate}%` }}
                      />
                    </div>
                    <div className="text-sm font-medium text-foreground w-12 text-right">
                      {modelPassRate.toFixed(0)}%
                    </div>
                  </div>
                </Link>
              )
            })}
        </div>
      </CollapsibleSection>

      {/* View all tests */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">View All Tests</h3>
              <p className="text-sm text-muted-foreground">
                See detailed results in the test results table
              </p>
            </div>
            <Button asChild>
              <Link href={`/results?testType=${testType}`}>
                View Results
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
