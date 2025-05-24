"use client";
import ProtectedRoute from "@/components/protectedRoute";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute requiredPermission="dashboard">
      {children}
    </ProtectedRoute>
  );
}