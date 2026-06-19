import axiosInstance from "./axiosInstance";

const applicationService = {

  getAll: async () => {
    const response = await axiosInstance.get("/applications");
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/applications/${id}`);
    //                                                        ↑ slash added
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post("/applications", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/applications/${id}`, data);
    //                                                       ↑ slash added
    return response.data;
  },

  remove: async (id) => {
    await axiosInstance.delete(`/applications/${id}`);
    //                                          ↑ slash added
    return true;
  },

};

export default applicationService;