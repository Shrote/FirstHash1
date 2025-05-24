"use client";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";
import { useEffect } from "react";

export default function ProtectedRoute({ children, requiredPermission }) {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user === null) return; // Still loading
    if (!user?.accessLevelMap?.[requiredPermission]) {
      router.replace("/unauthorized");
    }
  }, [user, requiredPermission]);

  if (!user) return <p>Loading...</p>;
  if (!user?.accessLevelMap?.[requiredPermission]) return null;

  return children;
}
