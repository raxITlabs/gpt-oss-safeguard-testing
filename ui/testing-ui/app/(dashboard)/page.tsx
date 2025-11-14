"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Database } from "lucide-react";
import type { TestRunData } from "@/types/test-results";
import { CompactMetricsBar } from "@/components/compact-metrics-bar";
import { AttackScenarioSummary } from "@/components/attack-scenario-summary";
import { useSettings } from "@/contexts/settings-context";
import { useFilterState } from "@/hooks/use-filter-state";
import { analyzeFailure } from "@/lib/failure-analyzer";
import { getTestData } from "@/actions/get-test-data";

export default function DashboardOverviewPage() {
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

  return (
    <main id="main-content" tabIndex={-1} className="flex-1 px-4 py-6 space-y-6 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your AI safety and security testing metrics
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
        </div>
      )}

      {/* Test Data Display */}
      {!loading && testData && testData.sessionSummary && (
        <div className="space-y-6">
          {/* Metrics Cards */}
          <CompactMetricsBar
            summary={testData.sessionSummary}
            inferences={filteredInferences}
            strictPolicyValidation={strictPolicyValidation}
          />

          {/* Attack Scenario Summary */}
          {/* <AttackScenarioSummary
            inferences={testData.inferences}
            strictPolicyValidation={strictPolicyValidation}
          /> */}

          {/* Activity Feed Placeholder */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <p className="text-sm text-muted-foreground">
                Activity feed coming soon - will show recent test runs, alerts, and anomalies
              </p>
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
