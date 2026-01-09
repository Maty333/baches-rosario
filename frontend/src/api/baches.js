import axios from "axios";
import { API_URL } from "../utils/constants.js";

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const bachesAPI = {
  getAll: async (filters = {}) => {
    const response = await api.get("/baches", { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/baches/${id}`);
    return response.data;
  },

  create: async (data, images) => {
    const formData = new FormData();
    formData.append("titulo", data.titulo);
    formData.append("descripcion", data.descripcion);
    formData.append("ubicacion[lat]", data.ubicacion.lat);
    formData.append("ubicacion[lng]", data.ubicacion.lng);
    formData.append("ubicacion[direccion]", data.ubicacion.direccion);

    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append("imagenes", image);
      });
    }

    const response = await api.post("/baches", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  update: async (id, data, images = []) => {
    const formData = new FormData();
    if (data.titulo) formData.append("titulo", data.titulo);
    if (data.descripcion) formData.append("descripcion", data.descripcion);
    if (data.ubicacion) {
      formData.append("ubicacion[lat]", data.ubicacion.lat);
      formData.append("ubicacion[lng]", data.ubicacion.lng);
      formData.append("ubicacion[direccion]", data.ubicacion.direccion);
    }

    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append("imagenes", image);
      });
    }

    const response = await api.put(`/baches/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  votar: async (id) => {
    const response = await api.post(`/baches/${id}/votar`);
    return response.data;
  },
};

