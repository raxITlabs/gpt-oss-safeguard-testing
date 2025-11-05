"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, ArrowUpDown } from "lucide-react";
import type { InferenceEvent, FilterOptions } from "@/types/test-results";
import { StatusBadge } from "./status-badge";
import { TestDetailsDialog } from "./test-details-dialog";
import { formatCurrency, formatLatency } from "@/lib/format-utils";
import { extractPolicy, parsePolicy, getPolicyCategory } from "@/lib/policy-utils";
import { analyzeFailure } from "@/lib/failure-analyzer";
import { FailureReasonBadge } from "./failure-reason-badge";
import { Shield, Target, RefreshCw, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ResultsTableProps {
  inferences: InferenceEvent[];
  externalStatusFilter?: "all" | "passed" | "failed";
  strictPolicyValidation?: boolean;
}

type SortField = "test_number" | "test_name" | "tokens" | "cost" | "latency";
type SortDirection = "asc" | "desc";

export function ResultsTable({ inferences, externalStatusFilter, strictPolicyValidation = true }: ResultsTableProps) {
  const [selectedTest, setSelectedTest] = useState<InferenceEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "passed" | "failed">("all");
  const [sortField, setSortField] = useState<SortField>("test_number");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [failuresFirst, setFailuresFirst] = useState(true);

  // Use external filter if provided
  const activeStatusFilter = externalStatusFilter || statusFilter;

  const handleViewDetails = (test: InferenceEvent) => {
    setSelectedTest(test);
    setDialogOpen(true);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let filtered = [...inferences];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (inf) =>
          inf.test_name.toLowerCase().includes(searchLower) ||
          inf.test_number.toString().includes(searchLower)
      );
    }

    // Apply status filter using analyzeFailure to respect strictPolicyValidation
    if (activeStatusFilter !== "all") {
      filtered = filtered.filter((inf) => {
        const isPassed = analyzeFailure(inf, strictPolicyValidation) === null;
        return activeStatusFilter === "passed" ? isPassed : !isPassed;
      });
    }

    // Sort with failures-first option
    filtered.sort((a, b) => {
      // If failures-first is enabled, sort by status first
      if (failuresFirst) {
        const aPassed = analyzeFailure(a, strictPolicyValidation) === null;
        const bPassed = analyzeFailure(b, strictPolicyValidation) === null;

        if (aPassed !== bPassed) {
          // Failed tests (false) come before passed tests (true)
          return aPassed ? 1 : -1;
        }
      }

      // Then sort by selected field
      let aVal: number | string;
      let bVal: number | string;

      switch (sortField) {
        case "test_number":
          aVal = a.test_number;
          bVal = b.test_number;
          break;
        case "test_name":
          aVal = a.test_name;
          bVal = b.test_name;
          break;
        case "tokens":
          aVal = a.usage?.total_tokens ?? 0;
          bVal = b.usage?.total_tokens ?? 0;
          break;
        case "cost":
          aVal = a.metrics?.cost_usd ?? 0;
          bVal = b.metrics?.cost_usd ?? 0;
          break;
        case "latency":
          aVal = a.metrics?.latency_ms ?? 0;
          bVal = b.metrics?.latency_ms ?? 0;
          break;
        default:
          aVal = a.test_number;
          bVal = b.test_number;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === "asc" ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });

    return filtered;
  }, [inferences, search, activeStatusFilter, sortField, sortDirection, failuresFirst, strictPolicyValidation]);

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => toggleSort(field)}
      className="h-8 gap-1"
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </Button>
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
        <Input
          placeholder="Search tests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        <Select value={activeStatusFilter} onValueChange={(value: "all" | "passed" | "failed") => setStatusFilter(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tests</SelectItem>
            <SelectItem value="passed">Passed Only</SelectItem>
            <SelectItem value="failed">Failed Only</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground flex items-center leading-none">
          Showing {filteredAndSorted.length} of {inferences.length} tests
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[80px]">
                <SortButton field="test_number">#</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="test_name">Test Name</SortButton>
              </TableHead>
              <TableHead className="w-[150px]">Policy</TableHead>
              <TableHead className="w-[140px]">Test Type</TableHead>
              <TableHead className="w-[100px]">Expected</TableHead>
              <TableHead className="w-[100px]">Actual</TableHead>
              <TableHead className="w-[250px]">Failure Reason</TableHead>
              <TableHead className="w-[100px] text-right">
                <SortButton field="tokens">Tokens</SortButton>
              </TableHead>
              <TableHead className="w-[100px] text-right">
                <SortButton field="cost">Cost</SortButton>
              </TableHead>
              <TableHead className="w-[100px] text-right">
                <SortButton field="latency">Latency</SortButton>
              </TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground">
                  No tests found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSorted.map((inference) => {
                const policyText = extractPolicy(inference);
                const policy = policyText ? parsePolicy(policyText) : null;
                const policyCategory = policy ? getPolicyCategory(policy.code) : "N/A";
                const failureAnalysis = analyzeFailure(inference, strictPolicyValidation);
                const isPassed = failureAnalysis === null;

                return (
                  <TableRow
                    key={inference.response.id || `${inference.category}-${inference.test_number}`}
                    className={!isPassed ? "border-l-4 border-l-destructive bg-destructive/5" : ""}
                  >
                    <TableCell>
                      <StatusBadge passed={isPassed} showIcon={true} />
                    </TableCell>
                    <TableCell className="font-medium">{inference.test_number}</TableCell>
                    <TableCell className="max-w-[200px]">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-mono text-sm truncate block cursor-help">
                              {inference.test_name}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-xs">{inference.test_name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {policyCategory}
                      </Badge>
                      {policy && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {policy.code}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[140px]">
                      {(() => {
                        const testType = inference.test_type;
                        const isAttack = testType && testType !== 'baseline';

                        if (!testType || testType === 'baseline') {
                          return (
                            <Badge variant="outline" className="text-xs gap-1 whitespace-nowrap">
                              <Shield className="h-3 w-3 shrink-0" />
                              Baseline
                            </Badge>
                          );
                        }

                        const icon = testType.includes('multi') ? RefreshCw :
                                    testType.includes('prompt') || testType.includes('injection') ? Target :
                                    AlertTriangle;

                        const Icon = icon;
                        const label = testType
                          .replace(/_/g, '-')
                          .split('-')
                          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(' ');

                        return (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="default"
                                  className="text-xs gap-1 bg-rose-500 hover:bg-rose-600 max-w-full cursor-help"
                                >
                                  <Icon className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{label}</span>
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">{label} Attack Scenario</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{inference.test_result?.expected ?? "N/A"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{inference.test_result?.actual ?? "N/A"}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      {failureAnalysis ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="max-w-full">
                                <FailureReasonBadge
                                  reasonType={failureAnalysis.reasonType}
                                  reasonText={failureAnalysis.primaryReason}
                                  compact={true}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-md">
                              <p className="text-xs whitespace-normal">{failureAnalysis.primaryReason}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {(inference.usage?.total_tokens || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(inference.metrics?.cost_usd || 0)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatLatency(inference.metrics?.latency_ms || 0)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(inference)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <TestDetailsDialog test={selectedTest} open={dialogOpen} onOpenChange={setDialogOpen} strictPolicyValidation={strictPolicyValidation} />
    </div>
  );
}
