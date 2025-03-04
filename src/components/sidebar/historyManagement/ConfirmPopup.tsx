"use client";
import React from "react";
import { AlertCircle } from "lucide-react";

const ConfirmPopup = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex items-center mb-4">
          <AlertCircle className="text-yellow-500 mr-2" size={24} />
          <h3 className="text-lg font-medium">Confirm Alert</h3>
        </div>
        <p className="mb-6 text-gray-700">{message}</p>
        <div className="flex justify-between space-x-2">
          <button
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPopup;
