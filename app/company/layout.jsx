"use client";
import ProtectedRoute from "@/components/protectedRoute";

export default function CompanyLayout({ children }) {
  return (
    <ProtectedRoute requiredPermission="company">
      {children}
    </ProtectedRoute>
  );
}