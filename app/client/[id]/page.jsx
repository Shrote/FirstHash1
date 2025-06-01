"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import imageCompression from "browser-image-compression";
import { Checkbox } from "@/components/ui/checkbox";

export default function ClientProfile() {
  const [client, setClient] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [updatedClient, setUpdatedClient] = useState({});
  const router = useRouter();
  const params = useParams();
  const [isActive, setIsActive] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState({});

  const fetchClientData = async () => {
    if (!params.id) return;

    try {
      const clientDocRef = doc(firestore, "clients", params.id);
      const clientDoc = await getDoc(clientDocRef);
      if (clientDoc.exists()) {
        const clientData = clientDoc.data();
        setClient(clientData);

        // Initialize selected companies
        const initialSelected = {};
        if (
          clientData.assignedCompany &&
          typeof clientData.assignedCompany === "object"
        ) {
          Object.keys(clientData.assignedCompany).forEach((companyId) => {
            initialSelected[companyId] = true;
          });
        }
        setSelectedCompanies(initialSelected);

        setUpdatedClient(clientData);
        setIsActive(clientData.profileStatus === "Active");
      } else {
        console.error("No client found with the given ID.");
      }
    } catch (error) {
      console.error("Error fetching client data:", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const companyDocRef = doc(firestore, "DropdownMenu", "companyName");
      const companyDoc = await getDoc(companyDocRef);

      if (companyDoc.exists()) {
        const companyData = companyDoc.data();
        const companiesArray = Object.entries(companyData).map(
          ([id, data]) => ({
            id,
            ...data,
          })
        );
        setCompanies(companiesArray);
      } else {
        // Try with lowercase collection name as fallback
        const companyDocRef = doc(firestore, "dropdownMenu", "companyName");
        const companyDoc = await getDoc(companyDocRef);

        if (companyDoc.exists()) {
          const companyData = companyDoc.data();
          const companiesArray = Object.entries(companyData).map(
            ([id, data]) => ({
              id,
              ...data,
            })
          );
          setCompanies(companiesArray);
        } else {
          console.error("No company data found.");
        }
      }
    } catch (error) {
      console.error("Error fetching company data:", error);
    }
  };

  useEffect(() => {
    fetchClientData();
    fetchCompanies();
  }, [params.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedClient((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const compressImage = async (file) => {
    const options = {
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
      const productDocRef = doc(firestore, "clients", params.id);
      await updateDoc(productDocRef, { profileStatus: newStatus });

      setIsActive(checked);
      toast.success(`Client status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update Client status.");
    }
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressedFile = await compressImage(file);
        const imageRef = ref(
          storage,
          `clients/${Date.now()}_${compressedFile.name}`
        );
        const snapshot = await uploadBytes(imageRef, compressedFile);
        const downloadURL = await getDownloadURL(snapshot.ref);

        setUpdatedClient((prevState) => ({
          ...prevState,
          profileImage: downloadURL,
        }));
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleCompanySelection = (companyId, isChecked) => {
    setSelectedCompanies((prev) => ({
      ...prev,
      [companyId]: isChecked,
    }));
  };

  const handleSaveOrEdit = async () => {
    if (isEditable) {
      if (!params.id) return;

      try {
        // Prepare assigned companies data
        const assignedCompanyMap = {};
        Object.entries(selectedCompanies).forEach(([companyId, isSelected]) => {
          if (isSelected) {
            const company = companies.find((c) => c.id === companyId);
            if (company) {
              assignedCompanyMap[companyId] = {
                name: company.name,
                address: company.address || "",
                phone: company.phone || "",
                email: company.email || "",
                status: company.status || "Active",
              };
            }
          }
        });

        const dataToSave = {
          ...updatedClient,
          assignedCompany: assignedCompanyMap,
        };

        const clientDocRef = doc(firestore, "clients", params.id);
        await updateDoc(clientDocRef, dataToSave);

        setIsEditable(false);
        toast.success("Client data updated successfully!", {
          position: "top-right",
        });
        fetchClientData();
      } catch (error) {
        console.error("Error saving client data:", error);
        toast.error("Error saving client data.", { position: "top-right" });
      }
    } else {
      setIsEditable(true);
    }
  };

  if (!client) {
    return <p>Loading client details...</p>;
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage href="/client">Clients</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{updatedClient.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Client Profile</CardTitle>
            <div className="flex items-center gap-4 ml-auto mt-[-4px]">
              <Label className="text-lg font-semibold">Client Status</Label>
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
                    value={updatedClient.name || ""}
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
                    value={updatedClient.email || ""}
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
                    value={updatedClient.phone || ""}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    className="mt-1"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Assigned Companies
                  </label>
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                    {companies.length > 0 ? (
                      isEditable ? (
                        // Editable mode: show all companies with checkboxes
                        companies.map((company) => (
                          <div
                            key={company.id}
                            className="flex items-start gap-3 p-2 bg-white border rounded shadow-sm"
                          >
                            <Checkbox
                              id={`company-${company.id}`}
                              checked={selectedCompanies[company.id] || false}
                              onCheckedChange={(checked) =>
                                handleCompanySelection(company.id, checked)
                              }
                              disabled={!isEditable}
                            />
                            <div>
                              <label
                                htmlFor={`company-${company.id}`}
                                className="font-semibold cursor-pointer"
                              >
                                {company.name}
                              </label>
                              {company.address && (
                                <p className="text-xs text-gray-500">
                                  {company.address}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        // Read-only mode: show only assigned companies
                        companies
                          .filter((company) => selectedCompanies[company.id])
                          .map((company) => (
                            <div
                              key={company.id}
                              className="p-2 bg-white border rounded shadow-sm"
                            >
                              <p className="font-semibold">{company.name}</p>
                              {company.address && (
                                <p className="text-xs text-gray-500">
                                  {company.address}
                                </p>
                              )}
                            </div>
                          ))
                      )
                    ) : (
                      <p className="text-sm text-gray-500">
                        No companies available.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Profile Image
                  </label>
                  <div className="mt-1 flex items-center">
                    <img
                      src={updatedClient.profileImage || "/placeholder.png"}
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
                    Address
                  </label>
                  <Input
                    type="text"
                    name="address"
                    value={updatedClient.address || ""}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 flex justify-between">
          <Button onClick={() => router.push("/client")} variant="default">
            Back to Clients List
          </Button>
          <div className="flex gap-2">
            {isEditable && (
              <Button
                onClick={() => {
                  setIsEditable(false);
                }}
              >
                Cancel
              </Button>
            )}
            <Button onClick={handleSaveOrEdit} variant="default">
              {isEditable ? "Save Changes" : "Edit Profile"}
            </Button>
          </div>
        </div>
      </main>
      <ToastContainer />
    </>
  );
}
