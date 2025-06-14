"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { firestore } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";

const BillingDialog = () => {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      const snapshot = await getDocs(collection(firestore, "clients"));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClients(data);
    };

    const fetchProjects = async () => {
      const snapshot = await getDocs(collection(firestore, "projects"));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(data);
    };

    fetchClients();
    fetchProjects();
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open Billing Info</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogTitle>Client & Project Billing</DialogTitle>

        <div className="space-y-4">
          <div>
            <Label>Select Client</Label>
            <select
              className="w-full border rounded px-3 py-2"
              onChange={(e) =>
                setSelectedClient(
                  clients.find((c) => c.id === e.target.value) || null
                )
              }
            >
              <option value="">-- Select --</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {selectedClient && (
            <div className="space-y-2">
              <Label>Client Email</Label>
              <Input value={selectedClient.email} readOnly />
              <Label>Client Address</Label>
              <Input value={selectedClient.address} readOnly />
            </div>
          )}

          <div>
            <Label>Select Project</Label>
            <select
              className="w-full border rounded px-3 py-2"
              onChange={(e) =>
                setSelectedProject(
                  projects.find((p) => p.id === e.target.value) || null
                )
              }
            >
              <option value="">-- Select --</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.projectName}
                </option>
              ))}
            </select>
          </div>

          {selectedProject && (
            <div className="space-y-2">
              <Label>Project Description</Label>
              <Input value={selectedProject.description} readOnly />
              <Label>Project Budget</Label>
              <Input value={selectedProject.projectBudget} readOnly />
              <Label>Project Timeline</Label>
              <Input value={selectedProject.projectTimeline} readOnly />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BillingDialog;
