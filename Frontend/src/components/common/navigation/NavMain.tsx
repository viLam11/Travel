// src/components/common/navigation/NavMain.tsx
import { ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/admin/collapsible"
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/admin/sidebar"

const NavMain = ({
    items,
}: {
    items: {
        title: string
        url: string
        icon?: React.ReactNode
        isActive?: boolean
        items?: {
            title: string
            url: string
            icon?: React.ReactNode
            isActive?: boolean
        }[]
    }[]
}) => {
    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {items.map((item) => {
                        // Nếu item có submenu
                        if (item.items && item.items.length > 0) {
                            return (
                                <Collapsible
                                    key={item.title}
                                    asChild
                                    defaultOpen={item.isActive}
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton tooltip={item.title}>
                                                {item.icon && item.icon}
                                                <span>{item.title}</span>
                                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.items.map((subItem) => (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                                                            <Link to={subItem.url}>
                                                                {subItem.icon && subItem.icon}
                                                                <span>{subItem.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            )
                        }

                        // Nếu item không có submenu
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton isActive={item.isActive} tooltip={item.title} asChild>
                                    <Link to={item.url}>
                                        {item.icon && item.icon}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}

export default NavMain;