"use client"

import {
    User,
    Settings,
    LogOut,
    ChevronsUpDown,
    BellIcon,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/admin/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/admin/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/admin/sidebar"
import { ROUTES } from "@/constants/routes"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useLogout } from "@/hooks/useLogout"
import toast from 'react-hot-toast';

const NavUser = ({
    user,
}: {
    user: {
        name: string
        email: string
        avatar: string
    }
}) => {
    const { isMobile } = useSidebar()
    const navigate = useNavigate()
    
    const { isAuthenticated, currentUser } = useAuth();
    const { logout, isLoggingOut } = useLogout();

    const handleLogout = async () => {
        console.log("Logging out user...");
        await logout({
            redirectTo: ROUTES.HOMEPAGE,
            showToast: true,
            toastMessage: 'Đã đăng xuất thành công!'
        });
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="rounded-lg">{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user.name}</span>
                                <span className="truncate text-xs">{user.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="rounded-lg">{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user.name}</span>
                                    <span className="truncate text-xs">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <User />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <BellIcon />
                                Notifications
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                        >
                            <LogOut />
                            {isLoggingOut ? 'Đang đăng xuất...' : 'Log out'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

export default NavUser;