// components/ui/file-input.jsx

import React from "react";
import { useController } from "react-hook-form";
import { Input } from "@/components/ui/input"; // Assuming you have an Input component

const FileInput = ({ name, control, label }) => {
  const {
    field: { onChange, onBlur, value },
  } = useController({
    name,
    control,
  });

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      onChange(e.target.files[0]); // Pass the file object to react-hook-form
    }
  };

  return (
    <div>
      {label && <label htmlFor={name}>{label}</label>}
      <Input
        type="file"
        name={name}
        accept="image/*"
        onChange={handleFileChange}
        onBlur={onBlur}
        value={value ? value.name : ""}
      />
    </div>
  );
};

export {FileInput};
