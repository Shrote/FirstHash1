"use client";
import ProtectedRoute from "@/components/protectedRoute";


export default function AttendenceLayout({ children }) {
  return (
    <ProtectedRoute requiredPermission="attendence">
      {children}
    </ProtectedRoute>
  );
}