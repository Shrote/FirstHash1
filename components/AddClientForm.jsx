"use client";

import { useState } from "react";
import { firestore } from "@/lib/firebase";
import { serverTimestamp, addDoc, collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function AddClientForm({ onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Valid email is required";
    if (!formData.phone.match(/^\d{10}$/))
      newErrors.phone = "Phone must be 10 digits";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    await addDoc(collection(firestore, "clients"), {
      ...formData,
      createdAt: serverTimestamp(),
    });

    toast({
      title: "Client created",
      description: `Profile for ${formData.name} saved successfully.`,
    });

    if (onClose) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Full Name"
        className="w-full p-2 border rounded"
      />
      {errors.name && <p className="text-red-500 !mt-1">{errors.name}</p>}

      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        className="w-full p-2 border rounded"
      />
      {errors.email && <p className="text-red-500 !mt-1">{errors.email}</p>}

      <input
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Phone Number"
        className="w-full p-2 border rounded"
      />
      {errors.phone && <p className="text-red-500 !mt-1">{errors.phone}</p>}

      <input
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Address"
        className="w-full p-2 border rounded"
      />
      {errors.address && <p className="text-red-500 !mt-1">{errors.address}</p>}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Save Client
      </button>
    </form>
  );
}
