import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { firestore } from "@/lib/firebase"; // adjust path
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
} from "firebase/firestore";

const DEPARTMENTS = ["IT", "Electrical", "Mechanical", "Another"];

const AddProject = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");

  const [selectedDepartment, setSelectedDepartment] = useState("");

  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");

  const [projectName, setProjectName] = useState("");
  const [projectTimeline, setProjectTimeline] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch companies from dropdownMenu -> companyName (map of companies)
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const docRef = doc(firestore, "dropdownMenu", "companyName");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const companyMap = docSnap.data();
          const companyList = Object.entries(companyMap).map(([key, value]) => ({
            id: key,
            data: value,
          }));
          setCompanies(companyList);
        } else {
          toast.error("Company document not found.");
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
        toast.error("Failed to fetch companies");
      }
    };

    fetchCompanies();
  }, []);

  // Fetch clients after company is selected
  useEffect(() => {
    if (!selectedCompany) {
      setClients([]);
      setSelectedClient("");
      return;
    }

    const fetchClients = async () => {
      try {
        const clientSnap = await getDocs(collection(firestore, "clients"));
        const clientList = clientSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClients(clientList);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Failed to fetch clients");
      }
    };

    fetchClients();
  }, [selectedCompany]);

  // Fetch managers based on selected company and department
  useEffect(() => {
    if (!selectedCompany || !selectedDepartment) {
      setManagers([]);
      setSelectedManager("");
      return;
    }

    const fetchManagers = async () => {
      try {
        const usersRef = collection(firestore, "users");
        const q = query(usersRef, where("userType", "==", "manager"));
        const querySnapshot = await getDocs(q);

        const filteredManagers = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter(
            (user) =>
              user.assignedCompany &&
              typeof user.assignedCompany === "object" &&
              selectedCompany in user.assignedCompany
          )
          .map((user) => ({
            id: user.id,
            name: user.name || user.displayName || "Unnamed Manager",
            ...user,
          }));

        setManagers(filteredManagers);
        setSelectedManager("");
      } catch (error) {
        console.error("Error fetching managers:", error);
        toast.error("Failed to fetch managers");
      }
    };

    fetchManagers();
  }, [selectedCompany, selectedDepartment]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCompany) {
      toast.error("Please select a company");
      return;
    }
    if (!selectedClient) {
      toast.error("Please select a client");
      return;
    }
    if (!selectedDepartment) {
      toast.error("Please select a department");
      return;
    }
    if (!selectedManager) {
      toast.error("Please select a manager");
      return;
    }
    if (!projectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    if (!projectTimeline.trim()) {
      toast.error("Please enter project timeline");
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(firestore, "projects"), {
        projectName,
        companyId: selectedCompany,
        department: selectedDepartment,
        managerId: selectedManager,
        clientId: selectedClient,
        projectTimeline,
        description,
        createdAt: new Date(),
      });

      toast.success("Project added successfully!");

      setSelectedCompany("");
      setSelectedClient("");
      setSelectedDepartment("");
      setSelectedManager("");
      setProjectName("");
      setProjectTimeline("");
      setDescription("");
      setManagers([]);
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("Failed to add project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Company dropdown */}
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700">
          Company <span className="text-red-500">*</span>
        </label>
        <select
          id="company"
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          required
        >
          <option value="">Select company</option>
          {companies.map(({ id, data }) => (
            <option key={id} value={id}>
              {data.name || id}
            </option>
          ))}
        </select>
      </div>

      {/* Client dropdown (only after company selected) */}
      {selectedCompany && (
        <div>
          <label htmlFor="client" className="block text-sm font-medium text-gray-700">
            Client <span className="text-red-500">*</span>
          </label>
          <select
            id="client"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            required
          >
            <option value="">Select client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Department dropdown */}
      <div>
        <label htmlFor="department" className="block text-sm font-medium text-gray-700">
          Department <span className="text-red-500">*</span>
        </label>
        <select
          id="department"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          required
          disabled={!selectedCompany}
        >
          <option value="">Select department</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Manager dropdown */}
      <div>
        <label htmlFor="manager" className="block text-sm font-medium text-gray-700">
          Manager <span className="text-red-500">*</span>
        </label>
        <select
          id="manager"
          value={selectedManager}
          onChange={(e) => setSelectedManager(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          required
          disabled={!managers.length}
        >
          <option value="">Select manager</option>
          {managers.map((mgr) => (
            <option key={mgr.id} value={mgr.id}>
              {mgr.name}
            </option>
          ))}
        </select>
      </div>

      {/* Project Name */}
      <div>
        <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
          Project Name <span className="text-red-500">*</span>
        </label>
        <input
          id="projectName"
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          placeholder="Enter project name"
          required
        />
      </div>

      {/* Project Timeline */}
      <div>
        <label htmlFor="projectTimeline" className="block text-sm font-medium text-gray-700">
          Project Timeline <span className="text-red-500">*</span>
        </label>
        <input
          id="projectTimeline"
          type="text"
          value={projectTimeline}
          onChange={(e) => setProjectTimeline(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          placeholder="e.g., Jan 2025 - Dec 2025"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          placeholder="Enter project description"
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 ${
          isSubmitting ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isSubmitting ? "Adding..." : "Add Project"}
      </button>
    </form>
  );
};

export default AddProject;
