"use client";

import { useEffect, useState } from "react";
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
import { firestore, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import toast from "react-hot-toast";

export default function CompanySelection({ selectedCompany, setSelectedCompany }) {
  const [companies, setCompanies] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    contactPersons: "",
  });

  // Fetch companies from Firestore
  useEffect(() => {
    const fetchCompanies = async () => {
      const companyDocRef = doc(firestore, "dropdownMenu", "companyName");
      const snapshot = await getDoc(companyDocRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const names = Object.keys(data);
        setCompanies(names);
      }
    };
    fetchCompanies();
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Company name is required.";
    if (!formData.address.trim()) newErrors.address = "Address is required.";
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits.";
    }

    if (!formData.contactPersons.trim()) newErrors.contactPersons = "Contact person is required.";

    if (formData.registrationNumer.trim() && !/^[A-Za-z0-9\-]+$/.test(formData.registrationNumer)) {
      newErrors.registrationNumer = "Invalid registration number format.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    const { name, address, phone, contactPersons } = formData;

    if (!name) {
      toast.error("Company name is required");
      return;
    }

    try {
      await setDoc(doc(firestore, "companyName", name), {
        name,
        address,
        phone,
        contactPersons,
      });
      setCompanies(prev => [...prev, name]);
      setSelectedCompany(name);
      setOpenDialog(false);
      toast.success("Company added successfully!");
      setFormData({ name: "", address: "", phone: "", contactPersons: "" });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to create user or company");
    }
  };

  return (
    <>
      <Select
        value={selectedCompany}
        onValueChange={(value) => {
          if (value === "add-new") {
            setOpenDialog(true);
          } else {
            setSelectedCompany(value);
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

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Company Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              placeholder="Company Address"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
            <Input
              placeholder="Phone"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              placeholder="Contact Persons"
              value={formData.contactPersons}
              onChange={e => setFormData({ ...formData, contactPersons: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
