import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 lg:px-6">
      <SidebarTrigger className="-ml-1" />
      {/* <Separator
        orientation="vertical"
        className="mx-2 data-[orientation=vertical]:h-4"
      /> */}
      {/* <h1 className="text-base font-medium">AI Safety and Security Testing</h1> */}
    </header>
  )
}
