import axios from "axios";
import { API_URL } from "../utils/constants.js";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const commentsAPI = {
  getByBache: async (bacheId) => {
    const response = await api.get(`/baches/${bacheId}/comments`);
    return response.data;
  },

  create: async (bacheId, contenido) => {
    const response = await api.post(`/baches/${bacheId}/comments`, { contenido });
    return response.data;
  },
};

