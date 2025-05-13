// components/ui/use-toast.js

import { toast } from "react-toastify"; // Import toast from react-toastify

// Create the useToast hook
export const useToast = () => {
  const showToast = (message, type = "success") => {
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "info":
        toast.info(message);
        break;
      case "warning":
        toast.warning(message);
        break;
      default:
        toast(message); // Default toast (success)
    }
  };

  return { showToast };
};
