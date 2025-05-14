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
    userName: "",
    userPhone: "",
    userEmail: "",
    userAddress: "",
  });

  // Fetch company names from map keys
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

  const handleSave = async () => {
    const {
      name,
      address,
      phone,
      contactPersons,
      userName,
      userPhone,
      userEmail,
      userAddress,
    } = formData;

    if (!name || !userName || !userPhone || !userEmail || !userAddress) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      // Step 1: Create Firebase Auth user (password = phone)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userEmail,
        userPhone // phone used as password
      );

      const uid = userCredential.user.uid;

      // Step 2: Save company data inside map
      const companyDocRef = doc(firestore, "dropdownMenu", "companyName");
      await setDoc(
        companyDocRef,
        {
          [name]: {
            name,
            address,
            phone,
            contactPersons,
          },
        },
        { merge: true }
      );

      // Step 3: Save user info inside <company>/users
      const userDocRef = doc(firestore, name, "users");
      await setDoc(userDocRef, {
        uId: uid,
        userName,
        userPhone,
        userEmail,
        userAddress,
      });

      // Step 4: Update dropdown UI
      setCompanies((prev) => [...prev, name]);
      setSelectedCompany(name);
      setOpenDialog(false);
      toast.success("Company and user created!");

      // Reset form
      setFormData({
        name: "",
        address: "",
        phone: "",
        contactPersons: "",
        userName: "",
        userPhone: "",
        userEmail: "",
        userAddress: "",
      });
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
            {/* Company Info */}
            <Input
              placeholder="Company Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              placeholder="Company Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <Input
              placeholder="Company Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              placeholder="Contact Persons"
              value={formData.contactPersons}
              onChange={(e) => setFormData({ ...formData, contactPersons: e.target.value })}
            />

            {/* Divider */}
            <hr />
            <p className="text-sm font-semibold">User Info</p>

            {/* User Info */}
            <Input
              placeholder="User Name"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
            />
            <Input
              placeholder="User Phone"
              value={formData.userPhone}
              onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
            />
            <Input
              placeholder="User Email"
              value={formData.userEmail}
              onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
            />
            <Input
              placeholder="User Address"
              value={formData.userAddress}
              onChange={(e) => setFormData({ ...formData, userAddress: e.target.value })}
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
