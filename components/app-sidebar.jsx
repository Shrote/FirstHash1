"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  Warehouse,
  Building2Icon,
  Factory,
  User2,
  CalendarCheck,
  ClipboardList,
  ListChecks,
  Database,
  Receipt,
  FolderKanban,
  Users2,
  IndianRupee,
} from "lucide-react";


import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Helper function to safely parse access levels from localStorage
function parseAccessLevels(str) {
  try {
    const raw = JSON.parse(str);
    return Object.fromEntries(
      Object.entries(raw).map(([key, value]) => [
        key,
        value === true || value === "true",
      ])
    );
  } catch {
    return {};
  }
}

export function AppSidebar({ ...props }) {
  const pathname = usePathname();
  const [userAccessLevels, setUserAccessLevels] = React.useState(null);
  const [userType, setUserType] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [userEmail, setUserEmail] = React.useState(null);

  React.useEffect(() => {
    const fetchUserData = () => {
      try {
        const accessLevelsStr = localStorage.getItem("userAccessLevels");
        const userTypeStr = localStorage.getItem("userType");
        const userEmailStr = localStorage.getItem("userName");

        console.log("Fetched userAccessLevels:", accessLevelsStr);
        console.log("Fetched userType:", userTypeStr);
        console.log("Fetched userEmail:", userEmailStr);

        if (accessLevelsStr) {
          const accessLevels = parseAccessLevels(accessLevelsStr);
          setUserAccessLevels(accessLevels);
        } else {
          // fallback for development
          setUserAccessLevels({
            dashboard: true,
            user: true,
            logs: true,
          });
        }

        if (userTypeStr) setUserType(userTypeStr);
        if (userEmailStr) setUserEmail(userEmailStr);
      } catch (error) {
        console.error("Error fetching user access levels:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const data = {
    user: {
      name: userEmail,
      email: userEmail,
      avatar: "/avatars/shadcn.jpg",
    },
   navMain: [
  {
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    href: "/dashboard",
    permission: "dashboard",
  },
  {
    title: "Employee",
    icon: Building2Icon,
    href: "/user",
    permission: "user",
  },
  {
    title: "Company",
    icon: Factory,
    href: "/company",
    permission: "company",
  },
  {
    title: "Client",
    icon: User2, // 👤 Consider `UsersIcon` if it's a list
    href: "/client",
    permission: "client",
  },
  {
    title: "Attendence",
    icon: CalendarCheck, // 📅
    href: "/attendence",
    permission: "attendence",
  },
  {
    title: "Daily Tasks",
    icon: ClipboardList, // 📝
    href: "/daily-task",
    permission: "daily-task",
  },
  {
    title: "Project Tasks",
    icon: ListChecks, // ✅
    href: "/project-task",
    permission: "project-task",
  },
  {
    title: "Billing",
    icon: Receipt, // 🧾
    href: "/billing",
    permission: "billing",
  },
  {
    title: "Project",
    icon: FolderKanban, // 🗂️
    permission: "project",
    href: "/project",
    children: [
      { title: "All Projects", href: "/project/all", key: "all" },
      // { title: "New Project", href: "/project/new", key: "new" },
      { title: "Deliverables", href: "/project/deliverables", key: "deliverables" },
    ],
  },
  {
    title: "Salary",
    icon: IndianRupee, // ₹
    permission: "salary",
    href: "/salary",
    children: [
      { title: "Pending", href: "/salary/pending", key: "pending" },
      { title: "Paid", href: "/salary/paid", key: "paid" },
    ],
  },
],

  };

  const hasAccess = (permission) => {
    if (!userAccessLevels) return false;
    if (permission === "admin") {
      return userType === "admin";
    }
    return !!userAccessLevels[permission];
  };

  const filterItemsByPermission = (items) => {
    return items.filter((item) => hasAccess(item.permission));
  };

  if (isLoading) {
    return (
      <Sidebar variant="inset" {...props}>
        <SidebarHeader className="flex justify-center items-center h-[140px] py-0 overflow-visible">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a
                  href="#"
                  className="flex justify-center items-center w-full h-full"
                >
                  <img
                    src="/images/logo.png"
                    alt="Bizz Suite"
                    className="object-contain h-[130px]"
                  />
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent />
      </Sidebar>
    );
  }

  const filteredNavMain = filterItemsByPermission(data.navMain);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="flex justify-center items-center h-[140px] py-0 overflow-visible">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a
                href="#"
                className="flex justify-center items-center w-full h-full"
              >
                <img
                  src="/images/logo.png"
                  alt="Bizz Suite"
                  className="object-contain h-[130px]"
                />
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
  );
}
