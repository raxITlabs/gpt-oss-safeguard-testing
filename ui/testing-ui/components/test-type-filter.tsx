"use client";

import { ChevronDownIcon, LayersIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatTestTypeLabel } from "@/lib/filter-presets";
import { cn } from "@/lib/utils";

interface TestTypeFilterProps {
  selectedTestTypes: string[];
  onTestTypesChange: (types: string[]) => void;
  className?: string;
}

// Test types available in the system (normalized versions)
const TEST_TYPES = [
  { value: "baseline", label: "Baseline", description: "Standard content policy tests" },
  {
    value: "multi-turn",
    label: "Multi-Turn",
    description: "Multi-turn conversation attacks",
  },
  {
    value: "prompt-injection",
    label: "Prompt Injection",
    description: "Prompt injection attack tests",
  },
  {
    value: "over-refusal",
    label: "Over-Refusal",
    description: "Over-refusal false positive tests",
  },
];

export function TestTypeFilter({
  selectedTestTypes,
  onTestTypesChange,
  className,
}: TestTypeFilterProps) {
  const handleToggleTestType = (type: string) => {
    // Normalize the type (replace underscores with dashes)
    const normalizedType = type.replace(/_/g, "-");

    // Check if any variant of this type is selected
    const isSelected =
      selectedTestTypes.includes(type) ||
      selectedTestTypes.includes(normalizedType) ||
      selectedTestTypes.includes(type.replace(/-/g, "_"));

    if (isSelected) {
      // Remove all variants
      onTestTypesChange(
        selectedTestTypes.filter(
          (t) =>
            t !== type &&
            t !== normalizedType &&
            t !== type.replace(/-/g, "_") &&
            t !== normalizedType.replace(/-/g, "_")
        )
      );
    } else {
      // Add the normalized version
      onTestTypesChange([...selectedTestTypes, normalizedType]);
    }
  };

  const handleSelectAll = () => {
    onTestTypesChange(TEST_TYPES.map((t) => t.value));
  };

  const handleClearAll = () => {
    onTestTypesChange([]);
  };

  // Normalize selected types for comparison
  const normalizedSelected = selectedTestTypes.map((t) => t.replace(/_/g, "-"));
  const selectedCount = new Set(normalizedSelected).size;
  const totalCount = TEST_TYPES.length;
  const hasSelection = selectedCount > 0;
  const isAllSelected = selectedCount === totalCount;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ButtonGroup>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "gap-2 transition-colors",
                hasSelection && "border-blue-500/50 bg-blue-500/5"
              )}
            >
              <LayersIcon className="h-4 w-4" />
              <span>Test Types</span>
              {hasSelection && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 min-w-[20px] rounded-full px-1.5 text-xs"
                >
                  {selectedCount}
                </Badge>
              )}
              <ChevronDownIcon className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[280px]">
            {/* Header with Select All / Clear All */}
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel className="p-0 text-xs font-semibold text-muted-foreground">
                Select Test Types
              </DropdownMenuLabel>
              <div className="flex gap-1">
                {!isAllSelected && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={handleSelectAll}
                  >
                    All
                  </Button>
                )}
                {hasSelection && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={handleClearAll}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Test Type Options */}
            <DropdownMenuGroup>
              {TEST_TYPES.map((testType) => {
                const isChecked =
                  normalizedSelected.includes(testType.value) ||
                  normalizedSelected.includes(testType.value.replace(/-/g, "_"));

                return (
                  <DropdownMenuItem
                    key={testType.value}
                    className="flex-col items-start gap-1 px-2 py-2.5"
                    onSelect={(e) => {
                      e.preventDefault();
                      handleToggleTestType(testType.value);
                    }}
                  >
                    <div className="flex w-full items-center gap-2">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() =>
                          handleToggleTestType(testType.value)
                        }
                        className="pointer-events-none"
                      />
                      <span className="flex-1 text-sm font-medium">
                        {testType.label}
                      </span>
                    </div>
                    <p className="ml-6 text-xs text-muted-foreground">
                      {testType.description}
                    </p>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>

            {/* Footer with selection count */}
            {hasSelection && (
              <>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  {selectedCount} of {totalCount} selected
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>

      {/* Selected test types chips (optional - shown outside dropdown) */}
      {hasSelection && selectedCount <= 2 && (
        <div className="flex flex-wrap gap-1">
          {Array.from(new Set(normalizedSelected))
            .slice(0, 2)
            .map((type) => {
              const testType = TEST_TYPES.find((t) => t.value === type);
              return (
                <Badge
                  key={type}
                  variant="secondary"
                  className="gap-1 pr-1 text-xs"
                >
                  {testType?.label || formatTestTypeLabel(type)}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleTestType(type);
                    }}
                    className="ml-1 rounded-full hover:bg-muted-foreground/20"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
        </div>
      )}
    </div>
  );
}
