// src/constants/timeline.js
export const EVENT_TYPES = [
  "Applied",
  "Recruiter Contact",
  "Online Assessment",
  "Technical Interview",
  "HR Interview",
  "Final Interview",
  "Offer Received",
  "Offer Accepted",
  "Rejected",
  "Joining Date",
  "Follow Up",
  "Custom Event",
];

export const EVENT_TYPE_STYLES = {
  "Applied":              { bg: "bg-blue-500/10",    text: "text-blue-400",    border: "border-blue-500/30",    dot: "bg-blue-400"    },
  "Recruiter Contact":    { bg: "bg-purple-500/10",  text: "text-purple-400",  border: "border-purple-500/30",  dot: "bg-purple-400"  },
  "Online Assessment":    { bg: "bg-yellow-500/10",  text: "text-yellow-400",  border: "border-yellow-500/30",  dot: "bg-yellow-400"  },
  "Technical Interview":  { bg: "bg-orange-500/10",  text: "text-orange-400",  border: "border-orange-500/30",  dot: "bg-orange-400"  },
  "HR Interview":         { bg: "bg-pink-500/10",    text: "text-pink-400",    border: "border-pink-500/30",    dot: "bg-pink-400"    },
  "Final Interview":      { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/30",     dot: "bg-red-400"     },
  "Offer Received":       { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-400" },
  "Offer Accepted":       { bg: "bg-green-500/10",   text: "text-green-400",   border: "border-green-500/30",   dot: "bg-green-400"   },
  "Rejected":             { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/30",     dot: "bg-red-500"     },
  "Joining Date":         { bg: "bg-teal-500/10",    text: "text-teal-400",    border: "border-teal-500/30",    dot: "bg-teal-400"    },
  "Follow Up":            { bg: "bg-indigo-500/10",  text: "text-indigo-400",  border: "border-indigo-500/30",  dot: "bg-indigo-400"  },
  "Custom Event":         { bg: "bg-slate-500/10",   text: "text-slate-400",   border: "border-slate-500/30",   dot: "bg-slate-400"   },
};

export const DEFAULT_EVENT_STYLE = {
  bg: "bg-slate-500/10", text: "text-slate-400",
  border: "border-slate-500/30", dot: "bg-slate-400",
};