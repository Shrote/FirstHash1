"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { firestore } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddUserForm from "@/components/AddUserForm";

export default function Page() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userTypeFilter, setUserTypeFilter] = useState("All");
  const router = useRouter();

  // Fetch Users from Firestore
  const fetchUsers = useCallback(async () => {
    try {
      const usersCollection = collection(firestore, "users");
      const userDocs = await getDocs(usersCollection);
      const usersData = userDocs.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt ? new Date(data.createdAt) : null, // Convert string to Date object
          };
        })
        .sort(
          (a, b) =>
            (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
        ); // Sort newest first

      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (e) => {
    const selectedType = e.target.value;
    setUserTypeFilter(selectedType);
    if (selectedType === "All") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) => user.userType === selectedType);
      setFilteredUsers(filtered);
    }
  };

  const handleViewUser = (userId) => {
    router.push(`/user/${userId}`);
  };

  const handleAddNewUserClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchUsers();
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <div className="flex items-center gap-2 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Users</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="space-y-4 p-6">
          <h2 className="text-3xl font-semibold text-gray-900">Users</h2>
          <div className="flex justify-between items-center mb-4">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm py-2 px-3 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-200"
            />
            <div className="flex items-center gap-4">
              <select
                value={userTypeFilter}
                onChange={handleFilterChange}
                className="py-2 px-3 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="All">All User Types</option>
                {[
                  ...new Set(
                    users.map((user) => user.userType).filter(Boolean)
                  ),
                ].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <Button onClick={handleAddNewUserClick}>Add New User</Button>
            </div>
          </div>
          <Table className="overflow-x-auto shadow-md rounded-lg">
            <TableCaption>All registered users</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>User Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-100">
                  <TableCell>{user.name || "N/A"}</TableCell>
                  <TableCell>{user.gender || "N/A"}</TableCell>
                  <TableCell>{user.email || "N/A"}</TableCell>
                  <TableCell>{user.phone || "N/A"}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleString() || "N/A"}
                  </TableCell>
                  <TableCell>{user.userType || "N/A"}</TableCell>
                  <TableCell>
                    <span
                      className={
                        user.profileStatus === "Inactive"
                          ? "text-red-500"
                          : "text-green-500"
                      }
                    >
                      {(user.profileStatus || "Active").toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleViewUser(user.id)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* AddUserForm Component */}
        {isModalOpen && (
          <AddUserForm
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onUserAdded={fetchUsers}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
