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
import { messaging, firestore } from "@/lib/firebase";
import { getToken } from "firebase/messaging";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BaggageClaim,
  IndianRupee,
  ShoppingBag,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import * as Recharts from "recharts";

export default function Page() {
  const [selectedCompany, setSelectedCompany] = useState(""); // ✅ Hook in component body

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
              {/* ✅ This is the correct way to use CompanySelection */}
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
