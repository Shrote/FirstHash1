"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { getDocs, collection } from "firebase/firestore";
import { Label } from "@/components/ui/label";

export default function TaskProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditable, setIsEditable] = useState(false);
  const [updatedTask, setUpdatedTask] = useState({});
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const taskDoc = await getDoc(doc(firestore, "project_tasks", id));
        if (taskDoc.exists()) {
          const data = taskDoc.data();
          const taskData = {
            id: taskDoc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() ?? null,
            dueDate: data.dueDate?.toDate?.() ?? null, // <-- fix here
          };

          setTask(taskData);
          setUpdatedTask(taskData);
        }
      } catch (err) {
        console.error("Error fetching task:", err);
        toast.error("error fetching task");
      } finally {
        setLoading(false);
      }
    };

    const fetchCompanies = async () => {
      try {
        const docRef = doc(firestore, "dropdownMenu", "companyName");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const companyList = Object.entries(data).map(([id, company]) => ({
            id,
            name: company.name,
          }));
          setCompanies(companyList);
        }
      } catch (error) {
        toast.error("Error fetching companies:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "users"));
        const userList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "projects"));
        const projectList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProjects(projectList);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    if (id) {
      fetchTask();
      fetchCompanies();
      fetchUsers();
      fetchProjects();
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedTask((prev) => ({
      ...prev,
      [name]: name === "dueDate" ? new Date(value) : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setUpdatedTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserToggle = (userId) => {
    setUpdatedTask((prev) => {
      const currentAssignedTo = Array.isArray(prev.assignedTo)
        ? prev.assignedTo
        : [];
      const newAssignedTo = currentAssignedTo.includes(userId)
        ? currentAssignedTo.filter((id) => id !== userId)
        : [...currentAssignedTo, userId];
      return { ...prev, assignedTo: newAssignedTo };
    });
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(firestore, "project_tasks", id), updatedTask);
      setTask(updatedTask);
      setIsEditable(false);
      toast.success("Task updated successfully.");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task.");
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!task) {
    return <div className="p-6 text-red-600">Task not found</div>;
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage href="/tasks">Tasks</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{task.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Task Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium">Title</Label>
                  {isEditable ? (
                    <Input
                      name="title"
                      value={updatedTask.title || ""}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">
                      {task.title}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="block text-sm font-medium">Project</Label>
                  {isEditable ? (
                    <Select
                      value={updatedTask.projectName}
                      onValueChange={(value) =>
                        handleSelectChange("projectName", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.projectName || project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">
  {
    projects.find((p) => p.id === task.projectName)?.projectName ||
    projects.find((p) => p.id === task.projectName)?.name ||
    task.projectName
  }
</p>

                  )}
                </div>

                <div>
                  <Label className="block text-sm font-medium">Status</Label>
                  {isEditable ? (
                    <Select
                      value={updatedTask.status}
                      onValueChange={(value) =>
                        handleSelectChange("status", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">
                      {task.status}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium">
                    Created At
                  </Label>
                  <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">
                    {task.createdAt?.toLocaleDateString() || "N/A"}
                  </p>
                </div>

                <div>
                  <Label className="block text-sm font-medium">Due Date</Label>
                  {isEditable ? (
                    <Input
                      type="date"
                      name="dueDate"
                      value={
                        updatedTask.dueDate
                          ? new Date(updatedTask.dueDate)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      } // Format to 'YYYY-MM-DD'
                      onChange={handleInputChange}
                    />
                  ) : (
                   <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">
  {task.dueDate ? task.dueDate.toLocaleDateString() : "N/A"}
</p>

                  )}
                </div>

                <div>
                  <Label className="block text-sm font-medium">
                    Assigned To
                  </Label>
                  {isEditable ? (
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                      {users.length > 0 ? (
                        users.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-start gap-3 p-2"
                          >
                            <Checkbox
                              id={`user-${user.id}`}
                              checked={
                                Array.isArray(updatedTask.assignedTo) &&
                                updatedTask.assignedTo.includes(user.id)
                              }
                              onCheckedChange={() => handleUserToggle(user.id)}
                            />
                            <label
                              htmlFor={`user-${user.id}`}
                              className="font-medium"
                            >
                              {user.name} ({user.email})
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          No users available
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-1">
                      {Array.isArray(task.assignedTo) &&
                      task.assignedTo.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {task.assignedTo.map((userId) => {
                            const user = users.find((u) => u.id === userId);
                            return (
                              <span
                                key={userId}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {user ? `${user.name}` : userId}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No users assigned
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Label className="block text-sm font-medium">Description</Label>
              {isEditable ? (
                <Textarea
                  name="description"
                  value={updatedTask.description || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                  rows={4}
                />
              ) : (
                <div className="mt-1 p-3 bg-gray-50 rounded text-sm text-gray-900 whitespace-pre-line">
                  {task.description || "No description provided"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between">
          <Button onClick={() => router.push("/project-task")} variant="default">
            Back to Tasks
          </Button>
          <div className="flex gap-2">
            {isEditable && (
              <Button
                onClick={() => {
                  setIsEditable(false);
                  setUpdatedTask(task); // Reset changes
                }}
                variant="outline"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={() => (isEditable ? handleSave() : setIsEditable(true))}
              variant="default"
            >
              {isEditable ? "Save Changes" : "Edit Task"}
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
