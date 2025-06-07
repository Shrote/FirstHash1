'use client';

import { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function AddProjectForm({ onClose }) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    company: '',
    client: '',
    projectName: '',
    fromDate: '',
    toDate: '',
    description: '',
    priority: '',
  });

  const [errors, setErrors] = useState({});
  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const docRef = doc(firestore, 'dropdownMenu', 'companyName');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const list = Object.entries(data).map(([id, val]) => ({ id, name: val.name }));
          setCompanies(list);
        }
      } catch (err) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load companies' });
      }
    };
    fetchCompanies();
  }, []);

  // Fetch clients when company changes
  useEffect(() => {
    if (!formData.company) return;
    const fetchClients = async () => {
      try {
        const querySnap = await getDocs(collection(firestore, 'clients'));
        const list = querySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setClients(list);
      } catch (err) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load clients' });
      }
    };
    fetchClients();
  }, [formData.company]);

  const validate = () => {
    const newErrors = {};
    if (!formData.company) newErrors.company = 'Company is required';
    if (!formData.client) newErrors.client = 'Client is required';
    if (!formData.projectName.trim()) newErrors.projectName = 'Project name is required';
    if (!formData.fromDate) newErrors.fromDate = 'From date is required';
    if (!formData.toDate) newErrors.toDate = 'To date is required';
    if (
      formData.fromDate &&
      formData.toDate &&
      new Date(formData.toDate) < new Date(formData.fromDate)
    ) {
      newErrors.toDate = 'To date cannot be before From date';
    }
    if (!formData.priority) newErrors.priority = 'Priority is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await addDoc(collection(firestore, 'projects'), {
        companyId: formData.company,
        clientId: formData.client,
        projectName: formData.projectName,
        projectTimeline: `${formData.fromDate} to ${formData.toDate}`,
        description: formData.description,
        priority: formData.priority,
        createdAt: serverTimestamp(),
        status: 'active',
        createdBy: 'system',
      });

      toast({
        title: 'Project Created',
        description: `Project "${formData.projectName}" was added successfully.`,
      });

      if (onClose) onClose(); // Close modal or dialog
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const renderError = (key) =>
    errors[key] && <p className="text-sm text-red-600 mt-1">{errors[key]}</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[85vh] overflow-y-auto p-4">
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
        {renderError('company')}
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
        {renderError('client')}
      </div>

      {/* Project Name */}
      <div>
        <input
          name="projectName"
          placeholder="Project Name"
          value={formData.projectName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        {renderError('projectName')}
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
        {renderError('fromDate')}
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
        {renderError('toDate')}
      </div>

      {/* Description */}
      <div>
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
        {renderError('priority')}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Save Project
      </button>
    </form>
  );
}
