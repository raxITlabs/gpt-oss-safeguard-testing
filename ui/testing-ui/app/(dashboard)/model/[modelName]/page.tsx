"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getTestData } from "@/actions/get-test-data"
import { InferenceEvent } from "@/types/test-results"
import { useBreadcrumbs } from "@/contexts/breadcrumb-context"
import { useSettings } from "@/contexts/settings-context"
import { analyzeFailure } from "@/lib/failure-analyzer"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { MetricCard } from "@/components/metric-card-enhanced"
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  BarChart3,
  Target,
  TrendingUp,
} from "lucide-react"

interface ModelPageProps {
  params: Promise<{
    modelName: string
  }>
}

export default function ModelPage({ params }: ModelPageProps) {
  const { setBreadcrumbs } = useBreadcrumbs()
  const { strictPolicyValidation } = useSettings()
  const [modelName, setModelName] = useState<string>("")
  const [tests, setTests] = useState<InferenceEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setModelName(decodeURIComponent(p.modelName)))
  }, [params])

  // Set breadcrumbs when model name is available
  useEffect(() => {
    if (modelName) {
      setBreadcrumbs([
        { label: "Dashboard", href: "/" },
        { label: "Results", href: "/results" },
        { label: modelName },
      ])
    }
  }, [modelName, setBreadcrumbs])

  useEffect(() => {
    if (!modelName) return

    async function fetchTests() {
      try {
        setLoading(true)
        setError(null)

        const data = await getTestData()

        // Filter tests by model
        const modelTests = data.inferences.filter(
          t => t.request.model === modelName || t.response.model === modelName
        )

        if (modelTests.length === 0) {
          setError(`No tests found for model "${modelName}"`)
          return
        }

        setTests(modelTests)
      } catch (err) {
        console.error("Error fetching tests:", err)
        setError("Failed to load model data")
      } finally {
        setLoading(false)
      }
    }

    fetchTests()
  }, [modelName])

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
          title="Model Results"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "No tests found for this model."}
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
  const avgCost = totalCost / totalTests

  // Group by category
  const testsByCategory = tests.reduce((acc, test) => {
    const cat = test.category || "uncategorized"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(test)
    return acc
  }, {} as Record<string, InferenceEvent[]>)

  // Group by test type
  const testsByType = tests.reduce((acc, test) => {
    const type = test.test_type || "baseline"
    if (!acc[type]) acc[type] = []
    acc[type].push(test)
    return acc
  }, {} as Record<string, InferenceEvent[]>)

  return (
    <main className="flex-1 px-4 py-6 space-y-6 lg:px-6">
      <PageHeader
        title={`Model: ${modelName}`}
        description="Comprehensive test results and performance analysis for this model"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/results">
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Link>
          </Button>
        }
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Pass Rate"
          value={`${passRate.toFixed(1)}%`}
          icon={<CheckCircle2 className="size-5" />}
          variant={passRate >= 95 ? "success" : passRate >= 80 ? "warning" : "destructive"}
          footer={{
            primary: `${passedTests} passed`,
            secondary: `${failedTests} failed`
          }}
        />

        <MetricCard
          title="Total Tests"
          value={totalTests.toString()}
          icon={<FileText className="size-5" />}
          variant="default"
          footer={{
            primary: "Test executions",
            secondary: `Across ${Object.keys(testsByCategory).length} categories`
          }}
        />

        <MetricCard
          title="Avg Latency"
          value={`${avgLatency.toFixed(0)}ms`}
          icon={<Clock className="size-5" />}
          variant={avgLatency < 1000 ? "success" : avgLatency < 2000 ? "warning" : "default"}
          footer={{
            primary: "Response time",
            secondary: avgLatency < 1000 ? "Within SLA" : "Above target"
          }}
        />

        <MetricCard
          title="Total Cost"
          value={`$${totalCost.toFixed(4)}`}
          icon={<DollarSign className="size-5" />}
          variant="default"
          footer={{
            primary: `$${avgCost.toFixed(4)} per test`,
            secondary: "Average cost"
          }}
        />
      </div>

      {/* Content Tabs */}
      <Card>
        <Tabs defaultValue="overview" className="w-full">
          <CardHeader className="pb-3">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">By Category</span>
              </TabsTrigger>
              <TabsTrigger value="types" className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">By Type</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Details</span>
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0 space-y-4">
              <div>
                <h3 className="text-base font-semibold mb-3">Model Information</h3>
                <div className="bg-muted p-4 rounded-md space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Model Name:</span>
                    <code className="bg-background px-2 py-0.5 rounded">{modelName}</code>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Tests:</span>
                    <span className="font-medium">{totalTests}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pass Rate:</span>
                    <span className="font-medium">{passRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Latency:</span>
                    <span className="font-medium">{avgLatency.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Cost:</span>
                    <span className="font-medium">${totalCost.toFixed(4)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-base font-semibold mb-3">Performance Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
                    <p className={`text-2xl font-bold ${passRate >= 95 ? 'text-[color:var(--status-success)]' : passRate >= 80 ? 'text-[color:var(--status-warning)]' : 'text-[color:var(--status-error)]'}`}>
                      {passRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Avg Cost per Test</p>
                    <p className="text-2xl font-bold text-foreground">${avgCost.toFixed(4)}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Categories Tested</p>
                    <p className="text-2xl font-bold text-foreground">{Object.keys(testsByCategory).length}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Test Types</p>
                    <p className="text-2xl font-bold text-foreground">{Object.keys(testsByType).length}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="mt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold">Results by Policy Category</h3>
                  <InfoTooltip content="Test results broken down by policy category. Click to view detailed category analysis." />
                </div>
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
              </div>
            </TabsContent>

            {/* Types Tab */}
            <TabsContent value="types" className="mt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold">Results by Test Type</h3>
                  <InfoTooltip content="Test results broken down by test type (baseline, edge_case, stress). Click to view detailed method analysis." />
                </div>
                <div className="space-y-2">
                  {Object.entries(testsByType)
                    .sort(([, a], [, b]) => b.length - a.length)
                    .map(([type, typeTests]) => {
                      const typePassed = typeTests.filter(t => analyzeFailure(t, strictPolicyValidation) === null).length
                      const typePassRate = (typePassed / typeTests.length) * 100
                      const urlType = type.replace(/_/g, '-')
                      return (
                        <Link
                          key={type}
                          href={`/method/${urlType}`}
                          className="flex items-center justify-between gap-4 p-3 rounded border border-border hover:border-primary hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Badge variant="outline">
                              {type.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              {typePassed}/{typeTests.length} passed
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={
                                  typePassRate >= 95 ? "h-full bg-[color:var(--status-success)]" :
                                  typePassRate >= 80 ? "h-full bg-[color:var(--status-warning)]" :
                                  "h-full bg-[color:var(--status-error)]"
                                }
                                style={{ width: `${typePassRate}%` }}
                              />
                            </div>
                            <div className="text-sm font-medium text-foreground w-12 text-right">
                              {typePassRate.toFixed(0)}%
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                </div>
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold mb-3">View All Tests</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Access the complete test results table filtered for this model. View detailed execution information, metrics, and failures.
                  </p>
                  <Button asChild size="lg" className="w-full">
                    <Link href={`/results?model=${encodeURIComponent(modelName)}`}>
                      <FileText className="size-4 mr-2" />
                      View Results Table
                    </Link>
                  </Button>
                </div>

                <Separator />

                <div>
                  <h3 className="text-base font-semibold mb-3">Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">First Test</p>
                      <p className="text-sm font-medium">
                        {new Date(tests[tests.length - 1]?.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">Latest Test</p>
                      <p className="text-sm font-medium">
                        {new Date(tests[0]?.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">Total Tokens</p>
                      <p className="text-sm font-medium">
                        {tests.reduce((acc, t) => {
                          const tokens = t.tokens ?? {
                            total: t.usage?.total_tokens ?? 0
                          }
                          return acc + tokens.total
                        }, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">Cost Efficiency</p>
                      <p className="text-sm font-medium">
                        {passedTests > 0 ? `$${(totalCost / passedTests).toFixed(4)}` : 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">per passing test</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </main>
  )
}
