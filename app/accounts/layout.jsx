"use client";

import ProtectedRoute from "@/components/protectedRoute";
import { Toaster } from "react-hot-toast";

export default function AttendenceLayout({ children }) {
  return (
    <ProtectedRoute requiredPermission="accounts">
       <Toaster position="top-right" />
      {children}
    </ProtectedRoute>
  );
}