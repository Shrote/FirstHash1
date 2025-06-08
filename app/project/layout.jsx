"use client";
import ProtectedRoute from "@/components/protectedRoute";
import { Toaster } from "react-hot-toast";

export default function ClientLayout({ children }) {
  return (
    <ProtectedRoute requiredPermission="client">
            <Toaster position="top-right" />

      {children}
    </ProtectedRoute>
  );
}