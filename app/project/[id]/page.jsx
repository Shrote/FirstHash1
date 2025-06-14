"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
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
  const [allDeliverables, setAllDeliverables] = useState([]);
  const [isDeliverablesOpen, setIsDeliverablesOpen] = useState(false);
  const dropdownRef = useRef(null);

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
            deliverables: Array.isArray(data.deliverables) ? data.deliverables : [],
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

  // Fetch deliverables when entering edit mode
  useEffect(() => {
    if (!isEditable) return;

    const fetchDeliverables = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "deliverables"));
        const deliverables = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllDeliverables(deliverables);
      } catch (error) {
        console.error("Error fetching deliverables:", error);
        toast.error("Failed to load deliverables");
      }
    };

    fetchDeliverables();
  }, [isEditable]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDeliverablesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleDeliverableToggle = (deliverableId) => {
    setEditedProject(prev => {
      const currentDeliverables = prev.deliverables || [];
      const newDeliverables = currentDeliverables.includes(deliverableId)
        ? currentDeliverables.filter(id => id !== deliverableId)
        : [...currentDeliverables, deliverableId];
      
      return {
        ...prev,
        deliverables: newDeliverables
      };
    });
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
        deliverables: editedProject.deliverables,
      });

      setProject(editedProject);
      setIsEditable(false);
      toast.success("Project updated successfully!");
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project.");
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
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium">Project Name</Label>
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
                  <Label className="block text-sm font-medium">Company ID</Label>
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

              {/* Right Column */}
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
                  <Label className="block text-sm font-medium">Created At</Label>
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

            {/* Deliverables Section */}
            <div className="mt-6">
              <Label className="block text-sm font-medium">Deliverables</Label>
              {isEditable ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDeliverablesOpen(!isDeliverablesOpen)}
                    className="w-full p-2 border rounded text-left flex justify-between items-center mt-1"
                  >
                    {editedProject.deliverables?.length > 0
                      ? `${editedProject.deliverables.length} selected`
                      : "Select deliverables"}
                    <svg
                      className={`w-4 h-4 ml-2 transition-transform ${isDeliverablesOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isDeliverablesOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-auto">
                      {allDeliverables.map((del) => (
                        <label
                          key={del.id}
                          className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={editedProject.deliverables?.includes(del.id) || false}
                            onChange={() => handleDeliverableToggle(del.id)}
                            className="mr-2"
                          />
                          {del.title}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-2">
                  {project.deliverables?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {project.deliverables.map(deliverableId => {
                        const deliverable = allDeliverables.find(d => d.id === deliverableId);
                        return (
                          <span 
                            key={deliverableId} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {deliverable ? deliverable.title : deliverableId}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No deliverables assigned</p>
                  )}
                </div>
              )}
            </div>

            {/* Description Section */}
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
                handleSave();
              }
              setIsEditable(!isEditable);
            }}
            variant="default"
          >
            {isEditable ? "Save Changes" : "Edit Project"}
          </Button>
        </div>
      </main>
    </>
  );
}