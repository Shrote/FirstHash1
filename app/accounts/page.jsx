"use client";

import { useEffect, useRef, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { Label } from "@radix-ui/react-dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AccountsPage() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.toLocaleString("default", {
      month: "long",
    })}-${now.getFullYear()}`;
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  const [newLog, setNewLog] = useState({
    type: "debit",
    amount: "",
    description: "",
    companyId: "",
  });

  useEffect(() => {
    fetchLogs();
    fetchCompanies();
  }, [selectedMonth]);

  useEffect(() => {
    const filtered = logs.filter((log) => {
      const matchesCompany =
        selectedCompany === "all" || log.companyId === selectedCompany;
      const matchesSearch =
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.amount.toString().includes(searchTerm) ||
        log.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.date &&
          log.date.toDate &&
          log.date.toDate().toLocaleDateString("en-IN").includes(searchTerm));
      return matchesCompany && matchesSearch;
    });

    setFilteredLogs(filtered);
  }, [searchTerm, logs, selectedCompany]);

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
      toast.error("Failed to load companies");
    }
  };

  const fetchLogs = async () => {
    try {
      const docRef = doc(firestore, "accounts", selectedMonth);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const entries = Object.entries(data).map(([id, entry]) => ({
          id,
          ...entry,
        }));
        setLogs(entries);
        setFilteredLogs(entries);
      } else {
        setLogs([]);
        setFilteredLogs([]);
      }
    } catch (error) {
      console.error("Error fetching account logs:", error);
    }
  };

  const handleAddLog = async () => {
    try {
      const logId = crypto.randomUUID();
      const docRef = doc(firestore, "accounts", selectedMonth);

      await updateDoc(docRef, {
        [logId]: {
          ...newLog,
          amount: Number(newLog.amount),
          date: new Date(),
          userId: localStorage.getItem("user"),
        },
      });

      toast.success("Log added successfully");
      fetchLogs();
      setNewLog({ type: "debit", amount: "", description: "", companyId: "" });

      setDialogOpen(false);
    } catch (error) {
      console.error("Error adding log:", error);
      toast.error("Failed to add log");
    }
  };

  const exportToCSV = () => {
    const headers = ["Date", "Description", "Type", "Amount"];
    const rows = filteredLogs.map((log) => [
      log.date?.toDate().toLocaleDateString("en-IN") || "",
      log.description,
      log.type,
      log.amount,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `logs-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateLast12Months = () => {
    const result = [];
    const date = new Date();
    for (let i = 0; i < 12; i++) {
      result.push(
        `${date.toLocaleString("default", {
          month: "long",
        })}-${date.getFullYear()}`
      );
      date.setMonth(date.getMonth() - 1);
    }
    return result;
  };

  const calculateTotal = () => {
    let total = 0;
    filteredLogs.forEach((log) => {
      if (log.type === "credit") total += Number(log.amount);
      else total -= Number(log.amount);
    });
    return total;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Account Logs</h2>
        <div className="flex gap-2 items-center">
          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="py-1.5 px-3 border rounded-md border-gray-300"
          >
            {generateLast12Months().map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          {/* Company Filter */}
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="py-1.5 px-3 border rounded-md border-gray-300"
          >
            <option value="all">All Companies</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          <Button onClick={exportToCSV}>Export CSV</Button>

          {/* Add Log Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Log</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Account Log</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <label className="block">
                  Type
                  <select
                    className="w-full border px-2 py-1 rounded mt-1"
                    value={newLog.type}
                    onChange={(e) =>
                      setNewLog((prev) => ({ ...prev, type: e.target.value }))
                    }
                  >
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </select>
                </label>

                <Label>Select Company</Label>
                <Select
                  onValueChange={(value) =>
                    setNewLog((prev) => ({ ...prev, companyId: value }))
                  }
                  value={newLog.companyId}
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

                <label className="block">
                  Amount
                  <Input
                    type="number"
                    value={newLog.amount}
                    onChange={(e) =>
                      setNewLog((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="block">
                  Description
                  <Input
                    value={newLog.description}
                    onChange={(e) =>
                      setNewLog((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </label>

                <div className="flex justify-between">
                  <Button onClick={handleAddLog}>Save</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Input
        placeholder="Search logs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full max-w-md"
      />

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLogs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No logs found
              </TableCell>
            </TableRow>
          ) : (
            filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {log.date?.toDate
                    ? log.date.toDate().toLocaleDateString("en-IN")
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {companies.find((c) => c.id === log.companyId)?.name || "-"}
                </TableCell>
                <TableCell>{log.description}</TableCell>
                <TableCell
                  className={
                    log.type === "debit" ? "text-red-500" : "text-green-500"
                  }
                >
                  {log.type}
                </TableCell>
                <TableCell>₹{log.amount}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        <tfoot>
          <TableRow>
            <TableCell colSpan={4} className="text-right font-bold">
              Total Balance
            </TableCell>
            <TableCell
              className={`font-bold ${
                calculateTotal() < 0 ? "text-red-500" : "text-green-500"
              }`}
            >
              ₹{calculateTotal()}
            </TableCell>
          </TableRow>
        </tfoot>
      </Table>
    </div>
  );
}
