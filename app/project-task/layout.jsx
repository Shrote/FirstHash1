"use client";
import ProtectedRoute from "@/components/protectedRoute";

export default function UsersLayout({ children }) {
  return (
    <ProtectedRoute requiredPermission="user">
      {children}
    </ProtectedRoute>
  );
}