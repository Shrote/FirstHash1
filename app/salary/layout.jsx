"use client";
import ProtectedRoute from "@/components/protectedRoute";
import { Toaster } from "react-hot-toast";

export default function SalaryLayout({ children }) {
  return (
    <ProtectedRoute requiredPermission="salary">
       <Toaster position="top-right" />
      {children}
    </ProtectedRoute>
  );
}