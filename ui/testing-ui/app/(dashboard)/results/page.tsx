"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Database } from "lucide-react";
import type { TestRunData, InferenceEvent } from "@/types/test-results";
import { MetricCard } from "@/components/metric-card-enhanced";
import { AttackScenarioSummary } from "@/components/attack-scenario-summary";
import { ResultsTable } from "@/components/results-table";
import { useSettings } from "@/contexts/settings-context";
import { useFilterState } from "@/hooks/use-filter-state";
import { analyzeFailure } from "@/lib/failure-analyzer";
import { getTestData } from "@/actions/get-test-data";
import { PageHeader } from "@/components/ui/page-header";

export default function ResultsPage() {
  const router = useRouter();
  const { strictPolicyValidation } = useSettings();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState<TestRunData | null>(null);

  const {
    categories: selectedCategories,
    testTypes: selectedTestTypes,
  } = useFilterState();

  // Handle row click to navigate to test detail
  const handleRowClick = (inference: InferenceEvent) => {
    const testId = inference.test_id || inference.test_number?.toString() ||
                   testData?.inferences.indexOf(inference).toString();
    if (testId) {
      router.push(`/results/${testId}`);
    }
  };

  // Fetch test data using cached server action
  useEffect(() => {
    async function fetchTestData() {
      setLoading(true);
      setError(null);

      try {
        const data = await getTestData();
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

  // Filter inferences
  const filteredInferences = testData?.inferences.filter((inference) => {
    if (selectedCategories.length > 0) {
      if (!inference.category || !selectedCategories.includes(inference.category as any)) {
        return false;
      }
    }

    if (selectedTestTypes.length > 0) {
      const inferenceTestType = inference.test_type || 'baseline';
      const normalizedSelectedTypes = selectedTestTypes.map(t => t.replace(/_/g, '-'));
      const normalizedInferenceType = inferenceTestType.replace(/_/g, '-');

      if (!normalizedSelectedTypes.includes(normalizedInferenceType)) {
        return false;
      }
    }

    return true;
  }) || [];

  // Calculate contextual metrics for results page
  const totalTests = filteredInferences.length;
  let passedTests = 0;
  let failedTests = 0;

  filteredInferences.forEach(inf => {
    const failureAnalysis = analyzeFailure(inf, strictPolicyValidation);
    if (failureAnalysis === null) {
      passedTests++;
    } else {
      failedTests++;
    }
  });

  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return (
    <main id="main-content" tabIndex={-1} className="flex-1 px-4 py-6 space-y-6 lg:px-6">
      <PageHeader
        title="Test Results"
        description="Detailed test execution results filtered by your criteria"
      />

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Test Data Display */}
      {!loading && testData && (
        <div className="space-y-6">
          {/* Contextual Metrics - Results Specific */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Pass Rate"
              value={`${passRate.toFixed(1)}%`}
              variant={passRate >= 70 ? "success" : passRate >= 50 ? "warning" : "destructive"}
              trend={{
                direction: passRate >= 70 ? "up" : "down",
                value: `${passRate.toFixed(1)}%`,
                label: passRate >= 70 ? "Excellent" : passRate >= 50 ? "Good" : "Needs Attention"
              }}
              footer={{
                primary: passRate >= 70 ? "Strong performance" : "Room for improvement",
                secondary: `${passedTests} of ${totalTests} tests passed`
              }}
            />

            <MetricCard
              title="Failed Tests"
              value={failedTests.toString()}
              variant={failedTests === 0 ? "success" : failedTests <= 3 ? "warning" : "destructive"}
              trend={{
                direction: failedTests === 0 ? "up" : "down",
                value: failedTests.toString(),
                label: failedTests === 0 ? "Perfect" : failedTests <= 3 ? "Minor Issues" : "Critical"
              }}
              footer={{
                primary: failedTests === 0 ? "All tests passing" : "Failures detected",
                secondary: `${((failedTests / totalTests) * 100).toFixed(1)}% failure rate`
              }}
            />

            <MetricCard
              title="Total Tests"
              value={totalTests.toString()}
              variant="default"
              footer={{
                primary: "Test coverage",
                secondary: `${selectedCategories.length > 0 || selectedTestTypes.length > 0 ? 'Filtered view' : 'All tests'}`
              }}
            />
          </div>

          {/* Attack Scenario Summary */}
          {/* <AttackScenarioSummary
            inferences={filteredInferences}
            strictPolicyValidation={strictPolicyValidation}
          /> */}

          {/* Results Table */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Test Execution Details</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Click any row to view detailed test information
              </p>
              <ResultsTable
                inferences={filteredInferences}
                strictPolicyValidation={strictPolicyValidation}
                onRowClick={handleRowClick}
              />
            </CardContent>
          </Card>
        </div>
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
  );
}
