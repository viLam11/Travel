"use client"

import { Building2, LayoutDashboard, MessageSquare, Hotel, ChevronRight } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/admin/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/admin/collapsible"

const menuItems = [
  {
    title: "Tổng quan",
    icon: LayoutDashboard,
    href: "#",
  },
  {
    title: "Quản lý khách sạn",
    icon: Hotel,
    href: "#",
    submenu: [
      { title: "Check-in/Check-out", href: "#" },
      { title: "Dịch vụ phòng", href: "#" },
      { title: "Danh sách khách hàng", href: "#" },
    ],
  },
  {
    title: "Tin nhắn",
    icon: MessageSquare,
    href: "#",
  },
]

export function DashboardSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-orange-500">viatours</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <Collapsible key={item.title} defaultOpen={item.title === "Quản lý khách sạn"} asChild>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton asChild>
                    <a href={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                      {item.submenu && (
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                      )}
                    </a>
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                {item.submenu && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.submenu.map((sub) => (
                        <SidebarMenuSubItem key={sub.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={sub.href}>{sub.title}</a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
