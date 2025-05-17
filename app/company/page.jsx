"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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
  const [companyDocId, setCompanyDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchCompanyDataByName = async () => {
      setLoading(true);
      setError(null);

      const selectedCompany = localStorage.getItem("selectedCompany");
      try {
        if (!selectedCompany) {
          setError("No company selected.");
          setLoading(false);
          return;
        }

        const docRef = doc(firestore, selectedCompany, "details");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCompanyDocId(docSnap.id);
          const data = docSnap.data();
          setCompanyData(data);
          setFormState(data);
        } else {
          setError("Company details document not found.");
        }
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

  const validateForm = () => {
    const errors = {};
    if (!formState.name) errors.name = "Name is required.";
    if (!formState.email || !/\S+@\S+\.\S+/.test(formState.email))
      errors.email = "Valid email is required.";
    if (!formState.phone || !/^\d{10}$/.test(formState.phone))
      errors.phone = "Valid 10-digit phone required.";
    if (!formState.status) errors.status = "Profile status is required.";
    return errors;
  };

  const handleEditSaveClick = async () => {
    if (editMode) {
      setSaving(true);
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setSaving(false);
        return;
      }

      try {
        const selectedCompany = localStorage.getItem("selectedCompany");
        const companyDocRef = doc(firestore, selectedCompany, "details");

        const { accessLevelMap, ...updatableFields } = formState;
        await updateDoc(companyDocRef, updatableFields);

        setCompanyData({ ...companyData, ...updatableFields });
        setEditMode(false);
        setValidationErrors({});
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

  const handleCancel = () => {
    setEditMode(false);
    setFormState(companyData);
    setValidationErrors({});
  };

  const renderField = (label, field, type = "text") => (
    <div>
      <label className="text-gray-600 font-medium block mb-1">{label}</label>
      {editMode ? (
        <>
          <input
            type={type}
            value={formState[field] || ""}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {validationErrors[field] && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors[field]}
            </p>
          )}
        </>
      ) : (
        <p className="text-gray-800">{companyData[field] || "N/A"}</p>
      )}
    </div>
  );

  return (
    <>
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
                {renderField("Name", "name")}
                {renderField("Email", "email", "email")}
                {renderField("Phone", "phone", "tel")}
                {renderField("Contact Person", "contactPerson")}
                {renderField("Address", "address")}
                {renderField("Registation Number", "registrationNumber")}
                <div>
                  <label className="text-gray-600 font-medium block mb-1">
                    Profile Status
                  </label>
                  {editMode ? (
                    <>
                      <select
                        value={formState.status || ""}
                        onChange={(e) =>
                          handleInputChange("status", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      {validationErrors["status"] && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors["status"]}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-800">
                      {companyData.status || "N/A"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-gray-600 font-medium block mb-1">
                    Created At
                  </label>
                  <p className="text-gray-800">
                    {companyData.createdAt
                      ? companyData.createdAt.toDate().toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="sticky bottom-6 flex justify-end mt-8">
                {editMode && (
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="mr-2"
                  >
                    Cancel
                  </Button>
                )}
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
    </>
  );
}
