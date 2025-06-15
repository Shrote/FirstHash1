"use client";
import { v4 as uuidv4 } from "uuid";
import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Salary() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editedData, setEditedData] = useState({
    company: "",
    paidSalary: "",
    salaryStatus: "unpaid",
  });
  const [companies, setCompanies] = useState([]);
  const [selectedMonthYear, setSelectedMonthYear] = useState(() => {
    const now = new Date();
    return `${now.getMonth() + 1}-${now.getFullYear()}`; // e.g., "6-2025"
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestore, "users"),
      (snapshot) => {
        const fetchedUsers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(fetchedUsers);
      }
    );
    fetchCompanies();

    return () => unsubscribe();
  }, []);

  const fetchCompanies = async () => {
    try {
      const docRef = doc(firestore, "dropdownMenu", "companyName");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const companyList = Object.entries(data).map(([id, company]) => ({
          id,
          name: company.name,
        }));
        setCompanies(companyList);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load companies",
      });
    }
  };

  const openEditDialog = (user) => {
    setEditingUser(user);
    setEditedData({
      paidSalary: "",
      salaryStatus: user.salaryStatus || "unpaid",
    });
  };

  const handleSave = async () => {
    if (!editingUser || !editedData.company) return;

    const monthYearKey = formatMonthYear(selectedMonthYear);
    const userRef = doc(firestore, "users", editingUser.id);
    try {
      // Fetch latest user data
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const salaryHistory = userData.salaryHistory || {};

      // Update salary history for current month
      salaryHistory[monthYearKey] = {
        paidSalary: editedData.paidSalary,
        salaryStatus: editedData.salaryStatus,
      };

      // Update user document
      await updateDoc(userRef, {
        salaryHistory,
      });

      // Add account transaction if status is paid
      if (editedData.salaryStatus === "paid") {
        const monthYearKey = `${new Date().toLocaleString("default", {
          month: "long",
        })}-${new Date().getFullYear()}`;

        const uniqueId = uuidv4();

        const accountRef = doc(firestore, "accounts", monthYearKey);

        await setDoc(
          accountRef,
          {
            [uniqueId]: {
              type: "debit",
              amount: Number(editedData.paidSalary),
              description: `Salary paid to ${editingUser.name}`,
              userId: editingUser.id,
              companyId: editedData.company,
              date: new Date(),
            },
          },
          { merge: true }
        );
      }

      toast.success("Salary updated and transaction logged");
      setEditingUser(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update salary");
    }
  };

  function generateLast12Months() {
    const result = [];
    const date = new Date();
    for (let i = 0; i < 12; i++) {
      result.push(`${date.getMonth() + 1}-${date.getFullYear()}`);
      date.setMonth(date.getMonth() - 1);
    }
    return result;
  }

  function formatMonthYear(monthKey) {
    const [month, year] = monthKey.split("-");
    const date = new Date(`${year}-${month.padStart(2, "0")}-01`);
    const monthName = date.toLocaleString("default", { month: "long" });
    return `${monthName}-${year}`;
  }

  return (
    <>
      <header className="flex h-16 items-center gap-2 px-4">
        <div className="flex items-center gap-2 w-full">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Salary</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="space-y-6 p-6">
        <h2 className="text-3xl font-semibold text-gray-900">
          Employee Salary Details
        </h2>

        <Table className="overflow-x-auto shadow-md rounded-lg">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Salary</TableHead>
              <TableHead>
                <div className="flex flex-col">
                  <span>Paid Salary</span>
                  <select
                    value={selectedMonthYear}
                    onChange={(e) => setSelectedMonthYear(e.target.value)}
                    className="mt-1 text-sm border rounded px-2 py-1"
                  >
                    {generateLast12Months().map((monthKey) => (
                      <option key={monthKey} value={monthKey}>
                        {formatMonthYear(monthKey)}
                      </option>
                    ))}
                  </select>
                </div>
              </TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map((user) => {
              const history = user.salaryHistory || {};
              const monthlyData =
                history[formatMonthYear(selectedMonthYear)] || {};
              return (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        monthlyData.salaryStatus === "paid"
                          ? "default"
                          : "outline"
                      }
                    >
                      {monthlyData.salaryStatus || "unpaid"}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.salary || 0}</TableCell>
                  <TableCell>{monthlyData.paidSalary || 0}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          disabled={monthlyData.salaryStatus === "paid"}
                          onClick={() => openEditDialog(user)}
                        >
                          Pay
                        </Button>
                      </DialogTrigger>
                      {editingUser?.id === user.id && (
                        <DialogContent className="max-w-md space-y-4">
                          <DialogHeader>
                            <DialogTitle>
                              Edit Salary - {editingUser.name}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2">
                            <Label>Deduct From (Company)</Label>
                            <Select
                              onValueChange={(value) =>
                                setEditedData((prev) => ({
                                  ...prev,
                                  company: value,
                                }))
                              }
                              value={editedData.company}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select company" />
                              </SelectTrigger>
                              <SelectContent>
                                {companies.map((company) => (
                                  <SelectItem
                                    key={company.id}
                                    value={company.id}
                                  >
                                    {company.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Label>Paid Salary</Label>
                            <Input
                              type="number"
                              value={editedData.paidSalary}
                              onChange={(e) =>
                                setEditedData((prev) => ({
                                  ...prev,
                                  paidSalary: Number(e.target.value),
                                }))
                              }
                            />
                            <Label>Status</Label>
                            <select
                              className="w-full border rounded px-2 py-1"
                              value={editedData.salaryStatus || ""}
                              onChange={(e) =>
                                setEditedData((prev) => ({
                                  ...prev,
                                  salaryStatus: e.target.value,
                                }))
                              }
                            >
                              <option value="">Select Status</option>
                              <option value="paid">Paid</option>
                              <option value="unpaid">Unpaid</option>
                            </select>
                          </div>
                          <div className="flex justify-end">
                            <Button onClick={handleSave}>Save</Button>
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export default Salary;
