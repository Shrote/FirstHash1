"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { auth, firestore } from "@/lib/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import { onAuthStateChanged } from "firebase/auth";

export default function CompanySelection({
  selectedCompany,
  setSelectedCompany,
}) {
  const [companies, setCompanies] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    contactPerson: "",
    registrationNumber: "",
    status: "Active",
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          const docRef = doc(firestore, "users", currentUser.uid);
          const snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
            const names = Object.keys(snapshot.data().assignedCompany);
            setCompanies(names);
            if (!selectedCompany) {
              setSelectedCompany(names[0]);
            }
          }
        } else {
          setUser(null);
        }
      });
    return () => unsubscribe();
  }, []);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    const { name, email, phone } = formData;

    if (!name.trim()) {
      errors.name = "Company name is required.";
    }

    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Invalid email format.";
    }

    if (!phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(phone)) {
      errors.phone = "Phone number must be 10 digits.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    const companyId = formData.name.toLowerCase();

    const companyInfo = {
      ...formData,
      createdAt: Timestamp.now(),
    };

    try {
      await setDoc(
        doc(firestore, "dropdownMenu", "companyName"),
        { [companyId]: companyInfo },
        { merge: true }
      );

      await setDoc(doc(firestore, companyId, "details"), companyInfo);

      if (!companies.includes(formData.name)) {
        setCompanies((prev) => [...prev, formData.name]);
      }

      setSelectedCompany(formData.name);
      localStorage.setItem("selectedCompany", formData.name);
      setOpenDialog(false);
      toast.success("Company added successfully");

      resetdata();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save company");
    }
  }, [formData, companies, setSelectedCompany]);

  function resetdata() {
    setFormData({
      name: "",
      address: "",
      email: "",
      phone: "",
      contactPerson: "",
      registrationNumber: "",
      status: "Active",
    });
    setFormErrors({});
  }

  return (
    <>
      <Select
        value={selectedCompany}
        onValueChange={(value) => {
          if (value === "add-new") {
            setOpenDialog(true);
          } else {
            setSelectedCompany(value);
            localStorage.setItem("selectedCompany", value);
          }
        }}
      >
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Select a company" />
        </SelectTrigger>
        <SelectContent>
          {companies.map((company) => (
            <SelectItem key={company} value={company}>
              {company}
            </SelectItem>
          ))}
          <SelectItem value="add-new">➕ Add New Company</SelectItem>
        </SelectContent>
      </Select>

      <Dialog
        open={openDialog}
        onOpenChange={() => {
          setOpenDialog(false);
          resetdata();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { label: "Company Name", key: "name" },
              { label: "Company Address", key: "address" },
              { label: "Company Email", key: "email" },
              { label: "Company Phone", key: "phone" },
              { label: "Contact Person", key: "contactPerson" },
              { label: "Registration Number", key: "registrationNumber" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">
                  {label}
                </label>
                <Input
                  placeholder={label}
                  value={formData[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
                {formErrors[key] && (
                  <p className="text-sm text-red-500 mt-1">{formErrors[key]}</p>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
