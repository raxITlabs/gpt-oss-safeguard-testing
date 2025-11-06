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
import { useFilterState } from "@/hooks/use-filter-state";
import { FilterButtonGroup } from "@/components/filter-button-group";
import { FilterPresets } from "@/components/filter-presets";
import { TestTypeFilter } from "@/components/test-type-filter";

export default function Home() {
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

              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Filter System - Presets and Advanced Filters */}
        {!loading && testData && (
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
        )}

        {/* Filter status indicator */}
        {!loading && testData && (
          <div className="flex items-center justify-between text-sm text-muted-foreground px-2">
            <span>
              Showing {filteredInferences.length} of {testData.inferences.length} tests
              {selectedCategories.length > 0 && ` • ${selectedCategories.length} categories`}
              {selectedTestTypes.length > 0 && ` • ${selectedTestTypes.length} test types`}
            </span>
          </div>
        )}

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
              className="flex items-center gap-2 flex-wrap justify-start"
              role="navigation"
              aria-label="Main dashboard navigation"
            >
              <Badge
                role="button"
                tabIndex={0}
                variant={selectedTab === "results" ? "default" : "outline"}
                className="h-10 text-base px-4 cursor-pointer transition-all duration-200
                           hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20
                           active:scale-[0.97]
                           focus-visible:outline-none focus-visible:ring-2
                           focus-visible:ring-ring focus-visible:ring-offset-2
                           [&>svg]:h-5 [&>svg]:w-5 gap-1.5"
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
                <FileText className="h-5 w-5" />
                <span className="hidden sm:inline">Test Results</span>
                <span className="sm:hidden">Results</span>
              </Badge>

              <Badge
                role="button"
                tabIndex={0}
                variant={selectedTab === "cost" ? "default" : "outline"}
                className="h-10 text-base px-4 cursor-pointer transition-all duration-200
                           hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20
                           active:scale-[0.97]
                           focus-visible:outline-none focus-visible:ring-2
                           focus-visible:ring-ring focus-visible:ring-offset-2
                           [&>svg]:h-5 [&>svg]:w-5 gap-1.5"
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
                <DollarSign className="h-5 w-5" />
                <span className="hidden sm:inline">Cost Analysis</span>
                <span className="sm:hidden">Cost</span>
              </Badge>

              <Badge
                role="button"
                tabIndex={0}
                variant={selectedTab === "performance" ? "default" : "outline"}
                className="h-10 text-base px-4 cursor-pointer transition-all duration-200
                           hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20
                           active:scale-[0.97]
                           focus-visible:outline-none focus-visible:ring-2
                           focus-visible:ring-ring focus-visible:ring-offset-2
                           [&>svg]:h-5 [&>svg]:w-5 gap-1.5"
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
                <Activity className="h-5 w-5" />
                <span className="hidden sm:inline">Performance</span>
                <span className="sm:hidden">Perf</span>
              </Badge>

              <Badge
                role="button"
                tabIndex={0}
                variant={selectedTab === "failures" ? "default" : "outline"}
                className="h-10 text-base px-4 cursor-pointer transition-all duration-200
                           hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20
                           active:scale-[0.97]
                           focus-visible:outline-none focus-visible:ring-2
                           focus-visible:ring-ring focus-visible:ring-offset-2
                           [&>svg]:h-5 [&>svg]:w-5 gap-1.5"
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
                <AlertTriangle className="h-5 w-5" />
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
                      {selectedCategories.length > 0 && ` - ${selectedCategories.length} categories filtered`}
                      {selectedTestTypes.length > 0 && ` - ${selectedTestTypes.length} test types filtered`}
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
