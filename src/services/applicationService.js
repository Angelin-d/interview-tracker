// src/services/applicationService.js
// PURPOSE: Every API call related to applications lives here.
// React components NEVER call Axios directly.
// They only call functions from this file.
//
// Flow:
//   React Component
//       ↓ calls applicationService.getAll()
//   applicationService.js
//       ↓ calls axiosInstance.get("/applications")
//   axiosInstance.js
//       ↓ sends HTTP request with base URL from .env
//   FastAPI Backend
//       ↓ queries PostgreSQL
//   Response comes back up the same chain

import axiosInstance from "./axiosInstance";

const applicationService = {

  // ─────────────────────────────────────────
  // GET /api/v1/applications
  // Returns: array of all application objects
  // ─────────────────────────────────────────
  getAll: async () => {
    const response = await axiosInstance.get("/applications");
    return response.data;
    // FastAPI should return: [ { id, company, role, status, ... }, ... ]
  },

  // ─────────────────────────────────────────
  // GET /api/v1/applications/{id}
  // Returns: single application object
  // ─────────────────────────────────────────
  getById: async (id) => {
    const response = await axiosInstance.get(`/applications/${id}`);
    return response.data;
  },

  // ─────────────────────────────────────────
  // POST /api/v1/applications
  // Sends:   { company, role, status, dateApplied, notes }
  // Returns: newly created application with id
  // ─────────────────────────────────────────
  create: async (data) => {
    const response = await axiosInstance.post("/applications", data);
    return response.data;
  },

  // ─────────────────────────────────────────
  // PUT /api/v1/applications/{id}
  // Sends:   { company, role, status, dateApplied, notes }
  // Returns: updated application object
  // ─────────────────────────────────────────
  update: async (id, data) => {
    const response = await axiosInstance.put(`/applications/${id}`, data);
    return response.data;
  },

  // ─────────────────────────────────────────
  // DELETE /api/v1/applications/{id}
  // Returns: nothing (204 No Content)
  // ─────────────────────────────────────────
  remove: async (id) => {
    await axiosInstance.delete(`/applications/${id}`);
    return true;
  },

};

export default applicationService;