"use client";

import { useState } from "react";
import { auth, firestore } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { toast } from "@/components/ui/use-toast";
import { useToast } from "@/hooks/use-toast";
import { date } from "zod";

export default function AddEmployeeForm({ onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    userType: "",
    gender: "",
    salary: "",
    
  });
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Use phone as password just for example (NOT RECOMMENDED in production)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.phone
      );

      const uid = userCredential.user.uid;

      await setDoc(doc(firestore, "users", uid), {
        ...formData,
        createdAt: serverTimestamp(),
        profileStatus: "Active",
        accessLevelMap: {
          company: true,
          user: true,
          dashboard: true,
          logs: true,
          employee:true,
          client:true,
        },
      });

      toast({
        title: "User created",
        description: `Profile for ${formData.name} saved successfully.`,
      });

      if (onClose) onClose(); // Close popup
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error creating user",
        description: error.message,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Full Name"
        required
        className="w-full p-2 border rounded"
      />

      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
        className="w-full p-2 border rounded"
      />

      <input
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Phone Number"
        required
        className="w-full p-2 border rounded"
      />

      <input
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Address"
        required
        className="w-full p-2 border rounded"
      />
      <input
        name="salary"
        value={formData.salary}
        onChange={handleChange}
        placeholder="Salary"
        required
        className="w-full p-2 border rounded"
      />

      <select
        name="userType"
        value={formData.userType}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      >
        <option value="">Select User Type</option>
        <option value="admin">Admin</option>
        <option value="employee">Employee</option>
        <option value="client">Manager</option>
      </select>

      <select
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      >
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>

      {/* <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      >
        <option value="">Select Role</option>
        <option value="manager">Manager</option>
        <option value="developer">Developer</option>
        <option value="sales">Sales</option>
      </select> */}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Save User
      </button>
    </form>
  );
}
