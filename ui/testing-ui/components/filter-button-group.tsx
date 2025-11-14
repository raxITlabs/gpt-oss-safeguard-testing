"use client";

import { ChevronDownIcon, FilterIcon, XIcon } from "lucide-react";
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
import { TestCategory } from "@/types/test-results";
import {
  CATEGORY_GROUPS,
  ALL_BASELINE_CATEGORIES,
  formatCategoryLabel,
} from "@/lib/filter-presets";
import { cn } from "@/lib/utils";

interface FilterButtonGroupProps {
  selectedCategories: TestCategory[];
  onCategoriesChange: (categories: TestCategory[]) => void;
  className?: string;
}

export function FilterButtonGroup({
  selectedCategories,
  onCategoriesChange,
  className,
}: FilterButtonGroupProps) {
  const handleToggleCategory = (category: TestCategory) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const handleSelectAll = () => {
    onCategoriesChange(ALL_BASELINE_CATEGORIES);
  };

  const handleClearAll = () => {
    onCategoriesChange([]);
  };

  const selectedCount = selectedCategories.length;
  const totalCount = ALL_BASELINE_CATEGORIES.length;
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
                "gap-2 transition-colors rounded-lg",
                hasSelection && "border-primary/50 bg-primary/5"
              )}
            >
              <FilterIcon className="h-4 w-4" />
              <span>Categories</span>
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
                Select Categories
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

            {/* Category Groups */}
            {CATEGORY_GROUPS.map((group, groupIndex) => (
              <div key={group.label}>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {group.label}
                  </DropdownMenuLabel>
                  {group.categories.map((category) => {
                    const isChecked = selectedCategories.includes(category);
                    return (
                      <DropdownMenuItem
                        key={category}
                        className="gap-2 px-2 py-2"
                        onSelect={(e) => {
                          e.preventDefault();
                          handleToggleCategory(category);
                        }}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleToggleCategory(category)}
                          className="pointer-events-none"
                        />
                        <span className="flex-1 text-sm">
                          {formatCategoryLabel(category)}
                        </span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
                {groupIndex < CATEGORY_GROUPS.length - 1 && (
                  <DropdownMenuSeparator />
                )}
              </div>
            ))}

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

      {/* Selected categories chips (optional - shown outside dropdown) */}
      {hasSelection && selectedCount <= 3 && (
        <div className="flex flex-wrap gap-1">
          {selectedCategories.slice(0, 3).map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="gap-1 pr-1 text-xs"
            >
              {formatCategoryLabel(category)}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleCategory(category);
                }}
                className="ml-1 rounded-full hover:bg-muted-foreground/20"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
