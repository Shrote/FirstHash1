"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useRouter } from "next/navigation";

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

function Salary() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editedData, setEditedData] = useState({
    totalSalary: "",
    paidSalary: "",
    salaryStatus: "unpaid",
  });

  const selectedCompany = typeof window !== "undefined" ? localStorage.getItem("selectedCompany") : null;

  useEffect(() => {
    if (!selectedCompany) return;

    const unsubscribe = onSnapshot(collection(firestore, "users"), (snapshot) => {
      const filteredUsers = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((user) => user.assignedCompany?.[selectedCompany]);
      setUsers(filteredUsers);
    });

    return () => unsubscribe();
  }, [selectedCompany]);

  const openEditDialog = (user) => {
    const companyData = user.assignedCompany[selectedCompany] || {};
    setEditingUser(user);
    setEditedData({
      totalSalary: companyData.totalSalary || "",
      paidSalary: companyData.paidSalary || "",
      salaryStatus: companyData.status || "unpaid",
    });
  };

 const handleSave = async () => {
  if (!editingUser) return;

  try {
    const userRef = doc(firestore, "users", editingUser.id);

    // Keep other fields inside the selected company map
    const previousCompanyData = editingUser.assignedCompany?.[selectedCompany] || {};

    const updatedCompanyData = {
      ...editingUser.assignedCompany,
      [selectedCompany]: {
        ...previousCompanyData, // retain old fields
        ...editedData,          // override only edited fields
      },
    };

    await updateDoc(userRef, {
      assignedCompany: updatedCompanyData,
    });

    toast.success("Salary data updated");
    setEditingUser(null);
  } catch (err) {
    toast.error("Failed to update salary");
    console.error(err);
  }
};


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
        <h2 className="text-3xl font-semibold text-gray-900">Employee Salary Details</h2>

        <Table className="overflow-x-auto shadow-md rounded-lg">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Salary</TableHead>
              <TableHead>Paid Salary</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const companyData = user.assignedCompany[selectedCompany] || {};
              return (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Badge variant={companyData.salaryStatus === "paid" ? "default" : "outline"}>
                      {companyData.salaryStatus || "unpaid"}
                    </Badge>
                  </TableCell>
                  <TableCell>{companyData.totalSalary || 0}</TableCell>
                  <TableCell>{companyData.paidSalary || 0}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button onClick={() => openEditDialog(user)}>Edit</Button>
                      </DialogTrigger>
                      {editingUser?.id === user.id && (
                        <DialogContent className="max-w-md space-y-4">
                          <DialogHeader>
                            <DialogTitle>Edit Salary - {editingUser.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2">
                            <Label>Total Salary</Label>
                            <Input
                              type="number"
                              value={editedData.totalSalary}
                              onChange={(e) =>
                                setEditedData((prev) => ({
                                  ...prev,
                                  totalSalary: Number(e.target.value),
                                }))
                              }
                            />
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
  <option value="">
    Select Status
  </option>
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
