// src/pages/AddEditApplication.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";

const today = new Date().toISOString().split("T")[0];

const EMPTY_FORM = {
  company: "",
  role: "",
  dateApplied: today,
  notes: "",
};
export default function AddEditApplication({ editingApp, onSave, saving }) {
  const navigate            = useNavigate();
  const { id }              = useParams();
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [localApp, setLocalApp] = useState(editingApp);

  const isEditing = Boolean(localApp);

  // Load app from API if we have an :id but no editingApp in state
  // (happens when user refreshes the edit page directly)
  useEffect(() => {
    if (id && !editingApp) {
      api.getById(Number(id)).then((data) => {
        if (data) setLocalApp(data);
      });
    } else {
      setLocalApp(editingApp);
    }
  }, [id, editingApp]);

  // Pre-fill form when editing
  useEffect(() => {
    if (localApp) {
      setForm({
        company: localApp.company || "",
        role: localApp.role || "",
        dateApplied: localApp.dateApplied || today,
        notes: localApp.notes || "",
    });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [localApp]);

  const handleChange = (field, value) => {
  setForm((prev) => ({
    ...prev,
    [field]: value,
  }));

  if (errors[field]) {
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  }
};

  const validate = () => {
    const e = {};
    if (!form.company.trim())  e.company     = "Company name is required.";
    if (!form.role.trim())     e.role        = "Role is required.";
    if (!form.dateApplied)     e.dateApplied = "Date is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
  if (!validate()) return;

  onSave({
    ...form,
    status: "Applied",
  });
};

  // Format date for display: YYYY-MM-DD → DD-MM-YYYY
  const displayDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}-${m}-${y}`;
  };

  const inputClass = (field) =>
    `w-full bg-slate-800 border ${
      errors[field] ? "border-red-500" : "border-slate-600"
    } rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500
    focus:outline-none focus:border-indigo-500 transition-colors`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          {isEditing ? "Edit Job Application" : "Add Job Application"}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {isEditing
            ? `Editing ${localApp?.company} – ${localApp?.role}`
            : "Log a new job application."}
        </p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5">

        {/* Company */}
        <div>
          <label className="block text-xs font-semibold text-slate-400
            uppercase tracking-widest mb-1.5">Company *</label>
          <input type="text" placeholder="e.g. Google, Salesforce"
            value={form.company}
            onChange={(e) => handleChange("company", e.target.value)}
            className={inputClass("company")} />
          {errors.company && (
            <p className="text-red-400 text-xs mt-1">{errors.company}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="block text-xs font-semibold text-slate-400
            uppercase tracking-widest mb-1.5">Role *</label>
          <input type="text" placeholder="e.g. Frontend Engineer Intern"
            value={form.role}
            onChange={(e) => handleChange("role", e.target.value)}
            className={inputClass("role")} />
          {errors.role && (
            <p className="text-red-400 text-xs mt-1">{errors.role}</p>
          )}
        </div>

        {/* Status + Date */}
       
          <div>
            <label className="block text-xs font-semibold text-slate-400
              uppercase tracking-widest mb-1.5">
              Date Applied *
            </label>
            {isEditing ? (
              // Edit mode — show existing date, allow changing
              <input
                type="date"
                value={form.dateApplied}
                onChange={(e) => handleChange("dateApplied", e.target.value)}
                className={inputClass("dateApplied")}
              />
            ) : (
              // Add mode — locked to today only
              <div className={`${inputClass("dateApplied")} bg-slate-900
                cursor-not-allowed opacity-75 flex items-center`}>
                <span className="text-slate-300">
                  {displayDate(today)}
                </span>
                <span className="ml-auto text-xs text-slate-500"></span>
              </div>
            )}
            {errors.dateApplied && (
              <p className="text-red-400 text-xs mt-1">{errors.dateApplied}</p>
            )}
            {!isEditing && (
              <p className="text-slate-600 text-xs mt-1">
              
              </p>
            )}
          </div>
        

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-400
            uppercase tracking-widest mb-1.5">Notes</label>
          <textarea rows={3}
            placeholder="e.g. Passed OA. HR round next week."
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            className={`${inputClass("notes")} resize-none`} />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500
              disabled:opacity-50 disabled:cursor-not-allowed
              text-white font-semibold text-sm py-2.5 rounded-lg
              transition-colors">
            {saving
              ? "Saving..."
              : isEditing ? "Save Changes" : "Add Job Application"}
          </button>
          <button
            onClick={() => navigate(isEditing
              ? `/applications/${id}`
              : "/applications")}
            className="px-5 py-2.5 rounded-lg border border-slate-600
              text-slate-300 text-sm hover:bg-slate-700 transition-colors">
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}