import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar             from "./components/Navbar";
import Toast              from "./components/Toast";
import AppRouter          from "./routes/AppRouter";
import api                from "./utils/api";

export default function App() {
  const navigate = useNavigate();

  const [applications,  setApplications]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [editingApp,    setEditingApp]    = useState(null);
  const [toast,         setToast]         = useState(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAll();
      setApplications(data);
    } catch (err) {
      setError("Could not load applications.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleAdd = async (formData) => {
    setSaving(true);
    try {
      const newApp = await api.create(formData);
      setApplications((prev) => [...prev, newApp]);
      showToast(`✓ Added ${formData.company}`);
      navigate("/applications");
    } catch {
      showToast("Failed to add.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (app) => {
    setEditingApp(app);
    navigate("/applications/edit");
  };

  const handleUpdate = async (formData) => {
    setSaving(true);
    try {
      const updated = await api.update(editingApp.id, formData);
      setApplications((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
      showToast(`✓ Updated ${updated.company}`);
      navigate("/applications");
    } catch {
      showToast("Failed to update.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const app = applications.find((a) => a.id === id);
    if (!window.confirm(`Delete ${app?.company}?`)) return;
    try {
      await api.remove(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      showToast(`Deleted ${app?.company}`);
    } catch {
      showToast("Failed to delete.", "error");
    }
  };

  // Loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="bg-slate-800 border border-red-800 rounded-xl p-8 max-w-md w-full text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-white font-bold text-lg">Something went wrong</h2>
          <p className="text-slate-400 text-sm">{error}</p>
          <button
            onClick={loadApplications}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white
              text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <Navbar />
      <main>
        <AppRouter
          applications={applications}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          onNavigate={navigate}
          loading={loading}
          onSave={editingApp ? handleUpdate : handleAdd}
          editingApp={editingApp}
          saving={saving}
        />
      </main>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}