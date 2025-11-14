"use client";

import { Suspense, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SettingsDialog } from "@/components/settings-dialog";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useFilterState } from "@/hooks/use-filter-state";

function DashboardContent({
  children,
  settingsOpen,
  setSettingsOpen,
}: {
  children: React.ReactNode;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
}) {
  // Filter state management
  const {
    categories: selectedCategories,
    testTypes: selectedTestTypes,
    setCategories,
    setTestTypes,
    applyPreset,
    clearFilters,
    activePreset,
  } = useFilterState();

  // These will be passed from the page component via context in next iteration
  // For now, using placeholder values
  const filteredCount = 0;
  const totalCount = 0;

  return (
    <>
      <AppSidebar
        variant="inset"
        onSettingsClick={() => setSettingsOpen(true)}
        selectedCategories={selectedCategories}
        selectedTestTypes={selectedTestTypes}
        onCategoriesChange={setCategories}
        onTestTypesChange={setTestTypes}
        activePresetId={activePreset?.id}
        onPresetSelect={applyPreset}
        onClearFilters={clearFilters}
        filteredCount={filteredCount}
        totalCount={totalCount}
      />
      <SidebarInset>
        {/* Skip Navigation Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Skip to main content
        </a>

        <SiteHeader />

        <div className="@container/main flex flex-1 flex-col">
          {children}
        </div>
      </SidebarInset>

      {/* Settings Dialog */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
        } as React.CSSProperties
      }
    >
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent
          settingsOpen={settingsOpen}
          setSettingsOpen={setSettingsOpen}
        >
          {children}
        </DashboardContent>
      </Suspense>
    </SidebarProvider>
  );
}
