"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle, Database, DollarSign, Activity, AlertTriangle, FileText, Settings } from "lucide-react";
import type { TestRunData, TestCategory } from "@/types/test-results";
import { ResultsTable } from "@/components/results-table";
import { CompactMetricsBar } from "@/components/compact-metrics-bar";
import { FailureAlert } from "@/components/failure-alert";
import { CostAnalysisDashboard } from "@/components/dashboards/cost-analysis-dashboard";
import { PerformanceDashboard } from "@/components/dashboards/performance-dashboard";
import { FailureAnalysisDashboard } from "@/components/dashboards/failure-analysis-dashboard";
import { AttackScenarioSummary } from "@/components/attack-scenario-summary";
import { useSettings } from "@/contexts/settings-context";
import { BrandLogo } from "@/components/ui/brand-logo";

export default function Home() {
  const { strictPolicyValidation, setStrictPolicyValidation } = useSettings();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState<TestRunData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TestCategory | "all">("all");
  const [selectedTestType, setSelectedTestType] = useState<string | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "passed" | "failed">("all");
  const [selectedTab, setSelectedTab] = useState<"results" | "cost" | "performance" | "failures">("results");

  // Fetch test data (always use merged mode)
  useEffect(() => {
    async function fetchTestData() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/logs/latest');
        if (!response.ok) throw new Error("Failed to fetch test data");

        const data: TestRunData = await response.json();
        setTestData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load test data");
        setTestData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTestData();
  }, []);

  // Filter inferences by category and test type
  const filteredInferences = testData?.inferences.filter((inference) => {
    // Category filter
    if (selectedCategory !== "all") {
      if (inference.category !== selectedCategory) return false;
    }

    // Test type filter
    if (selectedTestType !== "all") {
      const inferenceTestType = inference.test_type || 'baseline';
      if (inferenceTestType !== selectedTestType) return false;
    }

    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-2 sm:py-3 px-3 sm:px-4 space-y-2">
        {/* Integrated Header with Filters */}
        <Card className="py-2 gap-2" role="banner" aria-label="Dashboard header with test filters and settings">
          <CardContent className="px-3 py-2">
            <div className="flex flex-col md:flex-row md:items-start lg:items-center gap-2.5 sm:gap-3">
          {/* Left: Title Section */}
          <div className="flex-shrink-0 md:flex-1" aria-labelledby="dashboard-title">
            <div className="flex items-center gap-3">
              <BrandLogo size="sm" className="sm:hidden" />
              <BrandLogo size="md" className="hidden sm:block md:hidden" />
              <BrandLogo size="lg" className="hidden md:block" />
              <div className="space-y-1.5">
                <h1
                  id="dashboard-title"
                  className="text-xl sm:text-2xl font-bold tracking-tight"
                >
                  AI Safety and Security Testing
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className="text-[10px] sm:text-xs px-2 h-5 sm:h-6 border-[color:var(--status-info)] text-foreground bg-[color:var(--status-info-bg)]"
                  >
                    Model: OpenAI: gpt-oss-safeguard
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Controls Container */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 md:flex-shrink-0">
            {/* Settings Group */}
            <div
              className="flex items-center gap-2 pb-2 sm:pb-0 border-b sm:border-b-0 border-border/40"
              role="group"
              aria-label="Dashboard settings"
            >
              <Settings
                className="h-3.5 w-3.5 text-muted-foreground shrink-0"
                aria-hidden="true"
              />
              <div className="flex items-center gap-2">
                <Switch
                  id="strict-policy-inline"
                  checked={strictPolicyValidation}
                  onCheckedChange={setStrictPolicyValidation}
                  className="scale-75"
                  aria-describedby="strict-mode-status"
                />
                <Label
                  htmlFor="strict-policy-inline"
                  className="text-[10px] sm:text-xs cursor-pointer whitespace-nowrap"
                >
                  Strict Mode
                </Label>
              </div>
              <Badge
                id="strict-mode-status"
                variant={strictPolicyValidation ? "default" : "secondary"}
                className="text-[11px] px-2 h-6"
                aria-live="polite"
              >
                {strictPolicyValidation ? "ON" : "OFF"}
              </Badge>
            </div>

            {/* Visual Divider - Desktop only */}
            <div
              className="hidden md:block h-8 w-px bg-border/60"
              aria-hidden="true"
            />

            {/* Filter Badges Group - Only shown when data is loaded */}
            {!loading && testData && (
              <nav
                className="flex items-center gap-1.5 flex-wrap"
                role="navigation"
                aria-label="Test type filters"
              >
                <Badge
                  role="button"
                  tabIndex={0}
                  variant={selectedTestType === "all" ? "default" : "outline"}
                  className="h-6 text-[11px] px-2 cursor-pointer transition-all duration-200
                             hover:bg-primary/90 active:scale-[0.97]
                             focus-visible:outline-none focus-visible:ring-2
                             focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-pressed={selectedTestType === "all"}
                  aria-label={`Show all tests, ${testData.inferences.length} total`}
                  onClick={() => setSelectedTestType("all")}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedTestType("all");
                    }
                  }}
                >
                  All ({testData.inferences.length})
                </Badge>

                <Badge
                  role="button"
                  tabIndex={0}
                  variant={selectedTestType === "baseline" ? "default" : "outline"}
                  className="h-6 text-[11px] px-2 cursor-pointer transition-all duration-200
                             hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20
                             active:scale-[0.97]
                             focus-visible:outline-none focus-visible:ring-2
                             focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-pressed={selectedTestType === "baseline"}
                  aria-label={`Filter to baseline tests, ${testData.inferences.filter(i => !i.test_type || i.test_type === 'baseline').length} total`}
                  onClick={() => setSelectedTestType("baseline")}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedTestType("baseline");
                    }
                  }}
                >
                  Baseline ({testData.inferences.filter(i => !i.test_type || i.test_type === 'baseline').length})
                </Badge>

                {/* Additional filter badges */}
                {['multi-turn', 'multi_turn', 'prompt-injection', 'prompt_injection', 'over-refusal', 'over_refusal']
                  .filter((type, index, self) => {
                    const normalized = type.replace(/_/g, '-');
                    return self.findIndex(t => t.replace(/_/g, '-') === normalized) === index;
                  })
                  .map(type => {
                    const count = testData.inferences.filter(i =>
                      i.test_type === type || i.test_type === type.replace(/-/g, '_')
                    ).length;
                    if (count === 0) return null;

                    const normalizedType = type.replace(/_/g, '-');
                    const label = normalizedType
                      .split('-')
                      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ');
                    const isActive = selectedTestType === normalizedType;

                    return (
                      <Badge
                        key={normalizedType}
                        role="button"
                        tabIndex={0}
                        variant={isActive ? "default" : "outline"}
                        className={`h-6 text-[11px] px-2 cursor-pointer transition-all duration-200 active:scale-[0.97]
                                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                                   ${isActive
                                     ? "hover:bg-primary/90 shadow-sm"
                                     : "hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20"
                                   }`}
                        aria-pressed={isActive}
                        aria-label={`Filter to ${label} tests, ${count} total`}
                        onClick={() => setSelectedTestType(normalizedType)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedTestType(normalizedType);
                          }
                        }}
                      >
                        {label} ({count})
                      </Badge>
                    );
                  })
                }
              </nav>
            )}
              </div>
            </div>

            {/* Screen Reader Live Region */}
            <div
              className="sr-only"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {!loading && testData && (selectedTestType === "all"
                ? `Showing all ${filteredInferences.length} tests`
                : `Filtered to ${selectedTestType} tests, showing ${filteredInferences.length} results`
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Test Data Display */}
        {!loading && testData && testData.sessionSummary && (
          <>
            {/* Two Cards Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Compact Metrics Bar */}
              <CompactMetricsBar
                summary={testData.sessionSummary}
                inferences={filteredInferences}
                strictPolicyValidation={strictPolicyValidation}
              />

              {/* Attack Scenario Summary */}
              <AttackScenarioSummary inferences={testData.inferences} strictPolicyValidation={strictPolicyValidation} />
            </div>

            {/* Main Dashboard Tabs - Pill Style */}
            <nav
              className="flex items-center gap-2 flex-wrap justify-center"
              role="navigation"
              aria-label="Main dashboard navigation"
            >
              <Badge
                role="button"
                tabIndex={0}
                variant={selectedTab === "results" ? "default" : "outline"}
                className="h-8 text-sm px-3 cursor-pointer transition-all duration-200
                           hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20
                           active:scale-[0.97]
                           focus-visible:outline-none focus-visible:ring-2
                           focus-visible:ring-ring focus-visible:ring-offset-2
                           [&>svg]:h-4 [&>svg]:w-4 gap-1.5"
                aria-pressed={selectedTab === "results"}
                aria-label="View test results"
                onClick={() => setSelectedTab("results")}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedTab("results");
                  }
                }}
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Test Results</span>
                <span className="sm:hidden">Results</span>
              </Badge>

              <Badge
                role="button"
                tabIndex={0}
                variant={selectedTab === "cost" ? "default" : "outline"}
                className="h-8 text-sm px-3 cursor-pointer transition-all duration-200
                           hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20
                           active:scale-[0.97]
                           focus-visible:outline-none focus-visible:ring-2
                           focus-visible:ring-ring focus-visible:ring-offset-2
                           [&>svg]:h-4 [&>svg]:w-4 gap-1.5"
                aria-pressed={selectedTab === "cost"}
                aria-label="View cost analysis"
                onClick={() => setSelectedTab("cost")}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedTab("cost");
                  }
                }}
              >
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Cost Analysis</span>
                <span className="sm:hidden">Cost</span>
              </Badge>

              <Badge
                role="button"
                tabIndex={0}
                variant={selectedTab === "performance" ? "default" : "outline"}
                className="h-8 text-sm px-3 cursor-pointer transition-all duration-200
                           hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20
                           active:scale-[0.97]
                           focus-visible:outline-none focus-visible:ring-2
                           focus-visible:ring-ring focus-visible:ring-offset-2
                           [&>svg]:h-4 [&>svg]:w-4 gap-1.5"
                aria-pressed={selectedTab === "performance"}
                aria-label="View performance analysis"
                onClick={() => setSelectedTab("performance")}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedTab("performance");
                  }
                }}
              >
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Performance</span>
                <span className="sm:hidden">Perf</span>
              </Badge>

              <Badge
                role="button"
                tabIndex={0}
                variant={selectedTab === "failures" ? "default" : "outline"}
                className="h-8 text-sm px-3 cursor-pointer transition-all duration-200
                           hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20
                           active:scale-[0.97]
                           focus-visible:outline-none focus-visible:ring-2
                           focus-visible:ring-ring focus-visible:ring-offset-2
                           [&>svg]:h-4 [&>svg]:w-4 gap-1.5"
                aria-pressed={selectedTab === "failures"}
                aria-label="View failure analysis"
                onClick={() => setSelectedTab("failures")}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedTab("failures");
                  }
                }}
              >
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Failure Analysis</span>
                <span className="sm:hidden">Failures</span>
              </Badge>
            </nav>

            {/* Content based on selected tab */}
            <div className="mt-6">
              {selectedTab === "results" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Test Results</CardTitle>
                    <CardDescription>
                      Detailed results for each test case
                      {selectedCategory !== "all" && ` - ${selectedCategory}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResultsTable inferences={filteredInferences} externalStatusFilter={statusFilter} strictPolicyValidation={strictPolicyValidation} />
                  </CardContent>
                </Card>
              )}

              {selectedTab === "cost" && (
                <CostAnalysisDashboard
                  inferences={filteredInferences}
                  strictPolicyValidation={strictPolicyValidation}
                  onTestClick={(testNumber) => {
                    // Could implement test detail dialog here
                    console.log("View test:", testNumber);
                  }}
                />
              )}

              {selectedTab === "performance" && (
                <PerformanceDashboard
                  inferences={filteredInferences}
                  defaultSLAThreshold={1000}
                  onTestClick={(testNumber) => {
                    console.log("View test:", testNumber);
                  }}
                />
              )}

              {selectedTab === "failures" && (
                <FailureAnalysisDashboard
                  inferences={filteredInferences}
                  strictPolicyValidation={strictPolicyValidation}
                  onTestClick={(testNumber) => {
                    console.log("View test:", testNumber);
                  }}
                />
              )}
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !testData && !error && (
          <Card>
            <CardContent className="py-12 text-center">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Test Data Available</h3>
              <p className="text-muted-foreground">
                Run some tests to see results here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
