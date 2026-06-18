// src/constants/index.js
// PURPOSE: Single source of truth for all shared constants.
// If you add a new status, update it HERE only.
// Every component reads from here automatically.

export const STATUS_OPTIONS = [
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
];

export const STATUS_STYLES = {
  Applied:      "bg-blue-100 text-blue-700 border border-blue-200",
  Interviewing: "bg-amber-100 text-amber-700 border border-amber-200",
  Offer:        "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Rejected:     "bg-red-100 text-red-600 border border-red-200",
};

export const STATUS_COLORS = {
  Applied:      "bg-blue-500",
  Interviewing: "bg-amber-400",
  Offer:        "bg-emerald-400",
  Rejected:     "bg-red-500",
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;