"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  IconHelp,
  IconSettings,
} from "@tabler/icons-react"
import { FileText, DollarSign, Activity, AlertTriangle } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { FilterPanel } from "@/components/filter-panel"
import { BrandLogo } from "@/components/ui/brand-logo"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import type { TestCategory } from "@/types/test-results"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onSettingsClick: () => void;
  // Filter props
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

export function AppSidebar({
  onSettingsClick,
  selectedCategories,
  selectedTestTypes,
  onCategoriesChange,
  onTestTypesChange,
  activePresetId,
  onPresetSelect,
  onClearFilters,
  filteredCount,
  totalCount,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();

  const navMain = [
    {
      title: "Dashboard",
      url: "/",
      icon: Activity,
      isActive: pathname === "/",
    },
    {
      title: "Test Results",
      url: "/results",
      icon: FileText,
      isActive: pathname === "/results",
    },
    {
      title: "Cost Analysis",
      url: "/cost",
      icon: DollarSign,
      isActive: pathname === "/cost",
    },
    {
      title: "Performance",
      url: "/performance",
      icon: Activity,
      isActive: pathname === "/performance",
    },
    {
      title: "Failure Analysis",
      url: "/failures",
      icon: AlertTriangle,
      isActive: pathname === "/failures",
    },
  ];

  const navSecondary = [
    {
      title: "Settings",
      url: "#settings",
      icon: IconSettings,
      onClick: onSettingsClick,
    },
    {
      title: "Get Help",
      url: "#help",
      icon: IconHelp,
    },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/" className="flex items-center gap-2">
                <BrandLogo size="sm" />
                <span className="text-base font-semibold">AI Safety Testing</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <SidebarSeparator />
        <FilterPanel
          selectedCategories={selectedCategories}
          selectedTestTypes={selectedTestTypes}
          onCategoriesChange={onCategoriesChange}
          onTestTypesChange={onTestTypesChange}
          activePresetId={activePresetId}
          onPresetSelect={onPresetSelect}
          onClearFilters={onClearFilters}
          filteredCount={filteredCount}
          totalCount={totalCount}
        />
        <SidebarSeparator />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
