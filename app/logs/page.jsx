"use client";

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

// Sample data for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const productPerformance = [
  { name: "Product A", sales: 4000, revenue: 24000 },
  { name: "Product B", sales: 3000, revenue: 18000 },
  { name: "Product C", sales: 2000, revenue: 12000 },
  { name: "Product D", sales: 2780, revenue: 16680 },
  { name: "Product E", sales: 1890, revenue: 11340 },
];

export default function Page() {
  

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* <NotificationHandler /> */}
        <Toaster position="top-right" reverseOrder={false} />
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
          <div className="flex items-center gap-2 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Logs</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            {/* <div className="ml-auto flex items-center gap-2">
              <Select defaultValue={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Today</SelectItem>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="financialYear">
                    This Financial Year
                  </SelectItem>
                  <SelectItem value="lastFinancialYear">
                    Last Financial Year
                  </SelectItem>
                  <SelectItem value="yearly">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div> */}
          </div>
        </header>
        
      </SidebarInset>
    </SidebarProvider>
  );
}
