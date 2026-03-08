// src/components/common/navigation/AdminSideBar.tsx
import * as React from "react"
import {
    Hotel,
    Settings,
    Users,
    HelpCircle,
    Languages,
    Calendar,
    Star,
    LayoutDashboard,
    Bed,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { ROUTES } from "@/constants/routes"

import { NavQuickActions, NavMain, NavSecondary, NavUser } from "@/components/common/navigation"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/admin/sidebar"
import { useAuth } from "@/hooks/useAuth"

const getNavItems = (currentPath: string, currentUser: any) => {
    // Get user role and provider type
    const userRole = currentUser?.user?.role?.toLowerCase() || 'provider';
    const providerType: 'hotel' | 'place' = currentUser?.user?.providerType || 'hotel';

    const isAdmin = userRole === 'admin';
    const isProvider = userRole === 'provider';

    const navMain = [];

    // ==================== ADMIN NAVIGATION ====================
    if (isAdmin) {
        navMain.push(
            {
                title: "Tổng quan",
                url: ROUTES.ADMIN_DASHBOARD,
                icon: <LayoutDashboard />,
                isActive: currentPath === ROUTES.ADMIN_DASHBOARD,
                visible: true,
            },
            {
                title: "Dịch vụ",
                url: ROUTES.ADMIN_SERVICES,
                icon: <Hotel />,
                isActive: currentPath.startsWith('/admin/services'),
                visible: true,
            } as any,
            {
                title: "Đánh giá",
                url: ROUTES.ADMIN_REVIEWS,
                icon: <Star />,
                isActive: currentPath === ROUTES.ADMIN_REVIEWS,
                visible: true,
            } as any,
            {
                title: "Người dùng",
                url: ROUTES.ADMIN_USERS,
                icon: <Users />,
                isActive: currentPath === ROUTES.ADMIN_USERS,
                visible: true,
            } as any
        );
    }

    // ==================== PROVIDER NAVIGATION ====================
    // Allow Admin to access Provider pages for testing purposes
    if (isProvider || isAdmin) {
        navMain.push({
            title: "Tổng quan",
            url: "/provider/dashboard",
            icon: <LayoutDashboard />,
            isActive: currentPath === "/provider/dashboard",
            visible: true,
        });

        // My Service - Always visible for providers
        navMain.push({
            title: "Dịch vụ của tôi",
            url: ROUTES.PROVIDER_MY_SERVICE,
            icon: <Hotel />,
            isActive: currentPath === ROUTES.PROVIDER_MY_SERVICE,
            visible: true,
        } as any);

        // Hotel Provider - Room Management
        if (providerType === 'hotel') {
            navMain.push({
                title: "Quản lý phòng",
                url: "/provider/hotels/rooms",
                icon: <Bed />,
                isActive: currentPath === "/provider/hotels/rooms",
                visible: true,
            } as any);
        }

        // Shared Provider menu items
        navMain.push(
            {
                title: "Đặt chỗ",
                url: "/provider/bookings",
                icon: <Calendar />,
                isActive: currentPath === "/provider/bookings",
                visible: true,
            } as any,
            {
                title: "Đánh giá",
                url: "/provider/reviews",
                icon: <Star />,
                isActive: currentPath === "/provider/reviews",
                visible: true,
            } as any
        );
    }

    return {
        navMain,
        navSecondary: [
            {
                title: "Cài đặt",
                url: isAdmin ? "/admin/settings" : "/provider/settings",
                icon: <Settings />,
            },
            {
                title: "Trợ giúp",
                url: isAdmin ? "/admin/help" : "/provider/help",
                icon: <HelpCircle />,
            },
            {
                title: "Ngôn ngữ",
                url: isAdmin ? "/admin/language" : "/provider/language",
                icon: <Languages />,
            },
        ],
        quickActions: [] // Providers cannot add new services, only Admin can
    };
};

export function AdminSideBar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { currentUser } = useAuth();
    const location = useLocation();

    const userRole = currentUser?.user?.role?.toLowerCase() || 'provider';
    const isAdmin = userRole === 'admin';

    const navItems = getNavItems(location.pathname, currentUser);
    const filteredMainNav = navItems.navMain.filter(item => item.visible);

    const dashboardUrl = isAdmin ? ROUTES.ADMIN_DASHBOARD : "/provider/dashboard";
    const panelTitle = isAdmin ? "Admin Panel" : "Provider Panel";
    const panelSubtitle = isAdmin ? "System Management" : "Service Management";

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link to={dashboardUrl}>
                                <div className="font-bold text-xl text-[#eb662b]">
                                    Travello
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                                    <span className="truncate font-medium">{panelTitle}</span>
                                    <span className="truncate text-xs text-muted-foreground">{panelSubtitle}</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={filteredMainNav} />
                {navItems.quickActions.length > 0 && <NavQuickActions items={navItems.quickActions} />}
                <NavSecondary items={navItems.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={{
                    name: currentUser?.user?.name || "Admin User",
                    email: currentUser?.user?.email || "admin@example.com",
                    avatar: "",
                }} />
            </SidebarFooter>
        </Sidebar>
    )
}

export default AdminSideBar;