// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard          from "../pages/Dashboard";
import Applications       from "../pages/Applications";
import AddEditApplication from "../pages/AddEditApplication";

export default function AppRouter({
  applications,
  onEdit,
  onDelete,
  loading,
  onSave,
  editingApp,
  saving,
}) {
  return (
    <Routes>
      <Route path="/"
        element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard"
        element={<Dashboard applications={applications} />} />

      <Route path="/applications"
        element={
          <Applications
            applications={applications}
            onEdit={onEdit}
            onDelete={onDelete}
            loading={loading}
          />
        }
      />

      <Route path="/applications/new"
        element={
          <AddEditApplication
            editingApp={null}
            onSave={onSave}
            saving={saving}
          />
        }
      />

      <Route path="/applications/edit"
        element={
          <AddEditApplication
            editingApp={editingApp}
            onSave={onSave}
            saving={saving}
          />
        }
      />

      <Route path="*"
        element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}