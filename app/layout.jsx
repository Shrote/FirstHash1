"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { usePathname } from "next/navigation";
import { UserProvider } from "@/context/userContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const hideSidebarRoutes = ["/login"];
  const showSidebar = !hideSidebarRoutes.includes(pathname);
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <SidebarProvider>
            {showSidebar && <AppSidebar />}
            <SidebarInset>{children}</SidebarInset>
          </SidebarProvider>
        </UserProvider>
      </body>
    </html>
  );
}
