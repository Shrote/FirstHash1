"use client";
import ProtectedRoute from "@/components/protectedRoute";
import { Toaster } from "react-hot-toast";

export default function ProjectTaskLayout({ children }) {
  return (
    <ProtectedRoute requiredPermission="project-task">
       <Toaster position="top-right" />
      {children}
    </ProtectedRoute>
  );
}