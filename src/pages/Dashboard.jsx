// src/pages/Dashboard.jsx
// Full ATS Dashboard with timeline events, upcoming, today's tasks,
// recent offers, recent rejections, and status counts from backend.

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import StatusBadge from "../components/StatusBadge";
import { STATUS_OPTIONS, STATUS_COLORS } from "../constants";

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d    = new Date(dateStr);
  const now  = new Date();
  const diff = Math.floor((d - now) / 86400000);

  if (dateStr === today())    return "Today";
  if (diff === 1)             return "Tomorrow";
  if (diff === -1)            return "Yesterday";

  return d.toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
};

const formatTime = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":");
  const hour   = parseInt(h);
  const ampm   = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
};

// ─────────────────────────────────────────
// SKELETON COMPONENTS
// ─────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4
      animate-pulse space-y-2">
      <div className="h-8 w-12 bg-slate-700 rounded" />
      <div className="h-3 w-20 bg-slate-700 rounded" />
    </div>
  );
}

function SkeletonActivity() {
  return (
    <div className="flex items-start gap-3 py-3 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-32 bg-slate-700 rounded" />
        <div className="h-3 w-48 bg-slate-700 rounded" />
        <div className="h-3 w-24 bg-slate-600 rounded" />
      </div>
    </div>
  );
}

function SkeletonWidget() {
  return (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3].map((n) => (
        <div key={n} className="bg-slate-800/60 border border-slate-700/50
          rounded-lg p-3 flex gap-3">
          <div className="w-2 h-2 rounded-full bg-slate-700 mt-1.5 flex-shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="h-3 w-28 bg-slate-700 rounded" />
            <div className="h-3 w-20 bg-slate-600 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────
function EmptyState({ icon, text }) {
  return (
    <div className="text-center py-6">
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-slate-500 text-xs">{text}</p>
    </div>
  );
}

// ─────────────────────────────────────────
// EVENT TYPE DOT COLOR
// ─────────────────────────────────────────
const EVENT_DOT_COLORS = {
  "Applied":             "bg-blue-400",
  "Recruiter Contact":   "bg-purple-400",
  "Online Assessment":   "bg-yellow-400",
  "Technical Interview": "bg-orange-400",
  "HR Interview":        "bg-pink-400",
  "Final Interview":     "bg-red-400",
  "Offer Received":      "bg-emerald-400",
  "Offer Accepted":      "bg-green-400",
  "Rejected":            "bg-red-500",
  "Joining Date":        "bg-teal-400",
  "Follow Up":           "bg-indigo-400",
  "Custom Event":        "bg-slate-400",
};

// ─────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────
export default function Dashboard({ applications, refreshKey }) {
  const navigate = useNavigate();

  const [allEvents,   setAllEvents]   = useState([]);
  const [loadingEvts, setLoadingEvts] = useState(true);

  // Count applications by status from backend data
  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = applications.filter((a) => a.status === s).length;
    return acc;
  }, { Total: applications.length });

  // Fetch ALL timeline events across all applications
  const loadAllEvents = useCallback(async () => {
    if (!applications.length) {
      setAllEvents([]);
      setLoadingEvts(false);
      return;
    }
    try {
      setLoadingEvts(true);
      const events = await api.getAllTimelineEvents(applications);
      setAllEvents(events);
    } catch {
      setAllEvents([]);
    } finally {
      setLoadingEvts(false);
    }
  }, [applications, refreshKey]);

  useEffect(() => {
    loadAllEvents();
  }, [loadAllEvents]);

  // ── Derived data ────────────────────────
  const todayStr = today();

  

  // Upcoming events — today or future, sorted ascending
  const upcomingEvents = [...allEvents]
    .filter((e) => e.event_date >= todayStr && !e.completed)
    .sort((a, b) => {
      const da = new Date(`${a.event_date}T${a.event_time || "00:00:00"}`);
      const db = new Date(`${b.event_date}T${b.event_time || "00:00:00"}`);
      return da - db;
    })
    .slice(0, 5);

  // Today's tasks
  const todaysTasks = allEvents
    .filter((e) => e.event_date === todayStr)
    .sort((a, b) => (a.event_time || "").localeCompare(b.event_time || ""));

  // Recent offers
  const recentOffers = [...allEvents]
    .filter((e) =>
      e.event_type === "Offer Received" ||
      e.event_type === "Offer Accepted"
    )
    .sort((a, b) => new Date(b.event_date) - new Date(a.event_date))
    .slice(0, 3);

  // Recent rejections
  const recentRejections = [...allEvents]
    .filter((e) => e.event_type === "Rejected")
    .sort((a, b) => new Date(b.event_date) - new Date(a.event_date))
    .slice(0, 3);

  // Success rate
  const successRate = counts.Total > 0
    ? Math.round(((counts["Offer"] || 0) / counts.Total) * 100)
    : 0;

  // ── Stat cards config ───────────────────
  const statCards = [
    { label: "Total",        value: counts.Total,              bg: "bg-slate-800",   border: "border-slate-600",   text: "text-white",       sub: "text-slate-400"   },
    { label: "Applied",      value: counts["Applied"] || 0,    bg: "bg-blue-950",    border: "border-blue-700",    text: "text-blue-300",    sub: "text-blue-500"    },
    { label: "Interviewing", value: counts["Interviewing"] || 0,bg:"bg-amber-950",   border: "border-amber-700",   text: "text-amber-300",   sub: "text-amber-500"   },
    { label: "Offer",        value: counts["Offer"] || 0,      bg: "bg-emerald-950", border: "border-emerald-700", text: "text-emerald-300", sub: "text-emerald-500" },
    { label: "Rejected",     value: counts["Rejected"] || 0,   bg: "bg-red-950",     border: "border-red-800",     text: "text-red-300",     sub: "text-red-500"     },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

      {/* ── Header ─────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Your job hunt at a glance.
        </p>
      </div>

      {/* ── Stat Cards ─────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((card) => (
          <div key={card.label}
            className={`${card.bg} border ${card.border}
              rounded-xl p-4 flex flex-col gap-1`}>
            <span className={`text-3xl font-bold ${card.text}`}>
              {card.value}
            </span>
            <span className={`text-xs font-medium uppercase
              tracking-widest ${card.sub}`}>
              {card.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Pipeline Health ─────────────── */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-slate-300">
            Pipeline Health
          </span>
          <span className="text-xs text-slate-400">
            {successRate}% offer rate
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden flex">
          {counts.Total > 0 && STATUS_OPTIONS.map((status) => (
            <div key={status}
              className={`${STATUS_COLORS[status]} h-full transition-all`}
              style={{
                width: `${((counts[status] || 0) / counts.Total) * 100}%`
              }}
              title={status}
            />
          ))}
        </div>
        <div className="flex gap-4 mt-3 flex-wrap">
          {STATUS_OPTIONS.map((status) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`} />
              <span className="text-xs text-slate-400">{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Today's Tasks + Upcoming ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Today's Tasks */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">
              📅 Today's Tasks
            </h2>
            <span className="text-xs text-slate-500">
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric", month: "short",
              })}
            </span>
          </div>
          {loadingEvts ? (
            <SkeletonWidget />
          ) : todaysTasks.length === 0 ? (
            <EmptyState icon="✅" text="No events scheduled today." />
          ) : (
            <div className="space-y-2">
              {todaysTasks.map((event) => (
                <div key={event.id}
                  onClick={() => navigate(`/applications/${event.application_id}`)}
                  className="flex items-start gap-3 bg-slate-900/50
                    border border-slate-700/50 rounded-lg p-3
                    hover:border-indigo-500/40 cursor-pointer transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0
                    ${EVENT_DOT_COLORS[event.event_type] || "bg-slate-400"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">
                      {event.company}
                    </p>
                    <p className="text-slate-400 text-xs truncate">
                      {event.event_type}
                      {event.title !== event.event_type && ` · ${event.title}`}
                    </p>
                    {event.event_time && (
                      <p className="text-indigo-400 text-xs mt-0.5">
                        {formatTime(event.event_time)}
                      </p>
                    )}
                  </div>
                  {event.completed && (
                    <span className="text-emerald-500 text-xs flex-shrink-0">
                      ✓ Done
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">
              🔔 Upcoming Events
            </h2>
            <span className="text-xs text-slate-500">Next up</span>
          </div>
          {loadingEvts ? (
            <SkeletonWidget />
          ) : upcomingEvents.length === 0 ? (
            <EmptyState icon="🗓️" text="No upcoming events." />
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <div key={event.id}
                  onClick={() => navigate(`/applications/${event.application_id}`)}
                  className="flex items-start gap-3 bg-slate-900/50
                    border border-slate-700/50 rounded-lg p-3
                    hover:border-indigo-500/40 cursor-pointer transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0
                    ${EVENT_DOT_COLORS[event.event_type] || "bg-slate-400"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">
                      {event.event_type}
                    </p>
                    <p className="text-slate-400 text-xs truncate">
                      {event.company}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-medium ${
                      event.event_date === todayStr
                        ? "text-indigo-400"
                        : "text-slate-400"
                    }`}>
                      {formatDate(event.event_date)}
                    </p>
                    {event.event_time && (
                      <p className="text-slate-500 text-xs">
                        {formatTime(event.event_time)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

     

      {/* ── Recent Offers + Rejections ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Offers */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">
            🎉 Recent Offers
          </h2>
          {loadingEvts ? (
            <SkeletonWidget />
          ) : recentOffers.length === 0 ? (
            <EmptyState icon="📨" text="No offers yet. Keep applying!" />
          ) : (
            <div className="space-y-2">
              {recentOffers.map((event) => (
                <div key={event.id}
                  onClick={() => navigate(`/applications/${event.application_id}`)}
                  className="flex items-center gap-3 bg-emerald-950/40
                    border border-emerald-800/40 rounded-lg p-3
                    hover:border-emerald-600/50 cursor-pointer transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-emerald-300 text-xs font-semibold truncate">
                      {event.company}
                    </p>
                    <p className="text-slate-400 text-xs">{event.event_type}</p>
                  </div>
                  <p className="text-slate-500 text-xs flex-shrink-0">
                    {formatDate(event.event_date)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Rejections */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">
            📋 Recent Rejections
          </h2>
          {loadingEvts ? (
            <SkeletonWidget />
          ) : recentRejections.length === 0 ? (
            <EmptyState icon="🌟" text="No rejections. Great going!" />
          ) : (
            <div className="space-y-2">
              {recentRejections.map((event) => (
                <div key={event.id}
                  onClick={() => navigate(`/applications/${event.application_id}`)}
                  className="flex items-center gap-3 bg-red-950/30
                    border border-red-800/30 rounded-lg p-3
                    hover:border-red-600/40 cursor-pointer transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-red-300 text-xs font-semibold truncate">
                      {event.company}
                    </p>
                    <p className="text-slate-400 text-xs">{event.role}</p>
                  </div>
                  <p className="text-slate-500 text-xs flex-shrink-0">
                    {formatDate(event.event_date)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}