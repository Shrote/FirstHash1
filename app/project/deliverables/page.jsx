"use client";

import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { firestore } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import AddDeliverablesForm from "./addDeliverables";

const DeliverablesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeliverable, setEditingDeliverable] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deliverables, setDeliverables] = useState([]);

  useEffect(() => {
    fetchDeliverables();
  }, []);

  const fetchDeliverables = async () => {
    const selectedCompany = localStorage.getItem("selectedCompany");
    if (!selectedCompany) return;

    const snapshot = await getDocs(collection(firestore, "deliverables"));
    const items = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((item) => item.company === selectedCompany);
    setDeliverables(items);
  };

  const handleEditClick = async (id) => {
    const ref = doc(firestore, "deliverables", id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setEditingDeliverable({ id, ...snap.data() });
      setIsModalOpen(true);
    }
  };

  const handleAddNew = () => {
    setEditingDeliverable(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDeliverable(null);
    fetchDeliverables();
  };

  const filteredDeliverables = deliverables.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <div className="flex items-center gap-2 w-full">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Deliverables</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="space-y-4 p-6">
        <h2 className="text-3xl font-semibold">Deliverables</h2>
        <div className="flex justify-between items-center mb-4">
          <Input
            type="text"
            placeholder="Search Deliverables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={handleAddNew}>Add New Deliverable</Button>
        </div>

        <Table>
          <TableCaption>All registered Deliverables</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeliverables.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  {item.createdAt?.toDate?.().toLocaleString() || "N/A"}
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleEditClick(item.id)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="flex justify-between items-center">
            <DialogTitle>
              {editingDeliverable ? "Edit Deliverable" : "Add Deliverable"}
            </DialogTitle>
            <DialogClose asChild>
            </DialogClose>
          </DialogHeader>

          <AddDeliverablesForm
            onClose={handleCloseModal}
            editingData={editingDeliverable}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeliverablesPage;
