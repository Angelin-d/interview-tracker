

import { useState, useEffect } from "react";
import { EVENT_TYPES } from "../constants/timeline";

const EMPTY_FORM = {
  title:      "",
  event_type: "Recruiter Contact",
  event_date: new Date().toISOString().split("T")[0],
  event_time: "",
  notes:      "",
  completed:  false,
};

export default function TimelineModal({ isOpen, editingEvent, onSave, onClose, saving }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const isEditing           = Boolean(editingEvent);

  useEffect(() => {
    if (editingEvent) {
      setForm({
        title:      editingEvent.title      || "",
        event_type: editingEvent.event_type || "Recruiter Contact",
        event_date: editingEvent.event_date || EMPTY_FORM.event_date,
        event_time: editingEvent.event_time?.slice(0, 5) || "",
        notes:      editingEvent.notes      || "",
        completed:  editingEvent.completed  ?? false,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editingEvent, isOpen]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
  const e = {};

  if (!form.event_date) {
    e.event_date = "Date is required.";
  }

  if (
    form.event_type === "Custom Event" &&
    !form.title.trim()
  ) {
    e.title = "Please enter a title.";
  }

  setErrors(e);
  return Object.keys(e).length === 0;
};

  const handleSubmit = () => {
  if (!validate()) return;

  const data = {
    ...form,
    title:
      form.event_type === "Custom Event"
        ? form.title.trim()
        : form.event_type,
  };

  if (!data.event_time) delete data.event_time;

  onSave(data);
};
  if (!isOpen) return null;

  const inputClass = (field) =>
    `w-full bg-slate-900 border ${
      errors[field] ? "border-red-500" : "border-slate-600"
    } rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500
    focus:outline-none focus:border-indigo-500 transition-colors`;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal box */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-white font-semibold text-base">
            {isEditing ? "Edit Event" : "Add Timeline Event"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">

          {/* Title (only for Custom Event) */}
{form.event_type === "Custom Event" && (
  <div>
    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
      Title *
    </label>

    <input
      type="text"
      placeholder="Enter custom event title"
      value={form.title}
      onChange={(e) => handleChange("title", e.target.value)}
      className={inputClass("title")}
      autoFocus
    />

    {errors.title && (
      <p className="text-red-400 text-xs mt-1">
        {errors.title}
      </p>
    )}
  </div>
)}

          {/* Event Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
              Event Type
            </label>
            <select
              value={form.event_type}
              onChange={(e) => handleChange("event_type", e.target.value)}
               
              className={inputClass("event_type")}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                Date *
              </label>
              <input
                type="date"
                value={form.event_date}
                onChange={(e) => handleChange("event_date", e.target.value)}
                className={inputClass("event_date")}
              />
              {errors.event_date && (
                <p className="text-red-400 text-xs mt-1">{errors.event_date}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                Time (optional)
              </label>
              <input
                type="time"
                value={form.event_time}
                onChange={(e) => handleChange("event_time", e.target.value)}
                className={inputClass("event_time")}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
              Notes (optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Spoke with recruiter about the role..."
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className={`${inputClass("notes")} resize-none`}
            />
          </div>

          {/* Completed */}
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              id="completed"
              checked={form.completed}
              onChange={(e) => handleChange("completed", e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900
                accent-indigo-500 cursor-pointer"
            />
            <label htmlFor="completed" className="text-sm text-slate-300 cursor-pointer">
              Mark as completed
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-5">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
              disabled:cursor-not-allowed text-white text-sm font-semibold
              py-2.5 rounded-lg transition-colors"
          >
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Add Event"}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-slate-600
              text-slate-300 text-sm hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}