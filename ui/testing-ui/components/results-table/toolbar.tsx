"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import type { InferenceEvent } from "@/types/test-results";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTableViewOptions } from "./view-options";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTableToolbarProps {
  table: Table<InferenceEvent>;
  strictPolicyValidation: boolean;
}

export function DataTableToolbar({
  table,
  strictPolicyValidation,
}: DataTableToolbarProps) {
  const isFiltered = table.getState().columnFilters.length > 0;

  // Get current filter value, default to "failed"
  const statusFilter = (table.getColumn("status")?.getFilterValue() as string) || "failed";

  // Custom filter function for status
  const handleStatusFilterChange = (value: string) => {
    const statusColumn = table.getColumn("status");
    if (!statusColumn) return;

    if (value === "all") {
      statusColumn.setFilterValue(undefined);
    } else {
      statusColumn.setFilterValue(value);
    }
  };

  // Set default filter to "failed" only on initial mount
  React.useEffect(() => {
    const statusColumn = table.getColumn("status");
    if (statusColumn && !statusColumn.getFilterValue()) {
      statusColumn.setFilterValue("failed");
    }
  }, [table]);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex flex-col sm:flex-row flex-1 items-start sm:items-center gap-3 w-full sm:w-auto">
        <Input
          placeholder="Search tests..."
          value={(table.getColumn("test_info")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("test_info")?.setFilterValue(event.target.value)
          }
          className="min-h-11 w-full sm:w-[250px]"
          aria-label="Search tests"
        />

        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="min-h-11 w-full sm:w-[180px]" aria-label="Filter by test status">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tests</SelectItem>
            <SelectItem value="passed">Passed Only</SelectItem>
            <SelectItem value="failed">Failed Only</SelectItem>
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="min-h-11 px-2 lg:px-3"
            aria-label="Clear all filters"
          >
            Reset
            <X className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
