"use client";
import ProtectedRoute from "@/components/protectedRoute";

export default function ClientLayout({ children }) {
  return (
    <ProtectedRoute requiredPermission="client">
      {children}
    </ProtectedRoute>
  );
}