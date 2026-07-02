// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard          from "../pages/Dashboard";
import Applications       from "../pages/Applications";
import AddEditApplication from "../pages/AddEditApplication";
import ApplicationDetail  from "../pages/ApplicationDetail";

export default function AppRouter({
  applications,
  onEdit,
  onDelete,
  loading,
  onSave,
  editingApp,
  saving,
  showToast,
  refreshKey,
  triggerRefresh,
}) {
  return (
    <Routes>
      <Route path="/"
        element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard"
        element={
          <Dashboard
            applications={applications}
            refreshKey={refreshKey}
          />
        }
      />

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

      <Route path="/applications/:id/edit"
        element={
          <AddEditApplication
            editingApp={editingApp}
            onSave={onSave}
            saving={saving}
          />
        }
      />

      <Route path="/applications/:id"
        element={
          <ApplicationDetail
            showToast={showToast}
            triggerRefresh={triggerRefresh}
          />
        }
      />

      <Route path="*"
        element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}