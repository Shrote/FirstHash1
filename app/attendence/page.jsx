import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-dropdown-menu";
import React from "react";

function page() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <div className="flex items-center gap-2 w-full">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Attendence</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="space-y-4 p-6">
        <h2 className="text-3xl font-semibold text-gray-900">Attendence</h2>
        <div className="flex justify-between items-center mb-4">
          <Input
            type="text"
            placeholder="Search Client..."
            defaultValue="search"
            readOnly
            className="max-w-sm py-2 px-3 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-200"
          />
        </div>
      </div>
    </>
  );
}

export default page;
