"use client";

import { useState, useEffect } from "react";
import CompanySelection from "./companyselection";
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
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  Folder,
  IndianRupee,
  Info,
  MessageSquare,
  Users,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  AlertTriangle,
  Badge
} from "lucide-react"; // ✅ Correct


// Register ChartJS components
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Page() {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [companyDetails, setCompanyDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [revenueTrendData, setRevenueTrendData] = useState(null);

  // Sample data - replace with your actual data fetching
  const sampleRevenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Credit',
        data: [50000, 60000, 55000, 70000, 80000, 75000, 90000],
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.15)',
        tension: 0.4,
        borderWidth: 2,
        fill: true,
        pointBackgroundColor: '#16a34a',
        pointRadius: 5,
        pointHoverRadius: 6,
      },
      {
        label: 'Debit',
        data: [30000, 35000, 40000, 45000, 50000, 55000, 60000],
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.15)',
        tension: 0.4,
        borderWidth: 2,
        fill: true,
        pointBackgroundColor: '#dc2626',
        pointRadius: 5,
        pointHoverRadius: 6,
      },
    ],
  };

  // Chart options with styling from your reference
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#64748b', // slate-500
        }
      },
      tooltip: {
        backgroundColor: '#1e293b', // slate-800
        titleColor: '#fff',
        bodyColor: '#cbd5e1', // slate-300
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ₹${formatIndianNumber(context.raw)}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(203, 213, 225, 0.1)',
        },
        ticks: {
          color: '#94a3b8', // slate-400
        },
      },
      y: {
        grid: {
          color: 'rgba(203, 213, 225, 0.1)',
        },
        ticks: {
          color: '#94a3b8', // slate-400
          callback: function(value) {
            return `₹${formatIndianNumber(value)}`;
          }
        },
      },
    },
  };

  // Load company from localStorage
  useEffect(() => {
    const storedCompany = localStorage.getItem("selectedCompany");
    if (storedCompany) {
      setSelectedCompany(storedCompany);
    }
  }, []);

  // Fetch company details
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!selectedCompany) return;
      
      setIsLoading(true);
      try {
        const detailsDocRef = doc(firestore, selectedCompany, "details");
        const snapshot = await getDoc(detailsDocRef);
        
        if (snapshot.exists()) {
          setCompanyDetails(snapshot.data());
          setRevenueTrendData(sampleRevenueData);
        } else {
          setCompanyDetails(null);
          setRevenueTrendData(null);
          toast.error("No company details found.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch company data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, [selectedCompany]);

  const formatIndianNumber = (value) => {
    if (typeof value !== "number") return "0";
    if (value >= 10000000) {
      return (value / 10000000).toFixed(2) + " Cr";
    } else if (value >= 100000) {
      return (value / 100000).toFixed(2) + " Lakh";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(2) + " K";
    }
    return value.toString();
  };

  return (
    <SidebarProvider>
      <SidebarInset className="bg-gray-50 dark:bg-gray-900">
        <Toaster position="top-right" reverseOrder={false} />
        <header className="flex h-16 shrink-0 items-center gap-2 px-6 border-b bg-white dark:bg-gray-950 shadow-sm">
          <div className="flex items-center gap-2 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-lg font-semibold">Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="ml-auto flex items-center gap-3">
              <CompanySelection
                selectedCompany={selectedCompany}
                setSelectedCompany={(value) => {
                  setSelectedCompany(value);
                  localStorage.setItem("selectedCompany", value);
                }}
                className="bg-gray-100 dark:bg-gray-800 rounded-md px-3 py-1.5"
              />
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 pt-6 overflow-auto">
          {/* Company Details Card */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Company Details: {selectedCompany || "No Company Selected"}
                </CardTitle>
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-800">
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {companyDetails ? (
                <>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Company Name</p>
                    <p className="font-medium">{companyDetails.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="font-medium">{companyDetails.address}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="font-medium">{companyDetails.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                    <p className="font-medium">{companyDetails.contactPerson}</p>
                  </div>
                </>
              ) : (
                <div className="col-span-4 flex flex-col items-center justify-center py-6 text-center">
                  <Info className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No company details available</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select a company from the dropdown above to view details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Total Users", value: 123, icon: Users },
              { title: "Projects", value: 18, icon: Folder },
              { title: "Pending Tasks", value: 47, icon: ClipboardList },
              { title: "Balance", value: formatIndianNumber(1250000), icon: IndianRupee },
            ].map((item, i) => (
              <Card key={i} className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{item.value}</div>
                  <p className="text-xs text-muted-foreground">Updated now</p>
                </CardContent>
              </Card>
            ))}
          </div>





          {/* Revenue Trend Graph */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
                  <CardDescription>Credit vs Debit transactions over time</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                    <Activity className="h-3 w-3 mr-1" />
                    Live Data
                  </Badge>
                  <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
                    <LineChart className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              {revenueTrendData ? (
                <Line options={chartOptions} data={revenueTrendData} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    {isLoading ? "Loading revenue data..." : "No revenue data available"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* ... (your existing summary cards) ... */}
          </div>

          {/* Enhanced Recent Activity Section */}
          {/* <Card className="border-none shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                  <CardDescription>Latest transactions and system events</CardDescription>
                </div>
                <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                  Last 7 days
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {[
                  {
                    icon: FileText,
                    title: "Invoice Paid",
                    description: "Payment received for invoice #INV-2023-105",
                    amount: "₹25,000",
                    type: "credit",
                    time: "2 hours ago",
                    status: "completed"
                  },
                  {
                    icon: AlertTriangle,
                    title: "Expense Recorded",
                    description: "Office supplies purchase",
                    amount: "₹12,500",
                    type: "debit",
                    time: "1 day ago",
                    status: "completed"
                  },
                  {
                    icon: CheckCircle2,
                    title: "Payment Approved",
                    description: "Vendor payment approved",
                    amount: "₹50,000",
                    type: "debit",
                    time: "2 days ago",
                    status: "pending"
                  },
                  {
                    icon: Users,
                    title: "New User Added",
                    description: "Account created for new team member",
                    amount: "",
                    type: "system",
                    time: "3 days ago",
                    status: "completed"
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className={`rounded-full p-3 ${
                      activity.type === "credit" 
                        ? "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300" 
                        : activity.type === "debit"
                          ? "bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-300"
                          : "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300"
                    }`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{activity.title}</h3>
                        {activity.amount && (
                          <span className={`font-medium ${
                            activity.type === "credit" ? "text-green-600" : "text-red-600"
                          }`}>
                            {activity.amount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                        {activity.status === "pending" && (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {!companyDetails && (
                  <div className="p-6 text-center text-muted-foreground">
                    <Info className="h-6 w-6 mx-auto mb-2" />
                    <p>Select a company to view real activity data</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card> */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}