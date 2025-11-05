"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Database, DollarSign, Activity, AlertTriangle, FileText } from "lucide-react";
import type { TestRunData, LogFileInfo, TestCategory } from "@/types/test-results";
import { ResultsTable } from "@/components/results-table";
import { LogSelector } from "@/components/log-selector";
import { SettingsPanel } from "@/components/settings-panel";
import { CompactMetricsBar } from "@/components/compact-metrics-bar";
import { FailureAlert } from "@/components/failure-alert";
import { CostAnalysisDashboard } from "@/components/dashboards/cost-analysis-dashboard";
import { PerformanceDashboard } from "@/components/dashboards/performance-dashboard";
import { FailureAnalysisDashboard } from "@/components/dashboards/failure-analysis-dashboard";
import { AttackScenarioSummary } from "@/components/attack-scenario-summary";
import { useSettings } from "@/contexts/settings-context";

// Special value for merged mode
const MERGED_MODE = "__MERGED_LATEST__";

export default function Home() {
  const { strictPolicyValidation } = useSettings();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState<TestRunData | null>(null);
  const [logFiles, setLogFiles] = useState<LogFileInfo[]>([]);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TestCategory | "all">("all");
  const [selectedTestType, setSelectedTestType] = useState<string | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "passed" | "failed">("all");

  // Fetch log files list on mount
  useEffect(() => {
    async function fetchLogFiles() {
      try {
        const response = await fetch("/api/logs");
        if (!response.ok) throw new Error("Failed to fetch log files");
        const files: LogFileInfo[] = await response.json();

        // Convert timestamp strings back to Date objects
        const filesWithDates = files.map(file => ({
          ...file,
          timestamp: new Date(file.timestamp)
        }));

        setLogFiles(filesWithDates);

        // Auto-select merged mode by default if available
        if (filesWithDates.length > 0 && !selectedLog) {
          setSelectedLog(MERGED_MODE);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load log files");
      }
    }

    fetchLogFiles();
  }, []);

  // Fetch test data when log file is selected
  useEffect(() => {
    if (!selectedLog) return;

    async function fetchTestData() {
      setLoading(true);
      setError(null);

      try {
        // Use merged endpoint for merged mode, otherwise use single file endpoint
        const endpoint = selectedLog === MERGED_MODE
          ? '/api/logs/latest'
          : `/api/logs/${selectedLog}`;

        const response = await fetch(endpoint);
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
  }, [selectedLog]);

  // Filter inferences by category and test type
  const filteredInferences = testData?.inferences.filter((inference) => {
    // Category filter
    if (selectedCategory !== "all") {
      // In merged mode, filter by inference.category
      if (selectedLog === MERGED_MODE) {
        if (inference.category !== selectedCategory) return false;
      } else {
        // In single-file mode, match by log file category
        const currentLogFile = logFiles.find(f => f.filename === selectedLog);
        if (currentLogFile?.category !== selectedCategory) return false;
      }
    }

    // Test type filter
    if (selectedTestType !== "all") {
      const inferenceTestType = inference.test_type || 'baseline';
      if (inferenceTestType !== selectedTestType) return false;
    }

    return true;
  }) || [];

  const handleLogChange = (filename: string) => {
    setSelectedLog(filename);
    setSelectedCategory("all"); // Reset category filter when changing logs
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 space-y-3 sm:space-y-4">
        {/* Compact Header */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                Safeguard Testing Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor test results for content moderation policies
              </p>
            </div>
          </div>

          {/* Inline Log Selector */}
          <div className="bg-muted/30 p-3 rounded-lg border">
            <LogSelector
              logFiles={logFiles}
              selectedFile={selectedLog}
              onFileChange={handleLogChange}
              mergedMode={MERGED_MODE}
            />
            {selectedLog === MERGED_MODE && (
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  <span className="mr-1">📊</span>
                  Viewing merged data from all categories
                </Badge>
              </div>
            )}
          </div>

          {/* Settings Panel */}
          <SettingsPanel />
        </div>

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
            {/* Compact Metrics Bar */}
            <CompactMetricsBar
              summary={testData.sessionSummary}
              inferences={filteredInferences}
              strictPolicyValidation={strictPolicyValidation}
            />

            {/* Test Type Filter */}
            {selectedLog === MERGED_MODE && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Filter by Test Type</h3>
                      <p className="text-xs text-muted-foreground">
                        View baseline tests or specific attack scenarios
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge
                        variant={selectedTestType === "all" ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/90"
                        onClick={() => setSelectedTestType("all")}
                      >
                        All ({testData.inferences.length})
                      </Badge>
                      <Badge
                        variant={selectedTestType === "baseline" ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/90"
                        onClick={() => setSelectedTestType("baseline")}
                      >
                        Baseline ({testData.inferences.filter(i => !i.test_type || i.test_type === 'baseline').length})
                      </Badge>
                      {['multi-turn', 'multi_turn', 'prompt-injection', 'prompt_injection', 'over-refusal', 'over_refusal']
                        .filter((type, index, self) => {
                          // Normalize and dedupe (multi-turn and multi_turn are same)
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

                          return (
                            <Badge
                              key={normalizedType}
                              variant={selectedTestType === normalizedType ? "default" : "outline"}
                              className="cursor-pointer hover:bg-primary/90"
                              onClick={() => setSelectedTestType(normalizedType)}
                            >
                              {label} ({count})
                            </Badge>
                          );
                        })
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Failure Alert */}
            <FailureAlert inferences={filteredInferences} strictPolicyValidation={strictPolicyValidation} />

            {/* Attack Scenario Summary (only in merged mode) */}
            {selectedLog === MERGED_MODE && (
              <AttackScenarioSummary inferences={testData.inferences} strictPolicyValidation={strictPolicyValidation} />
            )}

            {/* Main Dashboard Tabs */}
            <Tabs defaultValue="results" className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                <TabsTrigger value="results" className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Test Results</span>
                  <span className="sm:hidden">Results</span>
                </TabsTrigger>
                <TabsTrigger value="cost" className="gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">Cost Analysis</span>
                  <span className="sm:hidden">Cost</span>
                </TabsTrigger>
                <TabsTrigger value="performance" className="gap-2">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Performance</span>
                  <span className="sm:hidden">Perf</span>
                </TabsTrigger>
                <TabsTrigger value="failures" className="gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="hidden sm:inline">Failure Analysis</span>
                  <span className="sm:hidden">Failures</span>
                </TabsTrigger>
              </TabsList>

              {/* Test Results Tab */}
              <TabsContent value="results" className="mt-6">
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
              </TabsContent>

              {/* Cost Analysis Tab */}
              <TabsContent value="cost" className="mt-6">
                <CostAnalysisDashboard
                  inferences={filteredInferences}
                  onTestClick={(testNumber) => {
                    // Could implement test detail dialog here
                    console.log("View test:", testNumber);
                  }}
                />
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="mt-6">
                <PerformanceDashboard
                  inferences={filteredInferences}
                  defaultSLAThreshold={1000}
                  onTestClick={(testNumber) => {
                    console.log("View test:", testNumber);
                  }}
                />
              </TabsContent>

              {/* Failure Analysis Tab */}
              <TabsContent value="failures" className="mt-6">
                <FailureAnalysisDashboard
                  inferences={filteredInferences}
                  strictPolicyValidation={strictPolicyValidation}
                  onTestClick={(testNumber) => {
                    console.log("View test:", testNumber);
                  }}
                />
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* No Data State */}
        {!loading && !testData && !error && selectedLog && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No test data found for the selected log file.
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!loading && logFiles.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Test Runs Found</h3>
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
