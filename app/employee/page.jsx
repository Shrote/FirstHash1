"use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from "@/components/ui/table";
// import { firestore } from "@/lib/firebase";
// import { collection, getDoc, doc } from "firebase/firestore";
import { AppSidebar } from "@/components/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import NotificationHandler from "../NotificationProvider";
// import toast from "react-hot-toast";
// import { Toaster } from "@/components/ui/sonner";
// import { toast } from "react-toastify";
// import { ToastBar } from "react-hot-toast";

export default function Employee() {
  
    

  

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                {/* <Toaster position="top-right" reverseOrder={false} /> */}
                {/* <NotificationHandler /> */}
                <header className="flex h-16 shrink-0 items-center gap-2 px-4">
                    <div className="flex items-center gap-2 w-full">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Employee</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

               
            </SidebarInset>

         

        </SidebarProvider>
    );
}
