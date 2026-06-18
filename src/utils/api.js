// src/utils/api.js
// TEMPORARY: Using mock data for CTO demo.
// Switch back to applicationService when backend is ready.

import mockApplications from "../data/mockData";

// In-memory store — acts like a fake database
let store = [...mockApplications];
let nextId = store.length + 1;

const wait = (ms = 300) => new Promise((res) => setTimeout(res, ms));

const api = {
  getAll: async () => {
    await wait();
    return [...store];
  },

  getById: async (id) => {
    await wait();
    return store.find((a) => a.id === id);
  },

  create: async (data) => {
    await wait();
    const newApp = { ...data, id: nextId++ };
    store.push(newApp);
    return newApp;
  },

  update: async (id, data) => {
    await wait();
    store = store.map((a) => (a.id === id ? { ...a, ...data } : a));
    return store.find((a) => a.id === id);
  },

  remove: async (id) => {
    await wait();
    store = store.filter((a) => a.id !== id);
    return true;
  },
};

export default api;