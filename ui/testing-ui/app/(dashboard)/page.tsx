"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Database, TrendingDown, DollarSign, Gauge, AlertTriangle } from "lucide-react";
import type { TestRunData } from "@/types/test-results";
import { CompactMetricsBar } from "@/components/compact-metrics-bar";
import { AttackScenarioSummary } from "@/components/attack-scenario-summary";
import { DashboardTestContext } from "@/components/dashboard-test-context";
import { AggregatedMetricsCard } from "@/components/aggregated-metrics-card";
import { useSettings } from "@/contexts/settings-context";
import { useFilterState } from "@/hooks/use-filter-state";
import { useBreadcrumbs } from "@/contexts/breadcrumb-context";
import { analyzeFailure } from "@/lib/failure-analyzer";
import { getTestData } from "@/actions/get-test-data";
import { PageHeader } from "@/components/ui/page-header";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Badge } from "@/components/ui/badge";

export default function DashboardOverviewPage() {
  const { strictPolicyValidation } = useSettings();
  const { setBreadcrumbs } = useBreadcrumbs();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState<TestRunData | null>(null);

  const {
    categories: selectedCategories,
    testTypes: selectedTestTypes,
  } = useFilterState();

  // Set breadcrumbs for dashboard
  useEffect(() => {
    setBreadcrumbs([{ label: "Dashboard" }]);
  }, [setBreadcrumbs]);

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

  // Calculate insights
  const failedTests = filteredInferences.filter(t => analyzeFailure(t, strictPolicyValidation) !== null);
  const criticalFailures = failedTests.filter(t => {
    const analysis = analyzeFailure(t, strictPolicyValidation);
    return analysis?.priority === "high";
  });

  // Calculate cost efficiency
  const totalCost = filteredInferences.reduce((acc, t) => acc + (t.cost_usd ?? t.metrics?.cost_usd ?? 0), 0);
  const passedTests = filteredInferences.filter(t => analyzeFailure(t, strictPolicyValidation) === null);
  const costPerCorrectTest = passedTests.length > 0 ? totalCost / passedTests.length : 0;

  // Calculate failure rate
  const failureRate = filteredInferences.length > 0 ? (failedTests.length / filteredInferences.length) * 100 : 0;

  // Calculate SLA compliance (assume 1000ms SLA threshold)
  const SLA_THRESHOLD = 1000;
  const testsWithinSLA = filteredInferences.filter(t => (t.latency_ms ?? t.metrics?.latency_ms ?? 0) <= SLA_THRESHOLD);
  const slaCompliance = filteredInferences.length > 0 ? (testsWithinSLA.length / filteredInferences.length) * 100 : 0;

  return (
    <main id="main-content" tabIndex={-1} className="flex-1 px-4 py-6 space-y-6 lg:px-6">
      <PageHeader
        title="Dashboard Overview"
        description="Your testing overview - key metrics and insights at a glance"
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
          {/* Test Context */}
          <DashboardTestContext inferences={filteredInferences} strictPolicyValidation={strictPolicyValidation} />

          {/* Metrics Cards */}
          <CompactMetricsBar
            summary={testData.sessionSummary}
            inferences={filteredInferences}
            strictPolicyValidation={strictPolicyValidation}
          />

          {/* Insights Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Failed Tests */}
            <AggregatedMetricsCard
              title="Failed Tests"
              value={`${failedTests.length} / ${filteredInferences.length}`}
              subtitle={filteredInferences.length > 0
                ? `${failureRate.toFixed(1)}% failure rate`
                : "No tests"
              }
              icon={<AlertTriangle className="size-4" />}
              variant="destructive"
              onClick={() => window.location.href = "/failures"}
              footer={{
                primary: `${criticalFailures.length} high-priority failures`,
                secondary: "Click to view details"
              }}
            />

            {/* Cost Efficiency */}
            <AggregatedMetricsCard
              title="Cost Efficiency"
              value={`$${costPerCorrectTest.toFixed(4)}`}
              subtitle="Per correct test"
              icon={<DollarSign className="size-4" />}
              variant="default"
              onClick={() => window.location.href = "/cost"}
              footer={{
                primary: "Average cost per passing test",
                secondary: "Click to view cost analysis"
              }}
            />

            {/* SLA Compliance */}
            <AggregatedMetricsCard
              title="SLA Compliance"
              value={`${slaCompliance.toFixed(1)}%`}
              subtitle={`${testsWithinSLA.length} / ${filteredInferences.length} tests`}
              icon={<Gauge className="size-4" />}
              variant={slaCompliance >= 95 ? "success" : slaCompliance >= 80 ? "warning" : "destructive"}
              threshold={{
                value: SLA_THRESHOLD,
                comparison: "below",
                met: slaCompliance >= 95
              }}
              onClick={() => window.location.href = "/performance"}
              footer={{
                primary: `Within ${SLA_THRESHOLD}ms threshold`,
                secondary: "Click to view performance"
              }}
            />
          </div>

          {/* Attack Scenario Summary */}
          <div id="attack-scenarios">
            <AttackScenarioSummary
              inferences={filteredInferences}
              strictPolicyValidation={strictPolicyValidation}
            />
          </div>
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
