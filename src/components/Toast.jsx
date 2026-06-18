// src/components/Toast.jsx
// PURPOSE: Small popup notification at the bottom-right corner.
// Auto-disappears after 3 seconds.
// Props:
//   message → string: text to show
//   type    → "success" | "error"
//   onClose → function: called when timer ends (hides the toast)

import { useEffect } from "react";

export default function Toast({ message, type, onClose }) {
  // useEffect: runs the timer when Toast appears.
  // Calls onClose() after 3 seconds to hide it.
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer); // cleanup if component unmounts early
  }, [onClose]);

  const colors = {
    success: "bg-emerald-800 border-emerald-600 text-emerald-100",
    error:   "bg-red-900 border-red-700 text-red-100",
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 border rounded-lg 
      px-4 py-3 text-sm font-medium shadow-xl 
      ${colors[type] || colors.success}`}>
      {message}
    </div>
  );
}