import React from "react";

const Toast = ({ showToast }) => {
  if (!showToast) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`px-4 py-2 rounded text-white font-medium ${
        showToast.type === "success" ? "bg-green-500" : "bg-red-500"
      }`}>
        {showToast.message}
      </div>
    </div>
  );
};

export default Toast; 