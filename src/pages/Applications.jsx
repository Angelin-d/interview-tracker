// src/pages/Applications.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import { STATUS_OPTIONS } from "../constants";

export default function Applications({ applications, onEdit, onDelete, loading }) {
  const navigate                        = useNavigate();
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = applications
    .filter((a) => filterStatus === "All" ? true : a.status === filterStatus)
    .filter((a) =>
      a.company.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Job Applications</h1>
          <p className="text-slate-400 text-sm mt-1">
            {applications.length} total · {filtered.length} shown
          </p>
        </div>
        <button
          onClick={() => navigate("/applications/new")}
          className="bg-indigo-600 hover:bg-indigo-500 text-white
            text-sm px-4 py-2 rounded-lg font-medium transition-colors">
          + Add New
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search company or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg
            px-3 py-2 text-sm text-white placeholder-slate-500
            focus:outline-none focus:border-indigo-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-800 border border-slate-600 rounded-lg
            px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
          <option value="All">All</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-slate-800
          border border-slate-700 rounded-xl">
          No results found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 border-b border-slate-700">
              <tr>
                {["Company", "Role", "Status", "Date Applied", "Notes", "Actions"].map((h) => (
                  <th key={h}
                    className="px-4 py-3 text-left text-xs font-semibold
                      text-slate-400 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filtered.map((app) => (
                <tr key={app.id}
                  className="bg-slate-900 hover:bg-slate-800/60 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">{app.company}</td>
                  <td className="px-4 py-3 text-slate-300">{app.role}</td>
                  <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(app.dateApplied).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-slate-400 max-w-xs truncate">
                    {app.notes || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(app)}
                        className="text-xs px-2.5 py-1 rounded-md bg-slate-700
                          text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors">
                        Edit
                      </button>
                      <button onClick={() => onDelete(app.id)}
                        className="text-xs px-2.5 py-1 rounded-md bg-slate-700
                          text-slate-200 hover:bg-red-600 hover:text-white transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}