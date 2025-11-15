"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getTestData } from "@/actions/get-test-data"
import { InferenceEvent } from "@/types/test-results"
import { useBreadcrumbs } from "@/contexts/breadcrumb-context"
import { useSettings } from "@/contexts/settings-context"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MetricCard } from "@/components/metric-card-enhanced"
import { PolicyViewer } from "@/components/policy-viewer"
import { PolicyHighlighter } from "@/components/policy-highlighter"
import { StatusBadge } from "@/components/status-badge"
import { extractPolicy } from "@/lib/policy-utils"
import { analyzeFailure } from "@/lib/failure-analyzer"
import {
  ArrowLeft,
  AlertCircle,
  Copy,
  Check,
  FileText,
  MessageSquare,
  Bot,
  Brain,
  BarChart3,
  CheckCircle2,
  Zap,
  DollarSign,
  Clock,
} from "lucide-react"

interface TestDetailPageProps {
  params: Promise<{
    testId: string
  }>
}

export default function TestDetailPage({ params }: TestDetailPageProps) {
  const router = useRouter()
  const { setBreadcrumbs } = useBreadcrumbs()
  const { strictPolicyValidation } = useSettings()
  const [testId, setTestId] = useState<string>("")
  const [test, setTest] = useState<InferenceEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    params.then(p => setTestId(p.testId))
  }, [params])

  // Set breadcrumbs when test data is available
  useEffect(() => {
    if (testId) {
      const label = test?.test_name || testId
      setBreadcrumbs([
        { label: "Dashboard", href: "/" },
        { label: "Results", href: "/results" },
        { label },
      ])
    }
  }, [testId, test, setBreadcrumbs])

  useEffect(() => {
    if (!testId) return

    async function fetchTest() {
      try {
        setLoading(true)
        setError(null)

        const data = await getTestData()

        // Try to find the test by test_id, test_number, or array index
        const foundTest = data.inferences.find(
          t =>
            t.test_id === testId ||
            t.test_number?.toString() === testId ||
            t.test_name === testId
        ) || data.inferences[parseInt(testId)]

        if (!foundTest) {
          setError(`Test with ID "${testId}" not found`)
          return
        }

        setTest(foundTest)
      } catch (err) {
        console.error("Error fetching test:", err)
        setError("Failed to load test details")
      } finally {
        setLoading(false)
      }
    }

    fetchTest()
  }, [testId])

  const handleExportPolicy = async () => {
    const policyText = extractPolicy(test)

    if (!policyText) {
      return
    }

    try {
      await navigator.clipboard.writeText(policyText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Error copying to clipboard:", err)
    }
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

  if (error || !test) {
    return (
      <main className="flex-1 px-4 py-6 space-y-6 lg:px-6">
        <PageHeader
          title="Test Not Found"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "The requested test could not be found."}
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

  // Extract test data
  const isPassed = analyzeFailure(test, strictPolicyValidation) === null
  const policyText = extractPolicy(test)
  const userMessage = test.request.messages.find(m => m.role === "user")?.content || "N/A"
  const latency = test.latency_ms ?? test.metrics?.latency_ms
  const cost = test.cost_usd ?? test.metrics?.cost_usd
  const tokens = test.tokens ?? {
    prompt: test.usage?.prompt_tokens ?? 0,
    completion: test.usage?.completion_tokens ?? 0,
    total: test.usage?.total_tokens ?? 0,
  }

  const getQualityColor = (score: number) => {
    if (score >= 81) return "text-[color:var(--status-success)]"
    if (score >= 61) return "text-[color:var(--status-info)]"
    if (score >= 31) return "text-[color:var(--status-warning)]"
    return "text-[color:var(--status-error)]"
  }

  const getQualityLabel = (score: number) => {
    if (score >= 81) return "Excellent"
    if (score >= 61) return "Good"
    if (score >= 31) return "Fair"
    return "Poor"
  }

  return (
    <main className="flex-1 px-4 py-6 space-y-6 lg:px-6">
      <PageHeader
        title={test.test_name || `Test #${test.test_number}` || testId}
        description="Detailed test execution results and analysis"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPolicy}
            >
              {copied ? (
                <>
                  <Check className="size-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="size-4 mr-2" />
                  Export Policy
                </>
              )}
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/results">
                <ArrowLeft className="size-4 mr-2" />
                Back
              </Link>
            </Button>
          </>
        }
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Test Status"
          value={isPassed ? "Passed" : "Failed"}
          icon={<CheckCircle2 className="size-5" />}
          variant={isPassed ? "success" : "destructive"}
          footer={{
            primary: test.category || "N/A",
            secondary: test.test_type || "baseline"
          }}
        />

        <MetricCard
          title="Latency"
          value={latency ? `${latency.toFixed(0)}ms` : "N/A"}
          icon={<Clock className="size-5" />}
          variant={latency && latency < 1000 ? "success" : latency && latency < 2000 ? "warning" : "default"}
          footer={{
            primary: "Response time",
            secondary: latency && latency < 1000 ? "Within SLA" : "Above target"
          }}
        />

        <MetricCard
          title="Cost"
          value={cost ? `$${cost.toFixed(4)}` : "N/A"}
          icon={<DollarSign className="size-5" />}
          variant="default"
          footer={{
            primary: `${tokens.total.toLocaleString()} tokens`,
            secondary: `${tokens.prompt} prompt / ${tokens.completion} completion`
          }}
        />

        {test.reasoning_validation && (
          <MetricCard
            title="Reasoning Quality"
            value={getQualityLabel(test.reasoning_validation.quality_score)}
            icon={<Brain className="size-5" />}
            variant={
              test.reasoning_validation.quality_score >= 81 ? "success" :
              test.reasoning_validation.quality_score >= 61 ? "default" :
              test.reasoning_validation.quality_score >= 31 ? "warning" : "destructive"
            }
            footer={{
              primary: `Score: ${test.reasoning_validation.quality_score}/100`,
              secondary: test.reasoning_validation.has_reasoning ? "Has reasoning" : "No reasoning"
            }}
          />
        )}
      </div>

      {/* Content Tabs */}
      <Card>
        <Tabs defaultValue="policy" className="w-full">
          <CardHeader className="pb-3">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="policy" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Policy</span>
              </TabsTrigger>
              <TabsTrigger value="input" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Input</span>
              </TabsTrigger>
              <TabsTrigger value="output" className="flex items-center gap-1">
                <Bot className="h-4 w-4" />
                <span className="hidden sm:inline">Output</span>
              </TabsTrigger>
              <TabsTrigger value="reasoning" className="flex items-center gap-1">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Reasoning</span>
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Metrics</span>
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            {/* Policy Tab */}
            <TabsContent value="policy" className="mt-0">
              <ScrollArea className="h-[600px]">
                {policyText ? (
                  <PolicyViewer policyText={policyText} />
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    No policy information available
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Input Tab */}
            <TabsContent value="input" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold mb-3">Test Content (User Input)</h3>
                  <div className="bg-muted p-4 rounded-md border-2 border-primary/20">
                    <p className="text-sm whitespace-pre-wrap font-mono">{userMessage}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Expected Classification</p>
                    <Badge variant="outline" className="text-lg p-2">{test.test_result?.expected ?? test.expected ?? "N/A"}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Model Classified As</p>
                    <Badge
                      variant={isPassed ? "default" : "destructive"}
                      className="text-lg p-2"
                    >
                      {test.test_result?.actual ?? test.model_output ?? "N/A"}
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Output Tab */}
            <TabsContent value="output" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold mb-3">Model Classification</h3>
                  <div className="bg-muted p-6 rounded-md text-center">
                    <Badge
                      variant={isPassed ? "default" : "destructive"}
                      className="text-2xl p-4"
                    >
                      {test.response.content}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Expected:</p>
                    <Badge variant="outline" className="text-xl p-3">{test.test_result?.expected ?? test.expected ?? "N/A"}</Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Result:</p>
                    <StatusBadge passed={isPassed} showIcon={true} />
                    {!isPassed && (
                      <p className="text-xs text-[color:var(--status-error)] mt-2">
                        ⚠️ Classification mismatch - review policy and reasoning
                      </p>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Model: <Link href={`/model/${encodeURIComponent(test.request.model)}`} className="text-primary hover:underline">{test.request.model}</Link></p>
                  <p>Finish Reason: <code className="bg-muted px-1 rounded">{test.response.finish_reason}</code></p>
                  <p>Response ID: <code className="bg-muted px-1 rounded text-xs">{test.response.id}</code></p>
                  <p>Timestamp: {new Date(test.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </TabsContent>

            {/* Reasoning Tab */}
            <TabsContent value="reasoning" className="mt-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {test.reasoning || test.test_result?.reasoning ? (
                    <>
                      <div>
                        <h3 className="text-base font-semibold mb-3">Model's Reasoning Process</h3>
                        <div className="bg-muted p-4 rounded-md border-l-4 border-primary">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {test.reasoning || test.test_result?.reasoning}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      {/* Policy Analysis */}
                      <div>
                        <h3 className="text-base font-semibold mb-3">Policy Reference Analysis</h3>
                        <PolicyHighlighter
                          reasoning={test.reasoning || test.test_result?.reasoning || ""}
                          expectedClassification={test.test_result?.expected ?? test.expected ?? ""}
                          reasoning_validation={test.reasoning_validation}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-12">
                      No reasoning information available
                    </div>
                  )}

                  {test.reasoning_validation && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-base font-semibold mb-3">Reasoning Quality Metrics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-xs text-muted-foreground mb-1">Quality Score</p>
                            <p className={`text-2xl font-bold ${getQualityColor(test.reasoning_validation.quality_score)}`}>
                              {test.reasoning_validation.quality_score}
                            </p>
                          </div>
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-xs text-muted-foreground mb-1">Has Reasoning</p>
                            <p className="text-lg font-semibold">
                              {test.reasoning_validation.has_reasoning ? "✓ Yes" : "✗ No"}
                            </p>
                          </div>
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-xs text-muted-foreground mb-1">Length</p>
                            <p className="text-lg font-semibold">
                              {test.reasoning_validation.reasoning_length} chars
                            </p>
                          </div>
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-xs text-muted-foreground mb-1">Mentions Policy</p>
                            <p className="text-lg font-semibold">
                              {test.reasoning_validation.mentions_policy ? "✓ Yes" : "✗ No"}
                            </p>
                          </div>
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-xs text-muted-foreground mb-1">Mentions Severity</p>
                            <p className="text-lg font-semibold">
                              {test.reasoning_validation.mentions_severity ? "✓ Yes" : "✗ No"}
                            </p>
                          </div>
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-xs text-muted-foreground mb-1">Mentions Category</p>
                            <p className="text-lg font-semibold">
                              {test.reasoning_validation.mentions_category ? "✓ Yes" : "✗ No"}
                            </p>
                          </div>
                        </div>

                        {test.reasoning_validation.policy_citation && (
                          <div className="mt-4 space-y-3 p-4 bg-muted rounded-md">
                            <h4 className="text-sm font-semibold">Policy Citations</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-muted-foreground mb-2">Cited Codes</p>
                                <div className="flex flex-wrap gap-1">
                                  {test.reasoning_validation.policy_citation.cited_codes.length > 0 ? (
                                    test.reasoning_validation.policy_citation.cited_codes.map((code, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {code}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-sm text-muted-foreground">None</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-2">Expected Code</p>
                                <Badge variant="secondary">
                                  {test.reasoning_validation.policy_citation.expected_code}
                                </Badge>
                              </div>
                            </div>
                            {test.reasoning_validation.policy_citation.hallucinated_codes.length > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-2">Hallucinated Codes</p>
                                <div className="flex flex-wrap gap-1">
                                  {test.reasoning_validation.policy_citation.hallucinated_codes.map((code, idx) => (
                                    <Badge key={idx} variant="destructive" className="text-xs">
                                      {code}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Metrics Tab */}
            <TabsContent value="metrics" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold mb-3">Performance Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Clock className="size-4" />
                          Latency
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{latency ? `${latency.toFixed(0)}ms` : "N/A"}</p>
                        <p className="text-xs text-muted-foreground mt-1">Response time</p>
                      </CardContent>
                    </Card>

                    <Card className="border-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <DollarSign className="size-4" />
                          Cost
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{cost ? `$${cost.toFixed(4)}` : "N/A"}</p>
                        <p className="text-xs text-muted-foreground mt-1">Total cost</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-base font-semibold mb-3">Token Usage</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-muted p-4 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">Prompt Tokens</p>
                      <p className="text-2xl font-bold">{tokens.prompt.toLocaleString()}</p>
                    </div>
                    <div className="bg-muted p-4 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">Completion Tokens</p>
                      <p className="text-2xl font-bold">{tokens.completion.toLocaleString()}</p>
                    </div>
                    <div className="bg-muted p-4 rounded-md">
                      <p className="text-xs text-muted-foreground mb-1">Total Tokens</p>
                      <p className="text-2xl font-bold">{tokens.total.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-base font-semibold mb-3">Test Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Test ID:</span>
                      <code className="bg-muted px-2 rounded">{test.test_id || test.test_number || testId}</code>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Category:</span>
                      <Link href={`/policy/${test.category}`} className="text-primary hover:underline">
                        {test.category || "N/A"}
                      </Link>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Test Type:</span>
                      <Link href={`/method/${test.test_type || 'baseline'}`} className="text-primary hover:underline">
                        {test.test_type || "baseline"}
                      </Link>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Model:</span>
                      <Link href={`/model/${encodeURIComponent(test.request.model)}`} className="text-primary hover:underline">
                        {test.request.model}
                      </Link>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Timestamp:</span>
                      <span>{new Date(test.timestamp).toLocaleString()}</span>
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
