"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  LayoutDashboardIcon,
  Warehouse,
  Building2Icon
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
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

export function AppSidebar({ ...props }) {
  const pathname = usePathname()
  const [userAccessLevels, setUserAccessLevels] = React.useState(null)
  const [userType, setUserType] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [userEmail, setUserEmail] = React.useState(null)

  React.useEffect(() => {
    const fetchUserData = () => {
      try {
        const accessLevelsStr = localStorage.getItem("userAccessLevels")
        const userTypeStr = localStorage.getItem("userType")
        const userEmailStr = localStorage.getItem("userName")

        console.log("Fetched userAccessLevels:", accessLevelsStr)
        console.log("Fetched userType:", userTypeStr)
        console.log("Fetched userEmail:", userEmailStr)

        if (accessLevelsStr) {
          const accessLevels = JSON.parse(accessLevelsStr)
          setUserAccessLevels(accessLevels)
        } else {
          // fallback for development
          setUserAccessLevels({
            dashboard: "true",
            user: "true",
            logs: "true"
          })
        }

        if (userTypeStr) setUserType(userTypeStr)
        if (userEmailStr) setUserEmail(userEmailStr)
      } catch (error) {
        console.error("Error fetching user access levels:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const data = {
    user: {
      name: userEmail,
      email: userEmail,
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      { title: "Dashboard", icon: LayoutDashboardIcon, href: "/dashboard", permission: "dashboard" },
      { title: "User", icon: Building2Icon, href: "/user", permission: "user" },
      { title: "Logs", icon: Warehouse, href: "/logs", permission: "logs" },
    ],
  }

  const hasAccess = (permission) => {
    if (!userAccessLevels) return false
    if (permission === "admin") {
      return userType === "admin"
    }
    return userAccessLevels[permission] === "true"
  }

  const filterItemsByPermission = (items) => {
    return items.filter((item) => hasAccess(item.permission))
  }

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
        <SidebarContent />
      </Sidebar>
    )
  }

  const filteredNavMain = filterItemsByPermission(data.navMain)

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
        {filteredNavMain.length > 0 && <NavMain items={filteredNavMain} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ ...data.user, role: userType || "user" }} />
      </SidebarFooter>
    </Sidebar>
  )
}
