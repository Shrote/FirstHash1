"use client";
import ProtectedRoute from "@/components/protectedRoute";
import { Toaster } from "react-hot-toast";

export default function DailyTaskLayout({ children }) {
  return (
    <ProtectedRoute requiredPermission="daily-task">
      {children}
      <Toaster position="top-right" />
    </ProtectedRoute>
  );
}