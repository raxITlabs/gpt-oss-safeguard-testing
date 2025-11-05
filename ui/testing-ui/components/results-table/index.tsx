"use client";

import { useMemo, useState } from "react";
import type { InferenceEvent } from "@/types/test-results";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import { TestDetailsDialog } from "@/components/test-details-dialog";

interface ResultsTableProps {
  inferences: InferenceEvent[];
  externalStatusFilter?: "all" | "passed" | "failed";
  strictPolicyValidation?: boolean;
}

export function ResultsTable({
  inferences,
  externalStatusFilter,
  strictPolicyValidation = true,
}: ResultsTableProps) {
  const [selectedTest, setSelectedTest] = useState<InferenceEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewDetails = (test: InferenceEvent) => {
    setSelectedTest(test);
    setDialogOpen(true);
  };

  // Create columns with current strictPolicyValidation setting
  const columns = useMemo(
    () => createColumns(strictPolicyValidation),
    [strictPolicyValidation]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={inferences}
        strictPolicyValidation={strictPolicyValidation}
        onRowClick={handleViewDetails}
      />

      <TestDetailsDialog
        test={selectedTest}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        strictPolicyValidation={strictPolicyValidation}
      />
    </>
  );
}
