// src/components/common/layout/AdminLayout.tsx
import type { FC, ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { AdminSideBar, SiteHeader } from "@/components/common/navigation";
import NavigationProgress from "@/components/common/navigation/NavigationProgress";
import { SidebarProvider, SidebarInset } from "@/components/ui/admin/sidebar";
import { Container } from "@/components/common/container";
import "@/admin.css";
interface AdminLayoutProps {
    children?: ReactNode;
    showHeader?: boolean;
}

const AdminLayout: FC<AdminLayoutProps> = ({
    children,
    showHeader = true
}) => {
    return (
        <div className="admin-theme">
            <NavigationProgress />
            <SidebarProvider
                defaultOpen={true}
                style={{
                    // "--sidebar-width": "16rem",
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties}
            >
                <AdminSideBar variant="inset"  collapsible="icon" />
                <SidebarInset className="overflow-x-hidden">
                    {showHeader && (
                        <header className="sticky top-0 z-10 bg-background border-b">
                            <SiteHeader />
                        </header>
                    )}
                    <main className="flex-1 overflow-auto">
                        <Container className="py-6"  maxWidth="full" withPadding={true}>
                            {children || <Outlet />}
                        </Container>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
};

export default AdminLayout;