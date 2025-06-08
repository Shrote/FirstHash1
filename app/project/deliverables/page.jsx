"use client";

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
} from "@/components/ui/dialog";
import React, { useState } from "react";
import { Separator } from "@radix-ui/react-dropdown-menu";
// import { AddDeliverablesForm } from "@/components/forms/AddDeliverablesForm";

function DeliverablesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddNewDeliverablesClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleViewDeliverables = (id) => {
    // View logic here
  };

  const filteredDeliverables = []; // Replace with actual filtered list

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
        <h2 className="text-3xl font-semibold text-gray-900">Deliverables</h2>
        <div className="flex justify-between items-center mb-4">
          <Input
            type="text"
            placeholder="Search Deliverables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm py-2 px-3 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-200"
          />
          <Button onClick={handleAddNewDeliverablesClick}>Add New Deliverable</Button>
        </div>

        <Table className="overflow-x-auto shadow-md rounded-lg">
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
              <TableRow key={item.id} className="hover:bg-gray-100">
                <TableCell>{item.title || "N/A"}</TableCell>
                <TableCell>{item.description || "N/A"}</TableCell>
                <TableCell>{item.createdAt?.toLocaleString() || "N/A"}</TableCell>
                <TableCell>
                  <Button onClick={() => handleViewDeliverables(item.id)}>View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Deliverable</DialogTitle>
          </DialogHeader>
          {/* <AddDeliverablesForm onClose={handleCloseModal} /> */}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default DeliverablesPage;
