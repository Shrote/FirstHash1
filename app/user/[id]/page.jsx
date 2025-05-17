"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { AppSidebar } from "@/components/app-sidebar";
import { Label } from "@/components/ui/label";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import imageCompression from "browser-image-compression";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({});
  const router = useRouter();
  const params = useParams();
  const [isActive, setIsActive] = useState(true);

  const fetchUserData = async () => {
    if (!params.id) return;

    try {
      const userDocRef = doc(firestore, "users", params.id);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser(userData);
        setUpdatedUser(userData);
        setIsActive(userData.profileStatus === "Active");
      } else {
        console.error("No user found with the given ID.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [params.id]); // Removed firestore from dependencies as it's stable

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const compressImage = async (file) => {
    let options = {
      maxSizeMB: 0.1,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };
    try {
      let compressedFile = await imageCompression(file, options);
      while (compressedFile.size > 100 * 1024 && options.maxSizeMB > 0.01) {
        options.maxSizeMB -= 0.01;
        compressedFile = await imageCompression(file, options);
      }
      return compressedFile;
    } catch (error) {
      console.error("Image compression error:", error);
      return file;
    }
  };

  const handleStatusToggle = async (checked) => {
    if (!params.id) return;

    const newStatus = checked ? "Active" : "Inactive";

    try {
      const productDocRef = doc(firestore, "users", params.id);
      await updateDoc(productDocRef, { profileStatus: newStatus });

      setIsActive(checked);
      toast.success(`User status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update User status.");
    }
  };

  const handleAccessLevelChange = (e) => {
    const { name, checked } = e.target;
    setUpdatedUser((prevState) => ({
      ...prevState,
      accessLevels: {
        ...prevState.accessLevels,
        [name]: checked ? "true" : "false",
      },
    }));
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressedFile = await compressImage(file);
        const imageRef = ref(
          storage,
          `users/${Date.now()}_${compressedFile.name}`
        );
        const snapshot = await uploadBytes(imageRef, compressedFile);
        const downloadURL = await getDownloadURL(snapshot.ref);

        setUpdatedUser((prevState) => ({
          ...prevState,
          profileImage: downloadURL,
        }));
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };
  const handleSaveOrEdit = async () => {
    if (isEditable) {
      if (!params.id) return;

      try {
        const userDocRef = doc(firestore, "users", params.id);
        await updateDoc(userDocRef, updatedUser);
        setIsEditable(false);
        setIsActive(!isActive);
        toast.success("User data updated successfully!", {
          position: "top-right",
        });
      } catch (error) {
        console.error("Error saving user data:", error);
        toast.error("Error saving user data.", { position: "top-right" });
      }
    } else {
      setIsEditable(true);
    }
  };

  if (!user) {
    return <p>Loading user details...</p>;
  }

  const trueAccessLevels = updatedUser.accessLevels
    ? Object.entries(updatedUser.accessLevels).filter(
        ([, value]) => value === "true"
      )
    : [];

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage href="/user">Users</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{updatedUser.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">User Profile</CardTitle>
            <div className="flex items-center gap-4 ml-auto mt-[-4px]">
              <Label className="text-lg font-semibold">User Status</Label>
              <Switch checked={isActive} onCheckedChange={handleStatusToggle} />
              <span
                className={`text-xl font-bold ${
                  isActive ? "text-green-600" : "text-red-600"
                }`}
              >
                {isActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={updatedUser.name || ""}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <Input
                    type="text"
                    name="gender"
                    value={updatedUser.gender || ""}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={updatedUser.email || ""}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <Input
                    type="text"
                    name="phone"
                    value={updatedUser.phone || ""}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    className="mt-1"
                  />
                </div>
                {updatedUser.userType === "Sales" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Agent ID
                    </label>
                    <Input
                      type="text"
                      name="agentId"
                      value={updatedUser.agentId || ""}
                      onChange={handleInputChange}
                      disabled={!isEditable}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Profile Image
                  </label>
                  <div className="mt-1 flex items-center">
                    <img
                      src={updatedUser.profileImage || "/placeholder.png"}
                      alt="Profile"
                      className="h-32 w-32 object-cover rounded-md"
                    />
                    {isEditable && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="ml-4"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    User Type
                  </label>
                  <Input
                    type="text"
                    name="userType"
                    value={updatedUser.userType || ""}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <Input
                    type="text"
                    name="address"
                    value={updatedUser.address || ""}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900">
                Access Levels
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {isEditable
                  ? Object.entries(updatedUser.accessLevels || {}).map(
                      ([key, value]) => (
                        <div key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            name={key}
                            checked={value === "true"}
                            onChange={handleAccessLevelChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 block text-sm text-gray-900">
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </label>
                        </div>
                      )
                    )
                  : trueAccessLevels.map(([key]) => (
                      <div key={key} className="flex items-center">
                        <svg
                          className="h-5 w-5 text-green-500"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="ml-2 text-sm text-gray-900">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                      </div>
                    ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 flex justify-between">
          <Button onClick={() => router.push("/user")} variant="default">
            Back to Users List
          </Button>
          <Button onClick={handleSaveOrEdit} variant="default">
            {isEditable ? "Save Changes" : "Edit Profile"}
          </Button>
        </div>
      </main>
      <ToastContainer />
    </>
  );
}
