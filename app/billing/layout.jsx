"use client";
import ProtectedRoute from "@/components/protectedRoute";

export default function BillingLayout({ children }) {
  return (
    <ProtectedRoute requiredPermission="project">
      {children}
    </ProtectedRoute>
  );
}