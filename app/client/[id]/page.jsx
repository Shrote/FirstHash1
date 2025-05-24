"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { firestore, storage } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UserProfile() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all companies from the companies collection
  const fetchCompanies = async () => {
    try {
      const companiesCollection = collection(firestore, "companies");
      const snapshot = await getDocs(companiesCollection);
      const companiesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCompanies(companiesList);
    } catch (err) {
      console.error("Error fetching companies:", err);
      toast.error("Failed to load companies");
    }
  };

  const fetchUserData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const userRef = doc(firestore, "users", id);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUser({
          ...userData,
          id: userSnap.id,
          accessLevelMap: userData.accessLevelMap || {},
          assignedCompany: userData.assignedCompany || {},
        });

        // Set the selected company if one is assigned
        if (
          userData.assignedCompany &&
          Object.keys(userData.assignedCompany).length > 0
        ) {
          const companyId = Object.keys(userData.assignedCompany)[0];
          setSelectedCompanyId(companyId);
        }
      } else {
        toast.error("User not found");
        router.push("/users");
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      toast.error("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchCompanies();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = () => {
    setUser((prev) => ({
      ...prev,
      profileStatus: prev?.profileStatus === "Active" ? "Inactive" : "Active",
    }));
  };

  const handleAccessToggle = (level) => {
    setUser((prev) => ({
      ...prev,
      accessLevelMap: {
        ...prev?.accessLevelMap,
        [level]: !prev?.accessLevelMap?.[level],
      },
    }));
  };

  const handleCompanySelect = (companyId) => {
    setSelectedCompanyId(companyId);

    // Update user's assignedCompany immediately
    if (companyId) {
      const company = companies.find((c) => c.id === companyId);
      if (company) {
        setUser((prev) => ({
          ...prev,
          assignedCompany: {
            [companyId]: {
              address: company.address,
              contactPersons: company.contactPersons,
              email: company.email,
              name: company.name,
              phone: company.phone,
              status: company.status,
            },
          },
        }));
      }
    } else {
      setUser((prev) => ({ ...prev, assignedCompany: {} }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      toast.error("Please upload an image file (JPEG/PNG)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    try {
      setImagePreview(URL.createObjectURL(file));
      const storageRef = ref(storage, `profiles/${id}_${Date.now()}.jpg`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setUser((prev) => ({ ...prev, profileImage: url }));
      toast.success("Profile image updated");
    } catch (err) {
      console.error("Error uploading image:", err);
      toast.error("Failed to upload image");
    }
  };

  const handleSave = async () => {
    if (!user || !id) return;

    try {
      setIsSaving(true);

      // Prepare update data
      const updateData = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        address: user.address,
        userType: user.userType,
        profileStatus: user.profileStatus,
        accessLevelMap: user.accessLevelMap,
        assignedCompany: user.assignedCompany,
        updatedAt: new Date(),
      };

      // Only include profileImage if it exists
      if (user.profileImage) {
        updateData.profileImage = user.profileImage;
      }

      await updateDoc(doc(firestore, "users", id), updateData);
      toast.success("User updated successfully!");
      setIsEditable(false);
      fetchUserData(); // Refresh data to ensure consistency
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Failed to update user");
    } finally {
      setIsSaving(false);
    }
  };

  const accessLevels = [
    { key: "dashboard", label: "Dashboard" },
    { key: "employee", label: "Employee" },
    { key: "user", label: "User" },
    { key: "company", label: "Company" },
    { key: "client", label: "Client" },
    { key: "logs", label: "Logs" },
    { key: "canEdit", label: "Edit" },
    { key: "canView", label: "View" },
    { key: "canDelete", label: "Delete" },
  ];

  if (isLoading) {
    return (
      <div className="p-4 max-w-6xl mx-auto space-y-4">
        <Skeleton className="h-10 w-24" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-24 w-24 rounded-full" />
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 max-w-6xl mx-auto text-center">
        <p>User not found</p>
        <Button onClick={() => router.push("/users")} className="mt-4">
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4  mx-auto">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </Button>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-2xl">User Profile - {user.name}</CardTitle>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={user.profileStatus === "Active"}
                onCheckedChange={handleSwitchChange}
                disabled={!isEditable}
              />
              <Label className="flex items-center gap-2">
                Status:
                <span
                  className={`font-medium ${
                    user.profileStatus === "Active"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {user.profileStatus}
                </span>
              </Label>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditable(!isEditable)}
                variant={isEditable ? "outline" : "default"}
                className="min-w-[120px]"
              >
                {isEditable ? "Cancel" : "Edit Profile"}
              </Button>
              {isEditable && (
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="min-w-[120px]"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">↻</span>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={user.name || ""}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={user.email || ""}
                onChange={handleChange}
                disabled={!isEditable}
                type="email"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={user.phone || ""}
                onChange={handleChange}
                disabled={!isEditable}
                type="tel"
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                name="gender"
                value={user.gender || ""}
                onChange={handleChange}
                className="w-full border rounded-md p-2 text-sm h-10"
                disabled={!isEditable}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <Label htmlFor="userType">User Type</Label>
              <select
                id="userType"
                name="userType"
                value={user.userType || ""}
                onChange={handleChange}
                className="w-full border rounded-md p-2 text-sm h-10"
                disabled={!isEditable}
              >
                <option value="">Select Type</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            <div>
              <Label>Profile Image</Label>
              <div className="flex items-start gap-4 mt-2">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border">
                  {imagePreview || user.profileImage ? (
                    <Image
                      src={imagePreview || user.profileImage}
                      alt="Profile"
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="bg-gray-100 h-full w-full flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
                </div>
                {isEditable && (
                  <div className="flex-1">
                    <Label htmlFor="profileImage" className="sr-only">
                      Upload profile image
                    </Label>
                    <Input
                      id="profileImage"
                      type="file"
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      JPEG/PNG, max 2MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={user.address || ""}
                onChange={handleChange}
                disabled={!isEditable}
              />
            </div>

            <div>
              <Label>Access Levels</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {accessLevels.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox
                      id={`access-${key}`}
                      checked={!!user.accessLevelMap?.[key]}
                      onCheckedChange={() => handleAccessToggle(key)}
                      disabled={!isEditable}
                    />
                    <Label
                      htmlFor={`access-${key}`}
                      className="text-sm font-medium"
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Assigned Company</Label>
              <div className="mt-2">
                <Select
                  value={selectedCompanyId}
                  onValueChange={handleCompanySelect}
                  disabled={!isEditable || companies.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        companies.length === 0
                          ? "No companies available"
                          : "Select a company"
                      }
                    >
                      {selectedCompanyId
                        ? user?.assignedCompany?.[selectedCompanyId]?.name
                        : "No company assigned"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {companies.length > 0 && (
                      <>
                        <SelectItem value="">No company</SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>

                {/* Display selected company details */}
                {selectedCompanyId && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md border">
                    <h4 className="font-medium">
                      {user?.assignedCompany?.[selectedCompanyId]?.name}
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1 mt-2">
                      <p>
                        Address:{" "}
                        {user?.assignedCompany?.[selectedCompanyId]?.address ||
                          "N/A"}
                      </p>
                      <p>
                        Contact:{" "}
                        {user?.assignedCompany?.[selectedCompanyId]
                          ?.contactPersons || "N/A"}
                      </p>
                      <p>
                        Email:{" "}
                        {user?.assignedCompany?.[selectedCompanyId]?.email ||
                          "N/A"}
                      </p>
                      <p>
                        Phone:{" "}
                        {user?.assignedCompany?.[selectedCompanyId]?.phone ||
                          "N/A"}
                      </p>
                      <p>
                        Status:{" "}
                        {user?.assignedCompany?.[selectedCompanyId]?.status ||
                          "N/A"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
