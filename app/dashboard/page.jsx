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
import {
  collection,
  getCountFromServer,
  query,
  doc,
  getDoc,
  getDocs,
  where,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  ClipboardList,
  Folder,
  IndianRupee,
  Info,
  Users,
  LineChart,
  Activity,
  Badge,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

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

export default function DashboardPage() {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [companyDetails, setCompanyDetails] = useState(null);
  const [revenueTrendData, setRevenueTrendData] = useState(null);
  const [counts, setCounts] = useState({
    users: 0,
    projects: 0,
    tasks: 0,
    balance: 0,
  });
  const [isFetchingCounts, setIsFetchingCounts] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const formatIndianNumber = (value) => {
    if (typeof value !== "number") return "0";
    if (value >= 10000000) return (value / 10000000).toFixed(2) + " Cr";
    if (value >= 100000) return (value / 100000).toFixed(2) + " Lakh";
    if (value >= 1000) return (value / 1000).toFixed(2) + " K";
    return value.toString();
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { color: "#64748b" } },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#fff",
        bodyColor: "#cbd5e1",
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ₹${formatIndianNumber(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(203, 213, 225, 0.1)" },
        ticks: { color: "#94a3b8" },
      },
      y: {
        grid: { color: "rgba(203, 213, 225, 0.1)" },
        ticks: {
          color: "#94a3b8",
          callback: (v) => `₹${formatIndianNumber(v)}`,
        },
      },
    },
  };

  useEffect(() => {
    const stored = localStorage.getItem("selectedCompany");
    if (stored) setSelectedCompany(stored);
  }, []);

  useEffect(() => {
    const fetchUserCount = async () => {
      if (!selectedCompany) return 0;
      
      try {
        const allUsersSnap = await getDocs(collection(firestore, "users"));
        const filteredUsers = allUsersSnap.docs.filter(doc => {
          const assignedCompany = doc.data().assignedCompany;
          return assignedCompany && assignedCompany[selectedCompany];
        });
        return filteredUsers.length;
      } catch (err) {
        console.error("Error fetching users:", err);
        toast.error("Failed to fetch user count");
        return 0;
      }
    };

    const fetchProjectCount = async () => {
      if (!selectedCompany) return 0;
      
      try {
        const projectsRef = collection(firestore, "projects");
        const q = query(projectsRef, where("companyId", "==", selectedCompany));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
      } catch (err) {
        console.error("Error fetching projects:", err);
        toast.error("Failed to fetch project count");
        return 0;
      }
    };

    const fetchPendingTasksCount = async () => {
      if (!selectedCompany) return 0;
      
      try {
        const tasksRef = collection(firestore, "project_tasks");
        const q = query(
          tasksRef, 
          where("companyName", "==", selectedCompany),
          where("status", "in", ["ongoing", "pending"])
        );
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
      } catch (err) {
        console.error("Error fetching tasks:", err);
        toast.error("Failed to fetch task count");
        return 0;
      }
    };

    const fetchBalance = async () => {
      if (!selectedCompany) return 0;
      
      try {
        const accountsDoc = await getDoc(doc(firestore, "accounts", "June-2025"));
        if (!accountsDoc.exists()) return 0;
        
        const transactions = Object.values(accountsDoc.data());
        let balance = 0;
        
        transactions.forEach(transaction => {
          if (transaction.companyId === selectedCompany) {
            if (transaction.type === "credit") {
              balance += transaction.amount;
            } else if (transaction.type === "debit") {
              balance -= transaction.amount;
            }
          }
        });
        
        return balance;
      } catch (err) {
        console.error("Error fetching balance:", err);
        toast.error("Failed to fetch balance");
        return 0;
      }
    };

    const fetchDetails = async () => {
      if (!selectedCompany) {
        setCompanyDetails(null);
        setRevenueTrendData(null);
        return;
      }

      setIsLoadingDetails(true);
      try {
        const detailsSnap = await getDoc(
          doc(firestore, selectedCompany, "details")
        );

        if (detailsSnap.exists()) {
          setCompanyDetails(detailsSnap.data());
        } else {
          toast.error("No company details found.");
          setCompanyDetails(null);
        }

        // Revenue from accounts/June-2025
        const revenueDoc = await getDoc(doc(firestore, "accounts", "June-2025"));

        if (!revenueDoc.exists()) {
          toast.error("No revenue data found.");
          setRevenueTrendData(null);
        } else {
          const rawData = revenueDoc.data();
          const entries = Object.values(rawData).filter(
            (entry) => entry.companyId === selectedCompany
          );

          const daily = {};
          entries.forEach(({ amount, date, type }) => {
            const d = date.toDate().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
            });

            if (!daily[d]) daily[d] = { credit: 0, debit: 0 };
            if (type === "credit") daily[d].credit += amount;
            if (type === "debit") daily[d].debit += amount;
          });

          const labels = Object.keys(daily).sort((a, b) => {
            const getDate = (s) => new Date(Date.parse(s + " 2025"));
            return getDate(a) - getDate(b);
          });

          const revenueChart = {
            labels,
            datasets: [
              {
                label: "Credit",
                data: labels.map((d) => daily[d].credit),
                borderColor: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.2)",
                fill: true,
              },
              {
                label: "Debit",
                data: labels.map((d) => daily[d].debit),
                borderColor: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.2)",
                fill: true,
              },
            ],
          };

          setRevenueTrendData(revenueChart);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch company or revenue details.");
      } finally {
        setIsLoadingDetails(false);
      }
    };

    const fetchCounts = async () => {
      if (!selectedCompany) return;
      
      setIsFetchingCounts(true);
      try {
        const [userCount, projectCount, taskCount, balance] = await Promise.all([
          fetchUserCount(),
          fetchProjectCount(),
          fetchPendingTasksCount(),
          fetchBalance()
        ]);

        setCounts({
          users: userCount,
          projects: projectCount,
          tasks: taskCount,
          balance: balance,
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch dashboard counts.");
      } finally {
        setIsFetchingCounts(false);
      }
    };

    fetchDetails();
    fetchCounts();
  }, [selectedCompany]);

  const statWidgets = [
    { title: "Total Users", value: counts.users, icon: Users },
    { title: "Projects", value: counts.projects, icon: Folder },
    { title: "Pending Tasks", value: counts.tasks, icon: ClipboardList },
    {
      title: "Balance",
      value: `₹${formatIndianNumber(counts.balance)}`,
      icon: IndianRupee,
    },
  ];

  return (
    <SidebarProvider>
      <SidebarInset className="bg-gray-50 dark:bg-gray-900">
        <Toaster position="top-right" />
        <header className="flex h-16 items-center px-6 bg-white dark:bg-gray-950 shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-6" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-lg font-semibold">
                  Dashboard
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <CompanySelection
              selectedCompany={selectedCompany}
              setSelectedCompany={(c) => {
                setSelectedCompany(c);
                localStorage.setItem("selectedCompany", c);
              }}
              className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-md"
            />
          </div>
        </header>

        <div className="p-6 flex flex-col gap-6 overflow-auto">
          <Card className="shadow-md">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">
                  Company Details: {selectedCompany || "–"}
                </CardTitle>
                <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-800">
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {companyDetails ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{companyDetails.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{companyDetails.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{companyDetails.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Person</p>
                    <p className="font-medium">{companyDetails.contactPerson}</p>
                  </div>
                </>
              ) : (
                <div className="col-span-4 py-6 text-center text-muted-foreground">
                  <Info className="mx-auto h-8 w-8 mb-2" />
                  <p>No company details available.</p>
                  <p className="text-sm">Select a company to view details.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statWidgets.map((s, i) => (
              <Card key={i} className="shadow-sm">
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm">{s.title}</CardTitle>
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {isFetchingCounts ? "Loading..." : "Updated now"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>
                    Credit vs Debit transactions over time
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-gray-100 text-gray-800">
                    <Activity className="h-3 w-3 mr-1" />
                    Live Data
                  </Badge>
                  <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
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
                    {isLoadingDetails
                      ? "Loading revenue data..."
                      : "No revenue data available."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}