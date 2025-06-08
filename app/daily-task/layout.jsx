"use client";
import ProtectedRoute from "@/components/protectedRoute";

export default function DailyTaskLayout({ children }) {
  return (
    <ProtectedRoute requiredPermission="daily-task">
      {children}
    </ProtectedRoute>
  );
}