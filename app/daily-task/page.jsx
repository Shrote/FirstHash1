"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";

const initialTasks = [
  { id: 1, title: "Task 1", status: "pending" },
  { id: 2, title: "Task 2", status: "ongoing" },
  { id: 3, title: "Task 3", status: "completed" },
];

export default function TaskManager() {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (newTask.trim() === "") return;
    const task = {
      id: Date.now(),
      title: newTask,
      status: "pending",
    };
    setTasks([...tasks, task]);
    setNewTask("");
  };

  const updateTaskStatus = (id, newStatus) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    );
  };

  const columns = ["pending", "ongoing", "completed"];

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
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="New task title"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={addTask}>Add Task</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {columns.map((status) => (
            <div key={status}>
              <h2 className="text-xl font-semibold mb-2 capitalize">
                {status}
              </h2>
              <div className="space-y-2">
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
