

import axiosInstance from "../services/axiosInstance";

const api = {

  // ── Applications ──────────────────────────────
  getAll: async () => {
    const response = await axiosInstance.get("/applications");
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/applications/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post("/applications/", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/applications/${id}`, data);
    return response.data;
  },

  remove: async (id) => {
    await axiosInstance.delete(`/applications/${id}`);
    return true;
  },

  // ── Timeline ──────────────────────────────────
  getTimelineEvents: async (applicationId) => {
    const response = await axiosInstance.get(
      `/applications/${applicationId}/timeline`
    );
    return response.data;
  },

  // NEW: fetch ALL timeline events across ALL applications
  // by fetching each application's timeline and merging
  getAllTimelineEvents: async (applications) => {
    const promises = applications.map((app) =>
      axiosInstance
        .get(`/applications/${app.id}/timeline`)
        .then((r) => r.data.map((e) => ({
          ...e,
          company: app.company,
          role:    app.role,
        })))
        .catch(() => []) // skip if one fails
    );
    const results = await Promise.all(promises);
    return results.flat();
  },

  createTimelineEvent: async (applicationId, data) => {
    const response = await axiosInstance.post(
      `/applications/${applicationId}/timeline`,
      data
    );
    return response.data;
  },

  updateTimelineEvent: async (eventId, data) => {
    const response = await axiosInstance.put(
      `/applications/timeline/${eventId}`,
      data
    );
    return response.data;
  },

  deleteTimelineEvent: async (eventId) => {
    await axiosInstance.delete(`/applications/timeline/${eventId}`);
    return true;
  },

};

export default api;