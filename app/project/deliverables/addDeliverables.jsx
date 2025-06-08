import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { firestore } from "@/lib/firebase";
import { Toast } from "@radix-ui/react-toast";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import toast, { ToastBar } from "react-hot-toast";

const AddDeliverablesForm = ({ onClose, editingData }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [selectedCompany, setSelectedCompany] = useState("");

  useEffect(() => {
    const company = localStorage.getItem("selectedCompany");
    if (company) setSelectedCompany(company);

    if (editingData) {
      setFormData({
        title: editingData.title || "",
        description: editingData.description || "",
      });
    }
  }, [editingData]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description } = formData;
    if (!title || !description) {
      toast.error("Please fill all fields.");
      return;
    }

    try {
      const payload = {
        title,
        description,
        company: selectedCompany,
        ...(editingData ? {} : { createdAt: serverTimestamp() }),
      };

      if (editingData?.id) {
        await updateDoc(
          doc(firestore, "deliverables", editingData.id),
          payload
        );
        toast.success("Deliverable updated!");
      } else {
        await addDoc(collection(firestore, "deliverables"), payload);
        toast.success("Deliverable added!");
      }

      onClose();
    //   toast.success("Deliverable added!");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <Input name="title" value={formData.title} onChange={handleChange} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit">
          {editingData ? "Update" : "Add"} Deliverable
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
      {/* <ToastBar /> */}
    </form>
  );
};

export default AddDeliverablesForm;