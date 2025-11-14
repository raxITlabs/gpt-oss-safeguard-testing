"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Database } from "lucide-react";
import type { TestRunData } from "@/types/test-results";
import { MetricCard } from "@/components/metric-card-enhanced";
import { AttackScenarioSummary } from "@/components/attack-scenario-summary";
import { FailureAnalysisDashboard } from "@/components/dashboards/failure-analysis-dashboard";
import { useSettings } from "@/contexts/settings-context";
import { useFilterState } from "@/hooks/use-filter-state";
import { analyzeFailure } from "@/lib/failure-analyzer";
import { getTestData } from "@/actions/get-test-data";

export default function FailuresPage() {
  const { strictPolicyValidation } = useSettings();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState<TestRunData | null>(null);

  const {
    categories: selectedCategories,
    testTypes: selectedTestTypes,
  } = useFilterState();

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

  // Calculate failure metrics
  const totalTests = filteredInferences.length;
  let passedTests = 0;
  let failedTests = 0;
  let criticalFailures = 0;

  filteredInferences.forEach(inf => {
    const failureAnalysis = analyzeFailure(inf, strictPolicyValidation);
    if (failureAnalysis === null) {
      passedTests++;
    } else {
      failedTests++;
      // Count high priority failures as critical
      if (failureAnalysis.priority === 'high') {
        criticalFailures++;
      }
    }
  });

  const failureRate = totalTests > 0 ? (failedTests / totalTests) * 100 : 0;

  return (
    <main id="main-content" tabIndex={-1} className="flex-1 px-4 py-6 space-y-6 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Failure Analysis</h1>
        <p className="text-muted-foreground mt-1">
          Investigate root causes and get actionable recommendations
        </p>
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
          {/* Contextual Metrics - Failures Specific */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Failed Tests"
              value={failedTests.toString()}
              variant={failedTests === 0 ? "success" : failedTests <= 3 ? "warning" : "destructive"}
              trend={{
                direction: failedTests === 0 ? "up" : "down",
                value: failedTests.toString(),
                label: failedTests === 0 ? "Perfect" : failedTests <= 3 ? "Minor Issues" : "Attention Required"
              }}
              footer={{
                primary: failedTests === 0 ? "All tests passing" : "Failures detected",
                secondary: `Out of ${totalTests} total tests`
              }}
            />

            <MetricCard
              title="Failure Rate"
              value={`${failureRate.toFixed(1)}%`}
              variant={failureRate === 0 ? "success" : failureRate <= 5 ? "warning" : "destructive"}
              trend={{
                direction: failureRate === 0 ? "up" : "down",
                value: `${failureRate.toFixed(1)}%`,
                label: failureRate === 0 ? "Excellent" : failureRate <= 5 ? "Good" : "Needs Improvement"
              }}
              footer={{
                primary: "Percentage of failed tests",
                secondary: `Target: <5%`
              }}
            />

            <MetricCard
              title="Critical Failures"
              value={criticalFailures.toString()}
              variant={criticalFailures === 0 ? "success" : criticalFailures <= 2 ? "warning" : "destructive"}
              trend={{
                direction: criticalFailures === 0 ? "up" : "down",
                value: criticalFailures.toString(),
                label: criticalFailures === 0 ? "None" : criticalFailures <= 2 ? "Low" : "High"
              }}
              footer={{
                primary: "High priority failures",
                secondary: `${((criticalFailures / Math.max(failedTests, 1)) * 100).toFixed(0)}% of failures`
              }}
            />
          </div>

          {/* Attack Scenario Summary for context */}
          <AttackScenarioSummary
            inferences={filteredInferences}
            strictPolicyValidation={strictPolicyValidation}
          />

          {/* Failure Analysis Dashboard */}
          <FailureAnalysisDashboard
            inferences={filteredInferences}
            strictPolicyValidation={strictPolicyValidation}
          />
        </div>
      )}

      {/* Empty State */}
      {!loading && !testData && !error && (
        <Card>
          <CardContent className="py-12 text-center">
            <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Failure Data Available</h3>
            <p className="text-muted-foreground">
              Run some tests to see failure analysis here.
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
