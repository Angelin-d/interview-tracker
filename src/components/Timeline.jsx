

import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import TimelineModal from "./TimelineModal";
import { EVENT_TYPE_STYLES, DEFAULT_EVENT_STYLE } from "../constants/timeline";

export default function Timeline({ applicationId, showToast, onEventChange }) {
  const [events,       setEvents]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // ── Load events ───────────────────────
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getTimelineEvents(applicationId);
      // Sort newest first
      const sorted = [...data].sort(
        (a, b) => new Date(b.event_date) - new Date(a.event_date)
      );
      setEvents(sorted);
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to load timeline.", "error");
    } finally {
      setLoading(false);
    }
  }, [applicationId, showToast]);


  useEffect(() => {
    if (applicationId) loadEvents();
  }, [applicationId]); 

  // ── Open modal ────────────────────────
  const openAdd = () => {
    setEditingEvent(null);
    setModalOpen(true);
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingEvent(null);
  };

  // ── Save (add or edit) ────────────────
const handleSave = async (formData) => {
  setSaving(true);

  try {
    if (editingEvent) {
      const updated = await api.updateTimelineEvent(editingEvent.id, formData);

      setEvents((prev) =>
        prev
          .map((e) => (e.id === updated.id ? updated : e))
          .sort((a, b) => new Date(b.event_date) - new Date(a.event_date))
      );

      showToast(`✓ Updated "${updated.title}"`);
      onEventChange?.();

    } else {
      const newEvent = await api.createTimelineEvent(applicationId, formData);

      setEvents((prev) =>
        [newEvent, ...prev].sort(
          (a, b) => new Date(b.event_date) - new Date(a.event_date)
        )
      );

      showToast(`✓ Added "${newEvent.title}"`);
      onEventChange?.();
    }

    closeModal();

  } catch (err) {
    showToast(
      err.response?.data?.detail || "Failed to save event.",
      "error"
    );
  } finally {
    setSaving(false);
  }
};
  // ── Delete ────────────────────────────
  const handleDelete = async (eventId) => {
    const event = events.find((e) => e.id === eventId);
    if (!window.confirm(`Delete "${event?.title}"?`)) return;
    try {
      await api.deleteTimelineEvent(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      showToast(`Deleted "${event?.title}"`);
      onEventChange?.(); 
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to delete.", "error");
    }
  };

  // ── Toggle completed ──────────────────
  const handleToggle = async (event) => {
    try {
      const updated = await api.updateTimelineEvent(event.id, {
        ...event,
        completed: !event.completed,
      });
      setEvents((prev) =>
       prev.map((e) => (e.id === updated.id ? updated : e))
  );

  onEventChange?.(); // Refresh parent/dashboard
    } catch (err) {
      showToast("Failed to update event.", "error");
    }
  };

  // ── Helpers ───────────────────────────
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });

  const formatTime = (timeStr) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };

  const completedCount = events.filter((e) => e.completed).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white">Timeline</h2>
          {events.length > 0 && (
            <p className="text-xs text-slate-500 mt-0.5">
              {completedCount} of {events.length} completed
            </p>
          )}
        </div>
        <button
          onClick={openAdd}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs
            font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          + Add Event
        </button>
      </div>

      {/* Progress bar */}
      {events.length > 0 && (
        <div className="mb-5 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${(completedCount / events.length) * 100}%` }}
          />
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent
            rounded-full animate-spin" />
          <span className="ml-2 text-slate-400 text-sm">Loading timeline...</span>
        </div>
      ) : events.length === 0 ? (
        /* Empty state */
        <div className="text-center py-12 bg-slate-800/50 border border-dashed
          border-slate-700 rounded-xl">
          <p className="text-2xl mb-2">📋</p>
          <p className="text-slate-400 text-sm font-medium">No events yet</p>
          <p className="text-slate-600 text-xs mt-1">
            Track every step of your interview process
          </p>
          <button
            onClick={openAdd}
            className="mt-3 text-indigo-400 text-xs hover:text-indigo-300 underline"
          >
            Add your first event
          </button>
        </div>
      ) : (
        /* Events list */
        <div className="relative">
          {events.map((event, index) => {
            const style = EVENT_TYPE_STYLES[event.event_type] || DEFAULT_EVENT_STYLE;
            const isLast = index === events.length - 1;

            return (
              <div key={event.id} className="flex gap-3 group">
                {/* Dot + line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <button
                    onClick={() => handleToggle(event)}
                    title={event.completed ? "Mark incomplete" : "Mark complete"}
                    className={`w-3.5 h-3.5 rounded-full border-2 mt-1.5 flex-shrink-0
                      transition-all cursor-pointer
                      ${event.completed
                        ? `${style.dot} border-transparent`
                        : "bg-transparent border-slate-600 hover:border-indigo-400"
                      }`}
                  />
                  {!isLast && (
                    <div className="w-px flex-1 bg-slate-700/60 mt-1" />
                  )}
                </div>

                {/* Card */}
                <div className={`flex-1 mb-4 rounded-xl border p-4 transition-all
                  ${event.completed
                    ? "opacity-50 bg-slate-800/30 border-slate-700/40"
                    : "bg-slate-800 border-slate-700 group-hover:border-slate-600"
                  }`}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold leading-snug ${
                        event.completed ? "line-through text-slate-500" : "text-white"
                      }`}>
                        {event.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                          border ${style.bg} ${style.text} ${style.border}`}>
                          {event.event_type}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDate(event.event_date)}
                          {event.event_time && ` · ${formatTime(event.event_time)}`}
                        </span>
                        {event.completed && (
                          <span className="text-xs text-emerald-500 font-medium">
                            ✓ Done
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(event)}
                        className="text-xs px-2 py-1 rounded-md bg-slate-700
                          text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-xs px-2 py-1 rounded-md bg-slate-700
                          text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  {event.notes && (
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {event.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <TimelineModal
        isOpen={modalOpen}
        editingEvent={editingEvent}
        onSave={handleSave}
        onClose={closeModal}
        saving={saving}
      />
    </div>
  );
}