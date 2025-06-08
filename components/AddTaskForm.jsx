"use client";

import { useState, useEffect, useRef } from "react";
import { firestore } from "@/lib/firebase";
import {
  doc,
  setDoc,
  collection,
  serverTimestamp,
  getDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";

export default function AddTaskForm({ onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: [],
    companyName: "",
    projectName: "",
    status: "pending",
    dueDate: "",
  });

  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState({
    companies: true,
    users: false,
    projects: false,
  });

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const docRef = doc(firestore, "dropdownMenu", "companyName");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const companyList = Object.entries(data).map(([id, company]) => ({
            id,
            name: company.name,
          }));
          setCompanies(companyList);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load companies",
        });
      } finally {
        setLoading((prev) => ({ ...prev, companies: false }));
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    if (!formData.companyName) return;

    const fetchUsers = async () => {
      try {
        setLoading((prev) => ({ ...prev, users: true }));
        const querySnapshot = await getDocs(collection(firestore, "users"));
        const userList = [];

        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          if (
            userData.assignedCompany &&
            userData.assignedCompany[formData.companyName]
          ) {
            userList.push({
              id: doc.id,
              name: userData.name,
              email: userData.email,
            });
          }
        });

        setUsers(userList);
      } catch (error) {
        // console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading((prev) => ({ ...prev, users: false }));
      }
    };

    fetchUsers();
  }, [formData.companyName]);

  useEffect(() => {
    if (!formData.companyName) return;

    const fetchProjects = async () => {
      try {
        setLoading((prev) => ({ ...prev, projects: true }));
        const querySnapshot = await getDocs(collection(firestore, "projects"));
        const projectList = [];

        querySnapshot.forEach((doc) => {
          const projectData = doc.data();
          if (projectData.companyId === formData.companyName) {
            projectList.push({
              id: doc.id,
              name: projectData.projectName,
            });
          }
        });

        setProjects(projectList);
      } catch (error) {
        toast.error("Error fetching projects:", error);
      } finally {
        setLoading((prev) => ({ ...prev, projects: false }));
      }
    };

    fetchProjects();
  }, [formData.companyName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserSelect = (userId) => {
    setFormData((prev) => {
      const newAssignedTo = prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter((id) => id !== userId)
        : [...prev.assignedTo, userId];
      return { ...prev, assignedTo: newAssignedTo };
    });
  };
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setOpen(!open);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const id = uuidv4();
      const dueDateTimestamp = Timestamp.fromDate(new Date(formData.dueDate));
      await setDoc(doc(collection(firestore, "project_tasks"), id), {
        ...formData,
        dueDate: dueDateTimestamp,
        createdAt: serverTimestamp(),
      });
      if (onClose) onClose();
      toast.success("Task added!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 overflow-y-auto ">
      <div>
        <label className="block text-sm font-medium mb-1">Task Title</label>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Task Title"
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Task Description"
          required
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Company</label>
        <Select
          onValueChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              companyName: value,
              assignedTo: [],
              projectName: "",
            }))
          }
          value={formData.companyName}
          disabled={loading.companies}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Project</label>
        <Select
          onValueChange={(projectId) => {
            const selectedProject = projects.find((p) => p.id === projectId);
            if (selectedProject) {
              setFormData((prev) => ({
                ...prev,
                projectName: selectedProject.name, // store project name instead of id
              }));
            }
          }}
          value={
            projects.find((p) => p.name === formData.projectName)?.id || ""
          }
          disabled={loading.projects || !formData.companyName}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium mb-1">Assign To</label>
        <button
          type="button"
          onClick={toggleDropdown}
          className="w-full p-2 border rounded bg-white text-left"
        >
          {formData.assignedTo.length > 0
            ? `${formData.assignedTo.length} user(s) selected`
            : "Select users"}
        </button>

        {open && (
          <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto border bg-white rounded shadow p-2 space-y-1">
            {loading.users ? (
              <p className="text-sm text-gray-500">Loading users...</p>
            ) : users.length > 0 ? (
              users.map((user) => (
                <label
                  key={user.id}
                  htmlFor={`user-${user.id}`}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    id={`user-${user.id}`}
                    checked={formData.assignedTo.includes(user.id)}
                    onChange={() => handleUserSelect(user.id)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <span className="text-sm">
                    {user.name} ({user.email})
                  </span>
                </label>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                {formData.companyName
                  ? "No users found for this company"
                  : "Select a company first"}
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <Select
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, status: value }))
          }
          value={formData.status}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Due Date</label>
        <input
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <Button type="submit" className="w-full">
        Save Task
      </Button>
    </form>
  );
}
