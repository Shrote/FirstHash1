"use client";
import ProtectedRoute from "@/components/protectedRoute";
import { Toaster } from "react-hot-toast";

export default function ProjectLayout({ children }) {
  return (
    <ProtectedRoute requiredPermission="project">
            <Toaster position="top-right" />

      {children}
    </ProtectedRoute>
  );
}