"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const columns = ["pending", "ongoing", "completed"];
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const projectsRef = collection(firestore, "project_tasks");
        const snapshot = await getDocs(projectsRef);
        const userTasks = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.assignedTo && data.assignedTo.includes(userId)) {
            userTasks.push({
              id: data.id || doc.id,
              title: data.title || "No Title",
              status: data.status || "pending",
            });
          }
        });

        setTasks(userTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    if (userId) {
      fetchTasks();
    }
  }, [userId]);

  const updateTaskStatus = async (id, newStatus) => {
    try {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, status: newStatus } : task
        )
      );
      const projectRef = doc(firestore, "project_tasks", id);
      await updateDoc(projectRef, { status: newStatus });
      toast.success(`Task moved to "${newStatus}"`);
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
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
                <BreadcrumbPage>Daily Task</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {columns.map((status) => (
            <div key={status} className="border-r">
              <h2 className="text-xl font-semibold mb-2 capitalize px-2">
                {status}
              </h2>
              <div className="space-y-2 px-2">
                {tasks
                  .filter((t) => t.status === status)
                  .map((task) => (
                    <Card key={task.id} className="bg-white shadow rounded-xl">
                      <CardContent className="p-4">
                        <p className="font-medium">{task.title}</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {columns
                            .filter((col) => col !== status)
                            .map((s) => (
                              <Button
                                key={s}
                                size="sm"
                                variant="outline"
                                onClick={() => updateTaskStatus(task.id, s)}
                              >
                                Move to {s}
                              </Button>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
