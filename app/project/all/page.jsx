"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddProject from "./addProject";
import { firestore } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";
import { Link } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
const router = useRouter();
  const fetchProjects = useCallback(async () => {
    try {
      const productsCollection = collection(firestore, "projects");
      const productDocs = await getDocs(productsCollection);
      const productsData = productDocs.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
        };
      });
      setProjects(productsData);
      setFilteredProjects(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = projects.filter((project) =>
      (project.projectName || "").toLowerCase().includes(query)
    );
    setFilteredProjects(filtered);
  }, [searchQuery, projects]);

  const handleClose = () => {
    setOpen(false);
    toast.success("Project added successfully!");
    fetchProjects();
  };

  const handleViewProject = (projectId) => {
    // window.location.href = `/project/all/${projectId}`; // Replace with your route path
    // window.location.href = `/project/all/${projectId}`;
    router.push(`/project/all/${projectId}`);
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
                <BreadcrumbPage>Projects</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="space-y-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-semibold text-gray-900">Projects</h2>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>+ Add Project</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl overflow-y-auto max-h-[70vh]">
              <DialogTitle className="text-xl font-semibold mb-2">
                Add New Project
              </DialogTitle>
              <AddProject onClose={handleClose} />
            </DialogContent>
          </Dialog>
        </div>

        <Input
          type="text"
          placeholder="Search Project Name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm py-2 px-3 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-200"
        />

        <Table className="overflow-x-auto shadow-md rounded-lg mt-4">
          <TableCaption>All registered projects</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Client ID</TableHead>
              {/* <TableHead>Company ID</TableHead>
              <TableHead>Timeline</TableHead> */}
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project.id} className="hover:bg-gray-100">
                <TableCell>{project.projectName || "N/A"}</TableCell>
                <TableCell>{project.clientId || "N/A"}</TableCell>
                {/* <TableCell>{project.companyId || "N/A"}</TableCell> */}
                <TableCell className="capitalize">
                  {project.priority || "N/A"}
                </TableCell>
                {/* <TableCell>{project.projectTimeline || "N/A"}</TableCell> */}
                <TableCell>
                  <span
                    className={
                      project.status?.toLowerCase() === "inactive"
                        ? "text-red-500"
                        : "text-green-500"
                    }
                  >
                    {(project.status || "Active").toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>
                  {project.createdAt
                    ? project.createdAt.toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {/* <Link href={`/project/${project.id}`}>
                    {/* <Button variant="outline">View</Button> 
                    view
                  </Link> */}
                  <Button onClick={() => handleViewProject(project.id)}>View</Button>
                </TableCell>
                
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
