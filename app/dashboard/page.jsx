"use client";

// import { useState } from "react";
import CompanySelection from "./companyselection";
import { useState, useEffect, useMemo } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import toast, { Toaster } from "react-hot-toast";

export default function Page() {
  const [selectedCompany, setSelectedCompany] = useState("");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Toaster position="top-right" reverseOrder={false} />
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
          <div className="flex items-center gap-2 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center gap-2">
              <CompanySelection
                selectedCompany={selectedCompany}
                setSelectedCompany={setSelectedCompany}
              />
            </div>
          </div>
        </header>
      </SidebarInset>
    </SidebarProvider>
  );
}
