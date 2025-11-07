"use client";

import { useEffect, useState, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle, Database, DollarSign, Activity, AlertTriangle, FileText, Settings, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import { useFilterState } from "@/hooks/use-filter-state";
import { FilterButtonGroup } from "@/components/filter-button-group";
import { FilterPresets } from "@/components/filter-presets";
import { TestTypeFilter } from "@/components/test-type-filter";

function HomeContent() {
  const { strictPolicyValidation, setStrictPolicyValidation } = useSettings();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState<TestRunData | null>(null);
  const [selectedTab, setSelectedTab] = useState<"results" | "cost" | "performance" | "failures">("results");

  // Use the new URL-synced filter state
  const {
    categories: selectedCategories,
    testTypes: selectedTestTypes,
    status: statusFilter,
    setCategories,
    setTestTypes,
    setStatus,
    applyPreset,
    clearFilters,
    activePreset,
  } = useFilterState();

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

  // Filter inferences by categories and test types (multi-select)
  const filteredInferences = testData?.inferences.filter((inference) => {
    // Category filter - if categories are selected, inference must match one of them
    if (selectedCategories.length > 0) {
      if (!inference.category || !selectedCategories.includes(inference.category as TestCategory)) {
        return false;
      }
    }

    // Test type filter - if test types are selected, inference must match one of them
    if (selectedTestTypes.length > 0) {
      const inferenceTestType = inference.test_type || 'baseline';
      // Normalize test types (handle both dash and underscore variants)
      const normalizedSelectedTypes = selectedTestTypes.map(t => t.replace(/_/g, '-'));
      const normalizedInferenceType = inferenceTestType.replace(/_/g, '-');

      if (!normalizedSelectedTypes.includes(normalizedInferenceType)) {
        return false;
      }
    }

    return true;
  }) || [];

  // Calculate affected test count for Strict Mode tooltip
  // Note: This is a placeholder - actual implementation would depend on
  // having policy validation warning data in the InferenceEvent type
  const affectedTestCount = 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Skip Navigation Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <div className="container mx-auto py-2 sm:py-3 px-3 sm:px-4 space-y-2">
        {/* Integrated Header with Filters */}
        <header>
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
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight"
                >
                  AI Safety and Security Testing
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className="text-xs sm:text-sm px-2 h-5 sm:h-6 border-[color:var(--status-info)] text-foreground bg-[color:var(--status-info-bg)]"
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
            <TooltipProvider>
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
                    aria-describedby="strict-mode-description"
                  />
                  <Label
                    htmlFor="strict-policy-inline"
                    className="text-xs sm:text-sm cursor-pointer whitespace-nowrap"
                  >
                    Strict Mode
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="inline-flex items-center justify-center rounded-full hover:bg-muted p-1 transition-colors"
                        aria-label="Learn about Strict Mode"
                        type="button"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div id="strict-mode-description" className="space-y-2">
                        <p className="text-sm font-semibold">Strict Mode</p>
                        <p className="text-xs text-muted-foreground">
                          Applies stricter validation rules for policy compliance. Tests that pass with warnings in normal mode will fail in strict mode.
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Badge
                  variant={strictPolicyValidation ? "default" : "secondary"}
                  className="text-xs px-2 h-6"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {strictPolicyValidation ? "ON" : "OFF"}
                </Badge>
              </div>
            </TooltipProvider>

              </div>
            </div>
          </CardContent>
        </Card>
        </header>

        {/* New Filter System - Presets and Advanced Filters */}
        {!loading && testData && (
          <nav aria-label="Test filters">
            <Card className="py-2">
              <CardContent className="px-3 py-2">
              <div className="space-y-3">
                {/* Filter Presets Row */}
                <FilterPresets
                  activePresetId={activePreset?.id}
                  onPresetSelect={applyPreset}
                />

                {/* Advanced Filters Row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Filters:
                  </span>
                  <FilterButtonGroup
                    selectedCategories={selectedCategories}
                    onCategoriesChange={setCategories}
                  />
                  <TestTypeFilter
                    selectedTestTypes={selectedTestTypes}
                    onTestTypesChange={setTestTypes}
                  />
                  {(selectedCategories.length > 0 || selectedTestTypes.length > 0) && (
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-destructive/10 hover:border-destructive"
                      onClick={clearFilters}
                    >
                      Clear All
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          </nav>
        )}

        {/* Filter status indicator */}
        {!loading && testData && (
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="flex items-center justify-between text-sm text-muted-foreground px-2"
          >
            <span>
              Showing {filteredInferences.length} of {testData.inferences.length} tests
              {selectedCategories.length > 0 && ` • Filtered by ${selectedCategories.length} ${selectedCategories.length === 1 ? 'category' : 'categories'}`}
              {selectedTestTypes.length > 0 && ` • ${selectedTestTypes.length} ${selectedTestTypes.length === 1 ? 'test type' : 'test types'}`}
            </span>
          </div>
        )}

        <main id="main-content" tabIndex={-1}>
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

            {/* Main Dashboard Tabs - Proper ARIA Tab Pattern */}
            <div
              role="tablist"
              aria-label="Dashboard views"
              className="flex items-center gap-2 flex-wrap justify-start"
            >
              <button
                role="tab"
                id="tab-results"
                aria-selected={selectedTab === "results"}
                aria-controls="panel-results"
                tabIndex={selectedTab === "results" ? 0 : -1}
                onClick={() => setSelectedTab("results")}
                className={`h-10 text-base px-4 cursor-pointer transition-all duration-200 rounded-full border flex items-center gap-1.5
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                  active:scale-[0.97]
                  ${selectedTab === "results"
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background border-border hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20'
                  }`}
              >
                <FileText className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">Test Results</span>
                <span className="sm:hidden">Results</span>
              </button>

              <button
                role="tab"
                id="tab-cost"
                aria-selected={selectedTab === "cost"}
                aria-controls="panel-cost"
                tabIndex={selectedTab === "cost" ? 0 : -1}
                onClick={() => setSelectedTab("cost")}
                className={`h-10 text-base px-4 cursor-pointer transition-all duration-200 rounded-full border flex items-center gap-1.5
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                  active:scale-[0.97]
                  ${selectedTab === "cost"
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background border-border hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20'
                  }`}
              >
                <DollarSign className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">Cost Analysis</span>
                <span className="sm:hidden">Cost</span>
              </button>

              <button
                role="tab"
                id="tab-performance"
                aria-selected={selectedTab === "performance"}
                aria-controls="panel-performance"
                tabIndex={selectedTab === "performance" ? 0 : -1}
                onClick={() => setSelectedTab("performance")}
                className={`h-10 text-base px-4 cursor-pointer transition-all duration-200 rounded-full border flex items-center gap-1.5
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                  active:scale-[0.97]
                  ${selectedTab === "performance"
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background border-border hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20'
                  }`}
              >
                <Activity className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">Performance</span>
                <span className="sm:hidden">Perf</span>
              </button>

              <button
                role="tab"
                id="tab-failures"
                aria-selected={selectedTab === "failures"}
                aria-controls="panel-failures"
                tabIndex={selectedTab === "failures" ? 0 : -1}
                onClick={() => setSelectedTab("failures")}
                className={`h-10 text-base px-4 cursor-pointer transition-all duration-200 rounded-full border flex items-center gap-1.5
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                  active:scale-[0.97]
                  ${selectedTab === "failures"
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background border-border hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20'
                  }`}
              >
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">Failure Analysis</span>
                <span className="sm:hidden">Failures</span>
              </button>
            </div>

            {/* Content based on selected tab */}
            <div className="mt-6">
              <div
                role="tabpanel"
                id="panel-results"
                aria-labelledby="tab-results"
                hidden={selectedTab !== "results"}
              >
                {selectedTab === "results" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Test Results</CardTitle>
                      <CardDescription>
                        Detailed results for each test case
                        {selectedCategories.length > 0 && ` - ${selectedCategories.length} categories filtered`}
                        {selectedTestTypes.length > 0 && ` - ${selectedTestTypes.length} test types filtered`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResultsTable inferences={filteredInferences} externalStatusFilter={statusFilter} strictPolicyValidation={strictPolicyValidation} />
                    </CardContent>
                  </Card>
                )}
              </div>

              <div
                role="tabpanel"
                id="panel-cost"
                aria-labelledby="tab-cost"
                hidden={selectedTab !== "cost"}
              >
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
              </div>

              <div
                role="tabpanel"
                id="panel-performance"
                aria-labelledby="tab-performance"
                hidden={selectedTab !== "performance"}
              >
                {selectedTab === "performance" && (
                  <PerformanceDashboard
                    inferences={filteredInferences}
                    defaultSLAThreshold={1000}
                    onTestClick={(testNumber) => {
                      console.log("View test:", testNumber);
                    }}
                  />
                )}
              </div>

              <div
                role="tabpanel"
                id="panel-failures"
                aria-labelledby="tab-failures"
                hidden={selectedTab !== "failures"}
              >
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
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
            <p className="text-sm text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
