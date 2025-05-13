"use client";

import {
  ChevronsUpDown,
  LogOut,
} from "lucide-react";

import { useRouter } from "next/navigation";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/firebase"; // Firestore instance

export function NavUser({ user }) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const [userData, setUserData] = useState({
    name: "Unknown",
    email: "",
    profileImage: "", // To store the profile image URL
    userType: "Unknown",
  });

  const userEmail = typeof window !== "undefined" ? localStorage.getItem("userName") : null; // Get userEmail from localStorage

  const handleLogout = () => {
    // Remove the userName from localStorage
    localStorage.removeItem("userName");
    router.push("/login");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (userEmail) {
          // Query Firestore to find the document with the matching email
          const usersCollection = collection(firestore, "users");
          const querySnapshot = await getDocs(
            query(usersCollection, where("email", "==", userEmail))
          );

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            // Set the user data (name, email, profileImage, userType)
            setUserData({
              name: userData.name || "Unknown",
              email: userData.email || "",
              profileImage: userData.profileImage || "", // Get the profile image
              userType: userData.userType || "Unknown",
            });
          } else {
            console.error("No user document found for the provided email.");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userEmail]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {userData.profileImage ? (
                  <AvatarImage src={userData.profileImage} alt={userData.name} />
                ) : (
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{userData.name}</span>
                <span className="truncate text-xs">{userData.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem style={{cursor:"pointer"}} onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
