"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export default function Company() {
  const [companyData, setCompanyData] = useState(null);
  const [companyDocId, setCompanyDocId] = useState(null); // store doc id for update
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState({});

  useEffect(() => {
    const fetchCompanyDataByName = async () => {
      setLoading(true);
      setError(null);

      const selectedCompany = localStorage.getItem("selectedCompany");
      try {
        // console.log(selectedCompany)

        if (!selectedCompany) {
          setError("No company selected.");
          setLoading(false);
          return;
        }

        const docRef = doc(firestore, selectedCompany, "details");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCompanyDocId(docSnap.id);
          setCompanyData(docSnap.data());
          setFormState(docSnap.data());
        } else {
          setError("Company details document not found.");
        }

        // // if (querySnapshot.empty) {
        // //   setError("Company not found.");
        // //   setLoading(false);
        // //   return;
        // // }

        // // // Assuming one match only
        // // const docSnap = querySnapshot.docs[0];
        // // setCompanyDocId(docSnap.id);
        // const data = docSnap.data();
        // setCompanyData(data);
        // setFormState(data);
      } catch (err) {
        setError("Failed to fetch company data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDataByName();
  }, []);

  const handleInputChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditSaveClick = async () => {
    if (editMode) {
      setSaving(true);
      setError(null);

      try {
        if (!companyDocId) {
          setError("Company document ID missing.");
          setSaving(false);
          return;
        }
        const selectedCompany=localStorage.getItem("selectedCompany")

        const companyDocRef = doc(firestore, selectedCompany, "details");

        // Exclude 'name' from updates since it should not be edited
        const { name, accessLevelMap, ...updatableFields } = formState;

        await updateDoc(companyDocRef, updatableFields);

        setCompanyData({ ...companyData, ...updatableFields });
        setEditMode(false);
      } catch (err) {
        setError("Failed to save changes.");
        console.error(err);
      } finally {
        setSaving(false);
      }
    } else {
      setEditMode(true);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <div className="flex items-center gap-2 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Company</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

       <main className="p-6 relative max-w-3xl mx-auto bg-white rounded-lg shadow-lg border">
  {loading ? (
    <p className="text-gray-500">Loading company details...</p>
  ) : error ? (
    <p className="text-red-600 font-semibold mb-4">{error}</p>
  ) : (
    companyData && (
      <section className="space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-3xl font-semibold text-gray-800">
            {companyData.name || "Company Name"}
          </h2>
          <p className="text-sm text-gray-500">Company Information</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Email */}
          <div>
            <label className="text-gray-600 font-medium block mb-1">Email</label>
            {editMode ? (
              <input
                type="email"
                value={formState.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-800">{companyData.email || "N/A"}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="text-gray-600 font-medium block mb-1">Phone</label>
            {editMode ? (
              <input
                type="text"
                value={formState.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-800">{companyData.phone || "N/A"}</p>
            )}
          </div>

          {/* Profile Status */}
          <div>
            <label className="text-gray-600 font-medium block mb-1">Profile Status</label>
            {editMode ? (
              <input
                type="text"
                value={formState.profileStatus || ""}
                onChange={(e) => handleInputChange("profileStatus", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-800">{companyData.profileStatus || "N/A"}</p>
            )}
          </div>

          {/* Created At */}
          <div>
            <label className="text-gray-600 font-medium block mb-1">Created At</label>
            <p className="text-gray-800">{companyData.createdAt || "N/A"}</p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-lg font-medium mb-2 text-gray-700">Access Levels</h3>
          {companyData.accessLevelMap ? (
            <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
              {Object.entries(companyData.accessLevelMap).map(([key, value]) => (
                <li key={key}>
                  <span className="capitalize">{key}:</span> {value ? "Yes" : "No"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">N/A</p>
          )}
        </div>

        {/* Floating Button */}
        <div className="sticky bottom-6 flex justify-end mt-8">
          <Button
            onClick={handleEditSaveClick}
            disabled={saving}
            className={`px-6 py-2 font-semibold rounded-lg ${
              editMode
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            {saving ? "Saving..." : editMode ? "Save" : "Edit"}
          </Button>
        </div>
      </section>
    )
  )}
</main>

      </SidebarInset>
    </SidebarProvider>
  );
}
