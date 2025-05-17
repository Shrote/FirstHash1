"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

const metadata = {
  title: "Bizz Suite",
  description: "Developed by Shrote",
};

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const hideSidebarRoutes = ['/login'];

  const showSidebar = !hideSidebarRoutes.includes(pathname);
  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarProvider>
          {showSidebar && <AppSidebar />}
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
