"use client";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
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
import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddClientForm from "@/components/AddClientForm";

export default function Client() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      const clientsCollection = collection(firestore, "clients");
      const clientDocs = await getDocs(clientsCollection);
      const clientsData = clientDocs.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null, // Ensure JS Date
          };
        })
        .sort(
          (a, b) =>
            (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0)
        );

      setFilteredClients(clientsData);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleAddNewClientClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchClients();
  };

  const router = useRouter();

  const handleViewClient = (clientId) => {
    router.push(`/client/${clientId}`);
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <div className="flex items-center gap-2 w-full">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Client</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="space-y-4 p-6">
        <h2 className="text-3xl font-semibold text-gray-900">Client</h2>
        <div className="flex justify-between items-center mb-4">
          <Input
            type="text"
            placeholder="Search Client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm py-2 px-3 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-200"
          />
          <div className="flex items-center gap-4">
            <Button onClick={handleAddNewClientClick}>Add New Client</Button>
          </div>
        </div>
        <Table className="overflow-x-auto shadow-md rounded-lg">
          <TableCaption>All registered Client</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id} className="hover:bg-gray-100">
                <TableCell>{client.name || "N/A"}</TableCell>
                <TableCell>{client.email || "N/A"}</TableCell>
                <TableCell>{client.phone || "N/A"}</TableCell>
                <TableCell>
                  {client.createdAt ? client.createdAt.toLocaleString() : "N/A"}
                </TableCell>

                <TableCell>
                  <span
                    className={
                      client.profileStatus === "Inactive"
                        ? "text-red-500"
                        : "text-green-500"
                    }
                  >
                    {(client.profileStatus || "Active").toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleViewClient(client.id)}>View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <AddClientForm onClose={handleCloseModal} />
        </DialogContent>
      </Dialog>
    </>
  );
}
