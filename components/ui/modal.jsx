// components/ui/modal.jsx
import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from "@radix-ui/react-dialog"; // Using Radix UI for modal

export const Modal = ({ isOpen, onClose, children }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <button />
      </DialogTrigger>
      <DialogContent className="modal-content">
        <DialogTitle>Modal</DialogTitle>
        {children}
        <DialogClose asChild>
          <button className="modal-close">Close</button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
