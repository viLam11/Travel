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
    MessageCircle,
    CheckSquare,
    Tags,
    Flag,
    Globe,
} from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
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
    const userRole = currentUser?.user?.role?.toLowerCase() || '';

    const isAdmin = userRole === 'admin';
    const isProvider = userRole === 'provider' || userRole.startsWith('provider_');

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
                title: "Duyệt dịch vụ",
                url: "/admin/approvals",
                icon: <CheckSquare />,
                isActive: currentPath.startsWith('/admin/approvals'),
                visible: true,
            } as any,
            {
                title: "Quản lý dịch vụ",
                url: ROUTES.ADMIN_SERVICES,
                icon: <Hotel />,
                isActive: currentPath.startsWith('/admin/services'),
                visible: true,
            } as any,
            {
                title: "Ưu đãi hệ thống",
                url: "/admin/promotions",
                icon: <Tags />,
                isActive: currentPath.startsWith('/admin/promotions'),
                visible: true,
            } as any,
            {
                title: "Quản lý Blog",
                url: "/admin/blogs",
                icon: <MessageCircle />,
                isActive: currentPath.startsWith('/admin/blogs'),
                visible: true,
            } as any,
            {
                title: "Hỗ trợ (Chat)",
                url: "/admin/messages",
                icon: <MessageCircle />,
                isActive: currentPath.startsWith('/admin/messages'),
                visible: true,
            } as any,
            {
                title: "Báo cáo & Đánh giá",
                url: ROUTES.ADMIN_REVIEWS,
                icon: <Flag />,
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
    if (isProvider) {
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

        // Shared Provider menu items
        navMain.push(
            {
                title: "Đặt chỗ",
                url: "/provider/bookings",
                icon: <Calendar />,
                isActive: currentPath === "/provider/bookings",
                visible: true,
                disabled: !currentUser?.user?.hasService,
            } as any,
            {
                title: "Tin nhắn",
                url: "/provider/messages",
                icon: <MessageCircle />,
                isActive: currentPath === "/provider/messages",
                visible: true,
            } as any,
            {
                title: "Đánh giá",
                url: "/provider/reviews",
                icon: <Star />,
                isActive: currentPath === "/provider/reviews",
                visible: true,
                disabled: !currentUser?.user?.hasService,
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
                icon: <Languages />,
                disabled: true,
                onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    import('sonner').then(({ toast }) => {
                        toast.info("Tính năng Ngôn ngữ đang được phát triển!");
                    });
                }
            },
        ],
        quickActions: [] // Providers cannot add new services, only Admin can
    };
};

export function AdminSideBar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { currentUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const userRole = currentUser?.user?.role?.toLowerCase() || '';
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
                            <Link to={dashboardUrl} className="cursor-pointer">
                                <div className="font-bold text-xl text-blue-600">
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
                {/* Switch to user-facing site */}
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={() => navigate('/homepage')}
                            tooltip="Xem trang người dùng"
                            className="text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                            <Globe className="shrink-0" />
                            <span>Xem trang người dùng</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <NavUser user={{
                    name: currentUser?.user?.name || currentUser?.user?.fullname || "Người dùng",
                    email: currentUser?.user?.email || "",
                    avatar: "",
                }} />
            </SidebarFooter>
        </Sidebar>
    )
}

export default AdminSideBar;