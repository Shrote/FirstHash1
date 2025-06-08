"use client";

import { useState } from "react";
import { firestore } from "@/lib/firebase";
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";

export default function AddTaskForm({ onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    projectName: "",
    status: "pending",
    dueDate: "",
  });
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const id = uuidv4();
      await setDoc(doc(collection(firestore, "project_tasks"), id), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Task created",
        description: `Task '${formData.title}' added successfully.`,
      });
      if (onClose) onClose();
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <input
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Task Title"
        required
        className="w-full p-2 border rounded"
      />

      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Task Description"
        required
        className="w-full p-2 border rounded"
      />

      <input
        name="assignedTo"
        value={formData.assignedTo}
        onChange={handleChange}
        placeholder="Assigned To (User ID or Name)"
        required
        className="w-full p-2 border rounded"
      />

      <input
        name="projectName"
        value={formData.projectName}
        onChange={handleChange}
        placeholder="Project Name"
        required
        className="w-full p-2 border rounded"
      />

      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="pending">Pending</option>
        <option value="ongoing">Ongoing</option>
        <option value="completed">Completed</option>
      </select>

      <input
        type="date"
        name="dueDate"
        value={formData.dueDate}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Save Task
      </button>
    </form>
  );
}