"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  Bot,
  User,
  Warehouse,
  LayoutDashboardIcon,
  BoxIcon,
  QrCode,
  Truck,
  Package,
  Bell,
  Factory,
  Store,
  ScrollText,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavInventory } from "./nav-inventory"
import { NavQr } from "./nav-qr"
import { NavOrder } from "./nav-order"
import { NavProduction } from "./nav-production"

export function AppSidebar({ ...props }) {
  const pathname = usePathname() // Get the current route path
  const [userAccessLevels, setUserAccessLevels] = React.useState(null)
  const [userType, setUserType] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [userEmail,setUserEmail]= React.useState(null)

  
  // Fetch user access levels from localStorage on component mount
  React.useEffect(() => {
    const fetchUserData = () => {
      try {
        // Get user data from localStorage
        const accessLevelsStr = localStorage.getItem("userAccessLevels")
        const userTypeStr = localStorage.getItem("userType")
        setUserEmail(localStorage.getItem("userName"))
        if (accessLevelsStr) {
          const accessLevels = JSON.parse(accessLevelsStr)
          setUserAccessLevels(accessLevels)
        }

        if (userTypeStr) {
          setUserType(userTypeStr)
        }
      } catch (error) {
        console.error("Error fetching user access levels:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Define navigation data
  const data = {
  user: {
    name: userEmail,
    email: userEmail,
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    { title: "Dashboard", icon: LayoutDashboardIcon, href: "/dashboard", permission: "dashboard" },
    { title: "Logs", icon: Warehouse, href: "/logs", permission: "logs" },
  ],
  navSecondary: [
    { title: "Alerts", icon: Bell, href: "/alerts", permission: "alerts" },
  ],
  projects: [
    { title: "Project Alpha", icon: BoxIcon, href: "/projects/alpha", permission: "projects" },
  ],
  inventory: [
    { title: "Inventory", icon: BoxIcon, href: "/inventory", permission: "inventory" },
  ],
  qr: [
    { title: "QR Code", icon: QrCode, href: "/qr", permission: "qr" },
  ],
  order: [
    { title: "Orders", icon: Truck, href: "/orders", permission: "orders" },
  ],
  production: [
    { title: "Production", icon: Factory, href: "/production", permission: "production" },
  ],
}



  // Helper function to check if user has access to a specific permission
  const hasAccess = (permission) => {
    if (!userAccessLevels) return false;
    if (permission === "admin") {
      return userType === "admin"; // Only allow admin users
    }
    return userAccessLevels[permission] === "true";
  };
  
  // Filter navigation items based on user permissions
  const filterItemsByPermission = (items) => {
    return items.filter((item) => hasAccess(item.permission))
  }

  // Check if any items in a section have permission
  const hasSectionAccess = (items) => {
    return items.some((item) => hasAccess(item.permission))
  }

  // If still loading, show a simplified sidebar
  if (isLoading) {
    return (
      <Sidebar variant="inset" {...props}>
        <SidebarHeader className="flex justify-center items-center h-[140px] py-0 overflow-visible">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="#" className="flex justify-center items-center w-full h-full">
                  <img src="/images/qpo_logo1.png" alt="qpo" className="object-contain h-full w-auto" />
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>{/* Loading state */}</SidebarContent>
      </Sidebar>
    )
  }

  // Filter navigation items based on permissions
  const filteredNavMain = filterItemsByPermission(data.navMain)
  const filteredNavSecondary = filterItemsByPermission(data.navSecondary)
  const filteredProjects = filterItemsByPermission(data.projects)
  const filteredInventory = filterItemsByPermission(data.inventory)
  const filteredQr = filterItemsByPermission(data.qr)
  const filteredOrder = filterItemsByPermission(data.order)
  const filteredProduction = filterItemsByPermission(data.production)

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="flex justify-center items-center h-[140px] py-0 overflow-visible">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#" className="flex justify-center items-center w-full h-full">
                <img src="/images/qpo_logo1.png" alt="qpo" className="object-contain h-full w-auto" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Only render sections if user has access to at least one item in that section */}
        {filteredNavMain.length > 0 && <NavMain items={filteredNavMain} />}
        {filteredProjects.length > 0 && <NavProjects projects={filteredProjects} />}
        {filteredInventory.length > 0 && <NavInventory inventory={filteredInventory} />}
        {filteredProduction.length > 0 && <NavProduction production={filteredProduction} />}
        {filteredQr.length > 0 && <NavQr qr={filteredQr} />}
        {filteredOrder.length > 0 && <NavOrder order={filteredOrder} />}
        {filteredNavSecondary.length > 0 && <NavSecondary items={filteredNavSecondary} className="mt-auto" />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ ...data.user, role: userType }} />
      </SidebarFooter>
    </Sidebar>
  )
}

