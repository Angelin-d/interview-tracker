// src/pages/Dashboard.jsx
import { useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import { STATUS_OPTIONS, STATUS_COLORS } from "../constants";

export default function Dashboard({ applications }) {
  const navigate = useNavigate();

  // Build counts dynamically from STATUS_OPTIONS
  // so adding a new status automatically appears here
  const counts = STATUS_OPTIONS.reduce((acc, status) => {
    acc[status] = applications.filter((a) => a.status === status).length;
    return acc;
  }, {});
  counts.Total = applications.length;

  const statCards = [
    { label: "Total",        value: counts.Total,        bg: "bg-slate-800",   border: "border-slate-600",   text: "text-white",       sub: "text-slate-400"   },
    { label: "Applied",      value: counts.Applied,      bg: "bg-blue-950",    border: "border-blue-700",    text: "text-blue-300",    sub: "text-blue-500"    },
    { label: "Interviewing", value: counts.Interviewing, bg: "bg-amber-950",   border: "border-amber-700",   text: "text-amber-300",   sub: "text-amber-500"   },
    { label: "Offer",        value: counts.Offer,        bg: "bg-emerald-950", border: "border-emerald-700", text: "text-emerald-300", sub: "text-emerald-500" },
    { label: "Rejected",     value: counts.Rejected,     bg: "bg-red-950",     border: "border-red-800",     text: "text-red-300",     sub: "text-red-500"     },
  ];

  const successRate = counts.Total > 0
    ? Math.round((counts.Offer / counts.Total) * 100)
    : 0;

  const recentApps = [...applications]
    .sort((a, b) => new Date(b.dateApplied) - new Date(a.dateApplied))
    .slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Your job hunt at a glance.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((card) => (
          <div key={card.label}
            className={`${card.bg} border ${card.border} rounded-xl p-4 flex flex-col gap-1`}>
            <span className={`text-3xl font-bold ${card.text}`}>{card.value}</span>
            <span className={`text-xs font-medium uppercase tracking-widest ${card.sub}`}>
              {card.label}
            </span>
          </div>
        ))}
      </div>

      {/* Pipeline Bar */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-slate-300">Pipeline Health</span>
          <span className="text-xs text-slate-400">{successRate}% offer rate</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden flex">
          {counts.Total > 0 && STATUS_OPTIONS.map((status) => (
            <div
              key={status}
              className={`${STATUS_COLORS[status]} h-full`}
              style={{ width: `${(counts[status] / counts.Total) * 100}%` }}
              title={status}
            />
          ))}
        </div>
        <div className="flex gap-4 mt-3">
          {STATUS_OPTIONS.map((status) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`} />
              <span className="text-xs text-slate-400">{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">
            Recent Activity
          </h2>
          <button
            onClick={() => navigate("/applications")}
            className="text-xs text-indigo-400 hover:text-indigo-300">
            View all →
          </button>
        </div>
        <div className="space-y-2">
          {recentApps.length === 0 ? (
            <div className="text-center py-10 text-slate-500 bg-slate-800
              rounded-xl border border-slate-700">
              No applications yet.{" "}
              <button
                onClick={() => navigate("/applications/new")}
                className="text-indigo-400 underline">
                Add your first one.
              </button>
            </div>
          ) : (
            recentApps.map((app) => (
              <div key={app.id}
                className="flex items-center justify-between bg-slate-800
                  border border-slate-700 rounded-lg px-4 py-3">
                <div>
                  <p className="text-white text-sm font-medium">{app.company}</p>
                  <p className="text-slate-400 text-xs">{app.role}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-xs hidden sm:block">
                    {new Date(app.dateApplied).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short",
                    })}
                  </span>
                  <StatusBadge status={app.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}