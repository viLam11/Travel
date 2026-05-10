import * as React from "react"
import { Link } from "react-router-dom"
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/admin/sidebar"

const NavSecondary = ({
    items,
    ...props
}: {
    items: {
        title: string
        url?: string
        icon: React.ReactNode
        onClick?: (e: React.MouseEvent) => void
        disabled?: boolean
    }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) => {
    return (
        <SidebarGroup {...props}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const content = (
                            <>
                                {item.icon}
                                <span>{item.title}</span>
                            </>
                        );
                        
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton 
                                    asChild={true} 
                                    size="sm"
                                    title={item.disabled ? "Tính năng đang phát triển" : item.title}
                                >
                                    {item.url ? (
                                        <Link 
                                            to={item.url} 
                                            onClick={(e) => {
                                                if (item.disabled) e.preventDefault();
                                                if (item.onClick) item.onClick(e);
                                            }}
                                            className={item.disabled ? "opacity-60 cursor-not-allowed pointer-events-none" : "cursor-pointer"}
                                        >
                                            {content}
                                        </Link>
                                    ) : (
                                        <button 
                                            type="button" 
                                            onClick={(e) => {
                                                if (item.disabled) e.preventDefault();
                                                if (item.onClick) item.onClick(e);
                                            }}
                                            className={item.disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                                        >
                                            {content}
                                        </button>
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}

export default NavSecondary;