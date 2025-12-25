// src/components/common/navigation/AdminSideBar.tsx
import * as React from "react"
import {
    Hotel,
    Home,
    Settings,
    Users,
    HelpCircle,
    Languages,
    Calendar,
    Star,
    LayoutDashboard,
    Plus,
    List,
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

const getNavItems = (currentPath: string, currentUser: any) => ({
    navMain: [
        {
            title: "Dashboard",
            url: ROUTES.ADMIN_DASHBOARD,
            icon: <LayoutDashboard />,
            isActive: currentPath === ROUTES.ADMIN_DASHBOARD,
            visible: true,
        },
        {
            title: "Services",
            url: ROUTES.ADMIN_SERVICES,
            icon: <Hotel />,
            isActive: currentPath.startsWith('/admin/services'),
            visible: true,
            items: [
                {
                    title: "Dashboard",
                    url: ROUTES.ADMIN_SERVICES,
                    icon: <LayoutDashboard />,
                    isActive: currentPath === ROUTES.ADMIN_SERVICES,
                },
                {
                    title: "Add Service",
                    url: ROUTES.ADMIN_SERVICES + "/new",
                    icon: <Plus />,
                    isActive: currentPath === ROUTES.ADMIN_SERVICES + "/new",
                },
                {
                    title: "Service List",
                    url: ROUTES.ADMIN_SERVICES + "/list",
                    icon: <List />,
                    isActive: currentPath === ROUTES.ADMIN_SERVICES + "/list",
                },
            ]
        },
        {
            title: "Hotels",
            url: "/admin/hotels",
            icon: <Home />,
            isActive: currentPath.startsWith('/admin/hotels'),
            visible: true,
            items: [
                {
                    title: "Dashboard",
                    url: "/admin/hotels",
                    icon: <LayoutDashboard />,
                    isActive: currentPath === "/admin/hotels",
                },
                {
                    title: "Add Hotel",
                    url: "/admin/hotels/new",
                    icon: <Plus />,
                    isActive: currentPath === "/admin/hotels/new",
                },
                {
                    title: "Hotel Rooms",
                    url: "/admin/hotels/rooms",
                    icon: <List />,
                    isActive: currentPath === "/admin/hotels/rooms",
                },
            ]
        },
        {
            title: "Users",
            url: ROUTES.ADMIN_USERS,
            icon: <Users />,
            isActive: currentPath === ROUTES.ADMIN_USERS,
            visible: true,
        },
        {
            title: "Bookings",
            url: ROUTES.ADMIN_BOOKINGS,
            icon: <Calendar />,
            isActive: currentPath === ROUTES.ADMIN_BOOKINGS,
            visible: true,
        },
        {
            title: "Reviews",
            url: ROUTES.ADMIN_REVIEWS,
            icon: <Star />,
            isActive: currentPath === ROUTES.ADMIN_REVIEWS,
            visible: true,
        },
    ],
    navSecondary: [
        {
            title: "Settings",
            url: "/admin/settings",
            icon: <Settings />,
        },
        {
            title: "Get Help",
            url: "/admin/help",
            icon: <HelpCircle />,
        },
        {
            title: "Language",
            url: "/admin/language",
            icon: <Languages />,
        },
    ],
    quickActions: [
        {
            title: "Add Service",
            url: ROUTES.ADMIN_SERVICES + "/new",
            icon: <Hotel />,
            visible: true,
        }
    ].filter(action => action.visible)
});

export function AdminSideBar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { currentUser } = useAuth();
    const location = useLocation();

    const navItems = getNavItems(location.pathname, currentUser);
    const filteredMainNav = navItems.navMain.filter(item => item.visible);

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link to={ROUTES.ADMIN_DASHBOARD}>
                                <div className="font-bold text-xl text-[#eb662b]">
                                    Travello
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                                    <span className="truncate font-medium">Admin Panel</span>
                                    <span className="truncate text-xs text-muted-foreground">Service Management</span>
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