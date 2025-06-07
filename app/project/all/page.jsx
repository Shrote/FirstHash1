"use client";

import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import AddProject from "./addProject";

function Page() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <div className="flex items-center gap-2 w-full">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>All</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="space-y-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-semibold text-gray-900">All</h2>

          {/* Add Project Button & Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                + Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl overflow-y-auto max-h-screen">
              <DialogTitle className="text-xl font-semibold mb-2">
                Add New Project
              </DialogTitle>
              <AddProject />
            </DialogContent>
          </Dialog>
        </div>

        <Input
          type="text"
          placeholder="Search Client..."
          className="max-w-sm py-2 px-3 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-200"
        />
      </div>
    </>
  );
}

export default Page;
