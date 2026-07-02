// src/pages/ApplicationDetail.jsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import StatusBadge from "../components/StatusBadge";
import Timeline from "../components/Timeline";

export default function ApplicationDetail({ showToast, triggerRefresh }) {
  const { id }              = useParams();
  const applicationId       = Number(id);
  const navigate            = useNavigate();
  const [app, setApp]       = useState(null);
  const [loading, setLoading] = useState(true);

  const loadApp = useCallback(async () => {
    if (!applicationId || isNaN(applicationId)) {
      showToast("Invalid application ID.", "error");
      navigate("/applications");
      return;
    }
    try {
      setLoading(true);
      const data = await api.getById(applicationId);
      if (!data) {
        showToast("Application not found.", "error");
        navigate("/applications");
        return;
      }
      setApp(data);
    } catch (err) {
      showToast(
        err.response?.data?.detail || "Failed to load application.",
        "error"
      );
      navigate("/applications");
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    loadApp();
  }, [applicationId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center
        justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500
          border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!app) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      <button
        onClick={() => navigate("/applications")}
        className="flex items-center gap-1.5 text-slate-400
          hover:text-white text-sm transition-colors">
        ← Back to Applications
      </button>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-bold text-white">{app.company}</h1>
            <p className="text-slate-400 text-sm mt-1">{app.role}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge status={app.status} />
            <button
              onClick={() => navigate(`/applications/${applicationId}/edit`)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-700
                text-slate-300 hover:bg-indigo-600 hover:text-white
                transition-colors">
              Edit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 rounded-xl p-3">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">
              Status
            </p>
            <StatusBadge status={app.status} />
          </div>
          <div className="bg-slate-900/50 rounded-xl p-3">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">
              Date Applied
            </p>
            <p className="text-sm text-white font-medium">
              {formatDate(app.dateApplied)}
            </p>
          </div>
          {app.notes && (
            <div className="bg-slate-900/50 rounded-xl p-3
              col-span-2 sm:col-span-1">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">
                Notes
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                {app.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        {/* Pass triggerRefresh so adding/editing events refreshes dashboard */}
        <Timeline
          applicationId={applicationId}
          showToast={showToast}
          onEventChange={triggerRefresh}
        />
      </div>

    </div>
  );
}