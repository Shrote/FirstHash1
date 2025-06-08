"use client";
import ProtectedRoute from "@/components/protectedRoute";
import { Toaster } from "react-hot-toast";

export default function UsersLayout({ children }) {
  return (
    <ProtectedRoute requiredPermission="user">
      <Toaster position="top-right" />
      {children}
    </ProtectedRoute>
  );
}