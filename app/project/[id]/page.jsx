// app/project/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditable, setIsEditable] = useState(false);
  const [editedProject, setEditedProject] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      try {
        const docRef = doc(firestore, "projects", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const projectData = {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate
              ? data.createdAt.toDate().toLocaleDateString()
              : "N/A",
          };
          setProject(projectData);
          setEditedProject(projectData);
        } else {
          setProject(null);
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setEditedProject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const docRef = doc(firestore, "projects", id);
      await updateDoc(docRef, {
        projectName: editedProject.projectName,
        clientId: editedProject.clientId,
        companyId: editedProject.companyId,
        projectTimeline: editedProject.projectTimeline,
        priority: editedProject.priority,
        status: editedProject.status,
        projectBudget: editedProject.projectBudget,
        description: editedProject.description,
      });

      setProject(editedProject);
      setIsEditable(false);

      toast({
        title: "Success",
        description: "Project updated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div className="p-6">Loading project details...</div>;
  if (!project) return <div className="p-6">Project not found.</div>;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage href="/project">Projects</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{project.projectName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="p-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">Project Details</CardTitle>
              {/* <Button 
                onClick={() => setIsEditable(!isEditable)}
                variant={isEditable ? "outline" : "default"}
              >
                {isEditable ? "Cancel" : "Edit Project"}
              </Button> */}
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium">
                    Project Name
                  </Label>
                  {isEditable ? (
                    <Input
                      name="projectName"
                      value={editedProject.projectName || ""}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">
                      {project.projectName}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="block text-sm font-medium">Client ID</Label>
                  {isEditable ? (
                    <Input
                      name="clientId"
                      value={editedProject.clientId || ""}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">
                      {project.clientId}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="block text-sm font-medium">
                    Company ID
                  </Label>
                  {isEditable ? (
                    <Input
                      name="companyId"
                      value={editedProject.companyId || ""}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">
                      {project.companyId}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="block text-sm font-medium">Timeline</Label>
                  {isEditable ? (
                    <Input
                      name="projectTimeline"
                      value={editedProject.projectTimeline || ""}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">
                      {project.projectTimeline}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium">Priority</Label>
                  {isEditable ? (
                    <Select
                      value={editedProject.priority}
                      onValueChange={(value) =>
                        handleSelectChange("priority", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">
                      {project.priority}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="block text-sm font-medium">Status</Label>
                  {isEditable ? (
                    <Select
                      value={editedProject.status}
                      onValueChange={(value) =>
                        handleSelectChange("status", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-started">Not Started</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">
                      {project.status}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="block text-sm font-medium">
                    Created At
                  </Label>
                  <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">
                    {project.createdAt}
                  </p>
                </div>

                <div>
                  <Label className="block text-sm font-medium">Budget</Label>
                  {isEditable ? (
                    <Input
                      name="projectBudget"
                      value={editedProject.projectBudget || ""}
                      onChange={handleInputChange}
                      className="mt-1"
                      type="number"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">
                      ₹ {project.projectBudget}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Label className="block text-sm font-medium">Description</Label>
              {isEditable ? (
                <Textarea
                  name="description"
                  value={editedProject.description || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                  rows={4}
                />
              ) : (
                <div className="mt-1 p-3 bg-gray-50 rounded text-sm text-gray-900 whitespace-pre-line">
                  {project.description || "No description provided."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between">
          <Button onClick={() => router.push("/project")} variant="default">
            Back to Projects
          </Button>
          <Button
            onClick={() => {
              if (isEditable) {
                handleSave(); // Call save before turning off edit mode
              }
              setIsEditable(!isEditable);
            }}
            variant="default"
          >
            {isEditable ? "Save Changes" : "Edit Project"}
          </Button>

          {/* {isEditable && (
            // <Button onClick={handleSave} variant="default">
            //   Save Changes
            // </Button>
          )} */}
        </div>
      </main>
    </>
  );
}
