// src/utils/api.js
// PURPOSE: Stores applications in Local Storage.
// Data survives page refresh until real backend is connected.
// To switch to real API later → replace with applicationService import.

import mockApplications from "../data/mockData";

const STORAGE_KEY = "interview_tracker_apps";

// ─────────────────────────────────────────
// HELPER: Read from Local Storage
// If nothing saved yet → use mock data as starting point
// ─────────────────────────────────────────
const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
      // ↑ Local Storage only stores strings
      //   JSON.parse converts string back to array
    }
    // First time ever opening the app → seed with mock data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockApplications));
    return mockApplications;
  } catch {
    return mockApplications;
  }
};

// ─────────────────────────────────────────
// HELPER: Save to Local Storage
// ─────────────────────────────────────────
const saveToStorage = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // ↑ JSON.stringify converts array to string for storage
};

// Small delay so it feels like a real API
const wait = (ms = 200) => new Promise((res) => setTimeout(res, ms));

const api = {

  // GET — load all from Local Storage
  getAll: async () => {
    await wait();
    return loadFromStorage();
  },

  // GET one by id
  getById: async (id) => {
    await wait();
    const apps = loadFromStorage();
    return apps.find((a) => a.id === id);
  },

  // POST — add new, save to Local Storage
  create: async (data) => {
    await wait();
    const apps = loadFromStorage();
    const newApp = {
      ...data,
      id: Date.now(),
      // ↑ Use timestamp as unique ID
      //   Works without a database
    };
    const updated = [...apps, newApp];
    saveToStorage(updated);
    return newApp;
  },

  // PUT — update one, save to Local Storage
  update: async (id, data) => {
    await wait();
    const apps = loadFromStorage();
    const updated = apps.map((a) =>
      a.id === id ? { ...a, ...data } : a
    );
    saveToStorage(updated);
    return updated.find((a) => a.id === id);
  },

  // DELETE — remove one, save to Local Storage
  remove: async (id) => {
    await wait();
    const apps = loadFromStorage();
    const updated = apps.filter((a) => a.id !== id);
    saveToStorage(updated);
    return true;
  },

};

export default api;