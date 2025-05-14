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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { firestore } from "@/lib/firebase";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function CompanySelection({ selectedCompany, setSelectedCompany }) {
  const [companies, setCompanies] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    contactPersons: "",
    registrationNumer: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCompanies = async () => {
      const snapshot = await getDocs(collection(firestore, "companyName"));
      const names = snapshot.docs.map(doc => doc.id);
      setCompanies(names);
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
    if (!validate()) return;

    try {
      const { name, address, phone, contactPersons, registrationNumer } = formData;
      await setDoc(doc(firestore, "companyName", name), {
        name,
        address,
        phone,
        contactPersons,
        registrationNumer,
      });
      setCompanies(prev => [...prev, name]);
      setSelectedCompany(name);
      setOpenDialog(false);
      toast.success("Company added successfully!");
      setFormData({ name: "", address: "", phone: "", contactPersons: "", registrationNumer: "" });
      setErrors({});
    } catch (err) {
      toast.error("Error saving company");
      console.error(err);
    }
  };

  return (
    <>
      <Select value={selectedCompany} onValueChange={value => {
        if (value === "add-new") {
          setOpenDialog(true);
        } else {
          setSelectedCompany(value);
        }
      }}>
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
            <div>
              <Input
                placeholder="Company Name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <Input
                placeholder="Company Address"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>
            <div>
              <Input
                placeholder="Phone"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
            <div>
              <Input
                placeholder="Contact Persons"
                value={formData.contactPersons}
                onChange={e => setFormData({ ...formData, contactPersons: e.target.value })}
              />
              {errors.contactPersons && <p className="text-red-500 text-sm mt-1">{errors.contactPersons}</p>}
            </div>
            <div>
              <Input
                placeholder="Registration No"
                value={formData.registrationNumer}
                onChange={e => setFormData({ ...formData, registrationNumer: e.target.value })}
              />
              {errors.registrationNumer && <p className="text-red-500 text-sm mt-1">{errors.registrationNumer}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
