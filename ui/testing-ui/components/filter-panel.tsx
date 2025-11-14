"use client";

import { IconFilter, IconChevronDown } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuBadge,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { FilterPresetsCompact } from "@/components/filter-presets";
import { FilterButtonGroup } from "@/components/filter-button-group";
import { TestTypeFilter } from "@/components/test-type-filter";
import type { TestCategory } from "@/types/test-results";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  selectedCategories: TestCategory[];
  selectedTestTypes: string[];
  onCategoriesChange: (categories: TestCategory[]) => void;
  onTestTypesChange: (types: string[]) => void;
  activePresetId?: string;
  onPresetSelect: (presetId: string) => void;
  onClearFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

export function FilterPanel({
  selectedCategories,
  selectedTestTypes,
  onCategoriesChange,
  onTestTypesChange,
  activePresetId,
  onPresetSelect,
  onClearFilters,
  filteredCount,
  totalCount,
}: FilterPanelProps) {
  const activeFilterCount = selectedCategories.length + selectedTestTypes.length;
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <SidebarGroup>
      <Collapsible defaultOpen={true} className="group/collapsible">
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="group/trigger w-full">
            <div className="flex items-center gap-2 flex-1">
              <IconFilter
                className={cn(
                  "h-4 w-4 transition-colors",
                  hasActiveFilters ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span>Filters</span>
            </div>
            {activeFilterCount > 0 && (
              <SidebarMenuBadge>{activeFilterCount}</SidebarMenuBadge>
            )}
            <IconChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>

        <CollapsibleContent>
          <SidebarGroupContent>
            {/* Quick Presets */}
            <div className="px-2 py-2">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Quick Filters
              </div>
              <FilterPresetsCompact
                activePresetId={activePresetId}
                onPresetSelect={onPresetSelect}
              />
            </div>

            <SidebarSeparator />

            {/* Advanced Filters */}
            <div className="flex flex-col gap-3 px-2 py-2">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Categories
                </div>
                <FilterButtonGroup
                  selectedCategories={selectedCategories}
                  onCategoriesChange={onCategoriesChange}
                />
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Test Types
                </div>
                <TestTypeFilter
                  selectedTestTypes={selectedTestTypes}
                  onTestTypesChange={onTestTypesChange}
                />
              </div>
            </div>

            {/* Filter Summary & Actions */}
            {hasActiveFilters && (
              <>
                <SidebarSeparator />
                <div className="px-2 py-2 space-y-2">
                  <div
                    className="text-xs text-muted-foreground"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    Showing {filteredCount} of {totalCount} tests
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="w-full justify-start h-8 px-2"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </>
            )}
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}
