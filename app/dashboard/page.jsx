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

export default function Page() {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [companyDetails, setCompanyDetails] = useState(null);
  const [users, setUsers] = useState([]);

  // Load company from localStorage
  useEffect(() => {
    const storedCompany = localStorage.getItem("selectedCompany");
    if (storedCompany) {
      setSelectedCompany(storedCompany);
    }
  }, []);

  // Fetch company details
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!selectedCompany) return;
      try {
        const detailsDocRef = doc(firestore, selectedCompany, "details");
        const snapshot = await getDoc(detailsDocRef);
        if (snapshot.exists()) {
          setCompanyDetails(snapshot.data());
        } else {
          setCompanyDetails(null);
          toast.error("No company details found.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch company details.");
      }
    };

    fetchCompanyDetails();
  }, [selectedCompany]);

  // // Fetch users
  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     if (!selectedCompany) return;
  //     try {
  //       const userDocRef = doc(firestore, selectedCompany, "users");
  //       const snapshot = await getDoc(userDocRef);
  //       if (snapshot.exists()) {
  //         const data = snapshot.data();
  //         const usersArray = data.users || [];

  //         const formattedUsers = usersArray.map((entry) => {
  //           const [uid, userData] = Object.entries(entry)[0];
  //           return { uid, ...userData };
  //         });

  //         setUsers(formattedUsers);
  //       } else {
  //         setUsers([]);
  //         toast.error("No users found for this company.");
  //       }
  //     } catch (err) {
  //       toast.error("Error fetching users.");
  //       console.error(err);
  //     }
  //   };

  //   fetchUsers();
  // }, [selectedCompany]);

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
                setSelectedCompany={(value) => {
                  setSelectedCompany(value);
                  localStorage.setItem("selectedCompany", value);
                }}
              />
            </div>
          </div>
        </header>
        <main className="p-4">
          {/* Company Details */}
          {companyDetails && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h2 className="text-lg font-semibold mb-2">
                Company Details: {selectedCompany}
              </h2>
              <p><strong>Name:</strong> {companyDetails.name}</p>
              <p><strong>Address:</strong> {companyDetails.address}</p>
              <p><strong>Phone:</strong> {companyDetails.phone}</p>
              <p><strong>Contact Persons:</strong> {companyDetails.contactPersons}</p>
            </div>
          )}

          {/* User List
          <h2 className="text-lg font-semibold mb-4">
            Users in {selectedCompany}
          </h2>
          <ul className="space-y-2">
            {users.length > 0 ? (
              users.map((user) => (
                <li key={user.uid} className="p-3 border rounded-md">
                  <p><strong>Name:</strong> {user.userName}</p>
                  <p><strong>Email:</strong> {user.userEmail}</p>
                  <p><strong>Phone:</strong> {user.userPhone}</p>
                  <p><strong>Address:</strong> {user.userAddress}</p>
                </li>
              ))
            ) : (
              <p>No users to display.</p>
            )}
          </ul> */}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
