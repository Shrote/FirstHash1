"use client";

import { useState, useEffect, useRef } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { toast } from "@/components/ui/use-toast";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function AddProjectForm({ onClose }) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    company: "",
    client: "",
    projectName: "",
    fromDate: "",
    toDate: "",
    description: "",
    priority: "",
    projectBudget: "",
    deliverables: [],
  });

  const [errors, setErrors] = useState({});
  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);
  const [deliverablesList, setDeliverablesList] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const docRef = doc(firestore, "dropdownMenu", "companyName");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const list = Object.entries(data).map(([id, val]) => ({
            id,
            name: val.name,
          }));
          setCompanies(list);
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load companies",
        });
      }
    };
    fetchCompanies();
  }, []);

  // Fetch clients when company changes
  useEffect(() => {
    if (!formData.company) return;
    const fetchClients = async () => {
      try {
        const querySnap = await getDocs(collection(firestore, "clients"));
        const list = querySnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClients(list);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load clients",
        });
      }
    };
    fetchClients();
  }, [formData.company]);

  // Fetch deliverables
  useEffect(() => {
    const fetchDeliverables = async () => {
      try {
        const querySnap = await getDocs(collection(firestore, "deliverables"));
        const list = querySnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDeliverablesList(list);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load deliverables",
        });
      }
    };
    fetchDeliverables();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.company) newErrors.company = "Company is required";
    if (!formData.client) newErrors.client = "Client is required";
    if (!formData.projectName.trim())
      newErrors.projectName = "Project name is required";
    if (!formData.fromDate) newErrors.fromDate = "From date is required";
    if (!formData.toDate) newErrors.toDate = "To date is required";
    if (formData.deliverables.length === 0) 
      newErrors.deliverables = "At least one deliverable is required";
    if (!formData.projectBudget)
      newErrors.projectBudget = "Project budget is required";
    if (
      formData.fromDate &&
      formData.toDate &&
      new Date(formData.toDate) < new Date(formData.fromDate)
    ) {
      newErrors.toDate = "To date cannot be before From date";
    }
    if (!formData.priority) newErrors.priority = "Priority is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleDeliverableChange = (deliverableId) => {
    setFormData((prev) => {
      const newDeliverables = prev.deliverables.includes(deliverableId)
        ? prev.deliverables.filter(id => id !== deliverableId)
        : [...prev.deliverables, deliverableId];
      return { ...prev, deliverables: newDeliverables };
    });
    setErrors((prev) => ({ ...prev, deliverables: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await addDoc(collection(firestore, "projects"), {
        companyId: formData.company,
        clientId: formData.client,
        projectName: formData.projectName,
        projectTimeline: `${formData.fromDate} to ${formData.toDate}`,
        description: formData.description,
        priority: formData.priority,
        createdAt: serverTimestamp(),
        status: "pending",
        createdBy: "system",
        projectBudget: formData.projectBudget,
        deliverables: formData.deliverables,
      });

      toast({
        title: "Project Created",
        description: `Project "${formData.projectName}" was added successfully.`,
      });

      setFormData({
        company: "",
        client: "",
        projectName: "",
        fromDate: "",
        toDate: "",
        description: "",
        priority: "",
        projectBudget: "",
        deliverables: [],
      });
      setErrors({});

      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message,
      });
    }
  };

  const renderError = (key) =>
    errors[key] && <p className="text-sm text-red-600 mt-1">{errors[key]}</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      {/* Company */}
      <div>
        <label className="block text-sm font-medium">Company</label>
        <select
          name="company"
          value={formData.company}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Select company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {renderError("company")}
      </div>

      {/* Client */}
      <div>
        <label className="block text-sm font-medium">Client</label>
        <select
          name="client"
          value={formData.client}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Select client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {renderError("client")}
      </div>

      {/* Project Name */}
      <div>
        <label className="block text-sm font-medium">Project Name</label>
        <input
          name="projectName"
          placeholder="Project Name"
          value={formData.projectName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        {renderError("projectName")}
      </div>

      {/* Deliverables */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium">Deliverables</label>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full p-2 border rounded text-left flex justify-between items-center"
        >
          {formData.deliverables.length > 0
            ? `${formData.deliverables.length} selected`
            : "Select deliverables"}
          <svg
            className={`w-4 h-4 ml-2 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-auto">
            {deliverablesList.map((del) => (
              <label
                key={del.id}
                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.deliverables.includes(del.id)}
                  onChange={() => handleDeliverableChange(del.id)}
                  className="mr-2"
                />
                {del.title}
              </label>
            ))}
          </div>
        )}
        {renderError("deliverables")}
      </div>

      {/* From Date */}
      <div>
        <label className="block text-sm font-medium">From Date</label>
        <input
          type="date"
          name="fromDate"
          value={formData.fromDate}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        {renderError("fromDate")}
      </div>

      {/* To Date */}
      <div>
        <label className="block text-sm font-medium">To Date</label>
        <input
          type="date"
          name="toDate"
          value={formData.toDate}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        {renderError("toDate")}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium">Priority</label>
        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Select priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        {renderError("priority")}
      </div>

      {/* Project Budget */}
      <div>
        <label className="block text-sm font-medium">Project Budget</label>
        <input
          name="projectBudget"
          placeholder="Project Budget"
          value={formData.projectBudget}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        {renderError("projectBudget")}
      </div>

      <Button className="w-full" type="submit">
        Save Project
      </Button>
    </form>
  );
}