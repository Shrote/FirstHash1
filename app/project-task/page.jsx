"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddTaskForm from "@/components/AddTaskForm";

export default function ProjectTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const fetchTasks = useCallback(async () => {
    try {
      const taskCollection = collection(firestore, "tasks");
      const taskDocs = await getDocs(taskCollection);
      const tasksData = taskDocs.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() ?? null,
          dueDate: data.dueDate?.toDate?.() ?? null,
        };
      });
      setTasks(tasksData);
      setFilteredTasks(tasksData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleFilterChange = (e) => {
    const status = e.target.value;
    setStatusFilter(status);
    if (status === "All") {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter((task) => task.status === status));
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    const filtered = tasks.filter((task) =>
      task.taskName.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredTasks(filtered);
  };

  const handleViewTask = (taskId) => {
    router.push(`/task/${taskId}`);
  };

  return (
    <>
      <header className="flex h-16 items-center gap-2 px-4">
        <div className="flex items-center gap-2 w-full">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Tasks</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="space-y-4 p-6">
        <h2 className="text-3xl font-semibold text-gray-900">Project Tasks</h2>
        <div className="flex justify-between items-center mb-4">
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={handleSearch}
            className="max-w-sm"
          />
          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={handleFilterChange}
              className="py-2 px-3 border rounded-md border-gray-300"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
            <Button onClick={() => setIsModalOpen(true)}>Add Task</Button>
          </div>
        </div>

        <Table className="overflow-x-auto shadow-md rounded-lg">
          <TableCaption>All project tasks</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Task Name</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.taskName || "N/A"}</TableCell>
                <TableCell>{task.projectName || "N/A"}</TableCell>
                <TableCell>
                  <span
                    className={
                      task.status === "Completed"
                        ? "text-green-500"
                        : task.status === "Ongoing"
                        ? "text-yellow-500"
                        : "text-red-500"
                    }
                  >
                    {task.status}
                  </span>
                </TableCell>
                <TableCell>
                  {task.createdAt ? task.createdAt.toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell>
                  {task.dueDate ? task.dueDate.toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleViewTask(task.id)}>View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <AddTaskForm/>
        </DialogContent>
      </Dialog>
    </>
  );
}
