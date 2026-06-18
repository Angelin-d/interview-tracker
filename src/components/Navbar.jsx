// src/components/Navbar.jsx
// Updated to use React Router's useNavigate
// so the URL bar changes when you click nav links.

import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  // location.pathname = current URL e.g. "/dashboard"

  const links = [
    { path: "/dashboard",        label: "Dashboard"        },
    { path: "/applications",     label: "Applications"     },
    { path: "/applications/new", label: "+ Add Application"},
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">

        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-white font-bold text-base"
        >
          <span className="text-indigo-400 text-lg">◈</span>
          <span>InterviewTrack</span>
        </button>

        <div className="flex items-center gap-1">
          {links.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                location.pathname === link.path
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

      </div>
    </nav>
  );
}