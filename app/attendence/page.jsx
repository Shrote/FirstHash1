"use client";
import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { firestore } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";

// Format date to yyyy-mm-dd
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [editable, setEditable] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  const selectedCompany =
    typeof window !== "undefined"
      ? localStorage.getItem("selectedCompany")
      : null;

  // Fetch users assigned to selectedCompany
  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(firestore, "users"));
      const users = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.assignedCompany && data.assignedCompany[selectedCompany]) {
          users.push({ id: docSnap.id, ...data });
        }
      });
      setEmployees(users);
    };

    if (selectedCompany) {
      fetchUsers();
    }
  }, [selectedCompany]);

  // Fetch attendance data for the selected date
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedDate) return;
      const attendanceRef = doc(firestore, "attendance", selectedDate);
      const attendanceSnap = await getDoc(attendanceRef);
      if (attendanceSnap.exists()) {
        setAttendanceData(attendanceSnap.data());
      } else {
        setAttendanceData({});
      }
    };

    fetchAttendance();
  }, [selectedDate]);

  const handleStatusChange = (userId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [userId]: status,
    }));
  };

  const handleSave = async () => {
    try {
      const attendanceRef = doc(firestore, "attendance", selectedDate);

      // Get all employees marked "present"
      const presentEmployees = Object.entries(attendanceData)
        .filter(([_, status]) => status === "present")
        .map(([userId]) => userId);

      const updatePayload = {
        // ...attendanceData,
        [selectedCompany]: presentEmployees,
      };

      await setDoc(attendanceRef, updatePayload, { merge: true });
      toast.success("Attendance data saved successfully!");
      setEditable(false);
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error("Failed to save attendance data.");
    }
  };

  return (
    <>
      <Toaster position="top-right" />

      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <div className="flex items-center gap-2 w-full">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Attendance</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="space-y-4 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-semibold text-gray-900">Attendance</h2>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-48"
          />
        </div>

        <div className="overflow-x-auto mt-4 border rounded-md">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100 text-left text-gray-700">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-2">
                    {user.displayName || user.name || "Unnamed"}
                  </td>
                  <td className="px-4 py-2">
                    {editable ? (
                      <select
                        value={attendanceData[user.id] || ""}
                        onChange={(e) =>
                          handleStatusChange(user.id, e.target.value)
                        }
                        className="border p-1 rounded"
                      >
                        <option value="">Mark Attendance</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                      </select>
                    ) : (
                      attendanceData[user.id] || "Mark Attendance"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-right">
          <button
            onClick={() => {
              if (editable) {
                handleSave();
              } else {
                setEditable(true);
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {editable ? "Save" : "Edit"}
          </button>
        </div>
      </div>
    </>
  );
}

export default AttendancePage;
