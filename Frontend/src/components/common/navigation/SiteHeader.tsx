import { Separator } from "@/components/ui/admin/separator"
import { SidebarTrigger } from "@/components/ui/admin/sidebar"
// import { SearchForm } from "@/components/common/form/SearchForm"
import { ThemeToggle } from "./ThemeToggle"
import { Breadcrumbs } from "./Breadcrumbs"
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs"

const SiteHeader = () => {
    const breadcrumbItems = useBreadcrumbs();

    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumbs items={breadcrumbItems} />
                <div className="ml-auto flex items-center gap-2">
                    <ThemeToggle />
                    {/* <SearchForm className="w-full sm:ml-auto sm:w-auto" /> */}
                </div>
            </div>
        </header>
    )
}

export default SiteHeader;