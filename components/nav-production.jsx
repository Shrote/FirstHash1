"use client";

import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavProduction({ production }) {
  const { isMobile } = useSidebar();
  const pathname = usePathname();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Manufacturing Unit</SidebarGroupLabel>
      <SidebarMenu>
        {production.map((item) => {
          const isActive = pathname === item.url || pathname.startsWith(item.url);

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                className={`${isActive
                    ? "bg-gray-800 text-white hover:bg-gray-500 hover:text-white"
                    : "hover:bg-gray-500 hover:text-white text-gray-800"
                  }`}
              >
                <a href={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
