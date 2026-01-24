import {
    MoreHorizontal,
} from "lucide-react"

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/admin/sidebar"

const NavQuickActions = ({
    title = "Quick Actions",
    items,
}: {
    title?: string
    items: {
        title: string
        url: string
        icon: React.ReactNode
    }[]
}) => {

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>{title}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                            <a href={item.url}>
                                {item.icon}
                                <span>{item.title}</span>
                            </a>
                        </SidebarMenuButton>
                        <SidebarMenuAction showOnHover>
                            <MoreHorizontal />
                            <span className="sr-only">More</span>
                        </SidebarMenuAction>
                    </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                    <SidebarMenuButton>
                        <MoreHorizontal />
                        <span>More</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    )
}

export default NavQuickActions;