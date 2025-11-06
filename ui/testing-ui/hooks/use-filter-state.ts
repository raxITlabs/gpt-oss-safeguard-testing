"use client";

import { useQueryStates, parseAsArrayOf, parseAsString } from "nuqs";
import { useMemo, useCallback } from "react";
import { TestCategory } from "@/types/test-results";
import {
  ALL_BASELINE_CATEGORIES,
  ATTACK_TEST_TYPES,
  getPreset,
  type TestTypeValue,
  type FilterPreset,
} from "@/lib/filter-presets";

export type StatusFilter = "all" | "passed" | "failed";

interface FilterState {
  categories: TestCategory[];
  testTypes: string[];
  status: StatusFilter;
}

interface FilterActions {
  setCategories: (categories: TestCategory[]) => void;
  setTestTypes: (types: string[]) => void;
  setStatus: (status: StatusFilter) => void;
  toggleCategory: (category: TestCategory) => void;
  toggleTestType: (type: string) => void;
  applyPreset: (presetId: string) => void;
  clearFilters: () => void;
  resetToDefaults: () => void;
}

interface UseFilterStateReturn extends FilterState, FilterActions {
  hasActiveFilters: boolean;
  activePreset?: FilterPreset;
}

/**
 * Custom hook for managing filter state with URL synchronization
 * Uses nuqs for type-safe URL query parameter management
 */
export function useFilterState(): UseFilterStateReturn {
  const [filterState, setFilterState] = useQueryStates(
    {
      categories: parseAsArrayOf(parseAsString).withDefault([]),
      testTypes: parseAsArrayOf(parseAsString).withDefault([]),
      status: parseAsString.withDefault("all"),
    },
    {
      // Use shallow routing to avoid full page reloads
      shallow: true,
      // Clear history to prevent URL pollution
      history: "push",
    }
  );

  const { categories, testTypes, status } = filterState;

  // Memoized computed values
  const hasActiveFilters = useMemo(() => {
    return (
      categories.length > 0 ||
      testTypes.length > 0 ||
      status !== "all"
    );
  }, [categories, testTypes, status]);

  // Determine if a preset is currently active
  const activePreset = useMemo(() => {
    // Check if current filters match any preset
    const presets = [
      getPreset("all"),
      getPreset("all-baseline"),
      getPreset("all-attacks"),
      getPreset("critical"),
      getPreset("policy"),
      getPreset("security"),
      getPreset("edge-cases"),
    ].filter((p): p is FilterPreset => p !== undefined);

    for (const preset of presets) {
      const presetCategories =
        preset.categories === "all" ? [] : preset.categories;
      const presetTestTypes =
        preset.testTypes === "all" ? [] : preset.testTypes;

      const categoriesMatch =
        categories.length === presetCategories.length &&
        categories.every((c) => presetCategories.includes(c as TestCategory));

      const testTypesMatch =
        testTypes.length === presetTestTypes.length &&
        testTypes.every((t) => presetTestTypes.includes(t as TestTypeValue));

      if (categoriesMatch && testTypesMatch) {
        return preset;
      }
    }

    return undefined;
  }, [categories, testTypes]);

  // Actions
  const setCategories = useCallback(
    (newCategories: TestCategory[]) => {
      setFilterState({ categories: newCategories });
    },
    [setFilterState]
  );

  const setTestTypes = useCallback(
    (newTypes: string[]) => {
      setFilterState({ testTypes: newTypes });
    },
    [setFilterState]
  );

  const setStatus = useCallback(
    (newStatus: StatusFilter) => {
      setFilterState({ status: newStatus });
    },
    [setFilterState]
  );

  const toggleCategory = useCallback(
    (category: TestCategory) => {
      const newCategories = categories.includes(category)
        ? categories.filter((c) => c !== category)
        : [...categories, category];
      setFilterState({ categories: newCategories });
    },
    [categories, setFilterState]
  );

  const toggleTestType = useCallback(
    (type: string) => {
      const newTypes = testTypes.includes(type)
        ? testTypes.filter((t) => t !== type)
        : [...testTypes, type];
      setFilterState({ testTypes: newTypes });
    },
    [testTypes, setFilterState]
  );

  const applyPreset = useCallback(
    (presetId: string) => {
      const preset = getPreset(presetId);
      if (!preset) return;

      const newCategories =
        preset.categories === "all" ? [] : preset.categories;
      const newTestTypes = preset.testTypes === "all" ? [] : preset.testTypes;

      setFilterState({
        categories: newCategories,
        testTypes: newTestTypes,
      });
    },
    [setFilterState]
  );

  const clearFilters = useCallback(() => {
    setFilterState({
      categories: [],
      testTypes: [],
      status: "all",
    });
  }, [setFilterState]);

  const resetToDefaults = useCallback(() => {
    // Reset to "All Tests" preset
    clearFilters();
  }, [clearFilters]);

  return {
    // State
    categories: categories as TestCategory[],
    testTypes,
    status: status as StatusFilter,

    // Actions
    setCategories,
    setTestTypes,
    setStatus,
    toggleCategory,
    toggleTestType,
    applyPreset,
    clearFilters,
    resetToDefaults,

    // Computed
    hasActiveFilters,
    activePreset,
  };
}

/**
 * Helper hook to check if specific filters are active
 */
export function useFilterChecks(filterState: FilterState) {
  const isCategoryActive = useCallback(
    (category: TestCategory) => {
      return filterState.categories.includes(category);
    },
    [filterState.categories]
  );

  const isTestTypeActive = useCallback(
    (type: string) => {
      return filterState.testTypes.includes(type);
    },
    [filterState.testTypes]
  );

  const isStatusActive = useCallback(
    (status: StatusFilter) => {
      return filterState.status === status;
    },
    [filterState.status]
  );

  return {
    isCategoryActive,
    isTestTypeActive,
    isStatusActive,
  };
}
