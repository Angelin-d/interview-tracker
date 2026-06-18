import { useState, useEffect } from "react";

const EMPTY_FORM = {
  company: "",
  role: "",
  status: "Applied",
  dateApplied: new Date().toISOString().split("T")[0],
  notes: "",
};

export default function AddEditApplication({ editingApp, onSave, onCancel, saving }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const isEditing = Boolean(editingApp);

  useEffect(() => {
    if (editingApp) {
      setForm({
        company: editingApp.company || "",
        role: editingApp.role || "",
        status: editingApp.status || "Applied",
        dateApplied: editingApp.dateApplied || EMPTY_FORM.dateApplied,
        notes: editingApp.notes || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editingApp]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.company.trim()) newErrors.company = "Company name is required.";
    if (!form.role.trim()) newErrors.role = "Role is required.";
    if (!form.dateApplied) newErrors.dateApplied = "Date is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave(form);
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
          {isEditing ? "Edit Application" : "Add Application"}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {isEditing
            ? `Editing ${editingApp.company} - ${editingApp.role}`
            : "Log a new job application."}
        </p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5">

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            Company *
          </label>
          <input
            type="text"
            placeholder="e.g. Google, Salesforce"
            value={form.company}
            onChange={(e) => handleChange("company", e.target.value)}
            className={inputClass("company")}
          />
          {errors.company && (
            <p className="text-red-400 text-xs mt-1">{errors.company}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            Role *
          </label>
          <input
            type="text"
            placeholder="e.g. Frontend Engineer Intern"
            value={form.role}
            onChange={(e) => handleChange("role", e.target.value)}
            className={inputClass("role")}
          />
          {errors.role && (
            <p className="text-red-400 text-xs mt-1">{errors.role}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className={inputClass("status")}
            >
              {["Applied", "Interviewing", "Offer", "Rejected"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
              Date Applied *
            </label>
            
          <input
             type="date"
             value={form.dateApplied}
             max={new Date().toISOString().split("T")[0]}
             onChange={(e) => handleChange("dateApplied", e.target.value)}
             className={inputClass("dateApplied")}
          />
            {errors.dateApplied && (
              <p className="text-red-400 text-xs mt-1">{errors.dateApplied}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            Notes
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Passed OA. HR round next week."
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            className={`${inputClass("notes")} resize-none`}
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500
              disabled:opacity-50 disabled:cursor-not-allowed
              text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
          >
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Add Application"}
          </button>
          <button
            onClick={onCancel}
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