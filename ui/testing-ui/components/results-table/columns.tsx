"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { InferenceEvent } from "@/types/test-results";
import { StatusCell } from "./cells/status-cell";
import { TestInfoCell } from "./cells/test-info-cell";
import { TestTypeCell } from "./cells/test-type-cell";
import { ResultCell } from "./cells/result-cell";
import { FailureCell } from "./cells/failure-cell";
import { MetricsCell } from "./cells/metrics-cell";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { analyzeFailure } from "@/lib/failure-analyzer";
import { extractPolicy, parsePolicy, getPolicyCategory } from "@/lib/policy-utils";

export function createColumns(strictPolicyValidation: boolean): ColumnDef<InferenceEvent>[] {
  return [
    {
      id: "status",
      accessorKey: "test_result",
      header: "Status",
      cell: ({ row }) => (
        <StatusCell
          inference={row.original}
          strictPolicyValidation={strictPolicyValidation}
        />
      ),
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || filterValue === "all") return true;

        const isPassed = analyzeFailure(row.original, strictPolicyValidation) === null;

        if (filterValue === "passed") return isPassed;
        if (filterValue === "failed") return !isPassed;

        return true;
      },
      enableSorting: false,
      enableHiding: false,
      size: 90,
      minSize: 70,
      maxSize: 110,
    },
    {
      id: "test_info",
      accessorKey: "test_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Test Information
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row, table }) => {
        // Get previous row's category for comparison
        const rows = table.getRowModel().rows;
        const currentIndex = rows.findIndex(r => r.id === row.id);
        const previousRow = currentIndex > 0 ? rows[currentIndex - 1] : null;
        
        let previousCategory: string | null = null;
        if (previousRow) {
          const prevPolicyText = extractPolicy(previousRow.original);
          const prevPolicy = prevPolicyText ? parsePolicy(prevPolicyText) : null;
          previousCategory = prevPolicy ? getPolicyCategory(prevPolicy.code) : null;
        }
        
        return (
          <TestInfoCell 
            inference={row.original} 
            previousCategory={previousCategory}
          />
        );
      },
      enableSorting: true,
      size: 300,
      minSize: 250,
      maxSize: 400,
    },
    {
      id: "test_type",
      accessorKey: "test_type",
      header: "Test Type",
      cell: ({ row }) => <TestTypeCell inference={row.original} />,
      enableSorting: false,
      size: 160,
      minSize: 140,
      maxSize: 200,
    },
    {
      id: "result",
      accessorKey: "test_result.expected",
      header: "Result",
      cell: ({ row }) => <ResultCell inference={row.original} />,
      enableSorting: false,
      size: 200,
      minSize: 180,
      maxSize: 250,
    },
    {
      id: "failure_reason",
      accessorKey: "failure_reason",
      header: "Failure Reason",
      cell: ({ row }) => (
        <FailureCell
          inference={row.original}
          strictPolicyValidation={strictPolicyValidation}
        />
      ),
      enableSorting: false,
      size: 180,
      minSize: 150,
      maxSize: 220,
    },
    {
      id: "metrics",
      accessorKey: "usage.total_tokens",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Metrics
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <MetricsCell inference={row.original} />,
      enableSorting: true,
      size: 200,
      minSize: 180,
      maxSize: 250,
    },
  ];
}
