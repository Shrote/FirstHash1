// components/CustomModal.js
import React from "react";
import Modal from "react-modal";

if (typeof window !== "undefined") {
  Modal.setAppElement(null); // This disables app element hiding for accessibility
}

const CustomModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose}>
      <div>
        <h2>My Modal</h2>
        <button onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
};

export default CustomModal;
