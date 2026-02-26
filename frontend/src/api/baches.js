import { api } from "../utils/axiosConfig.js";
import { normalizeLimit, normalizePage, normalizeEstadoBache } from "../utils/validators.js";

export const bachesAPI = {
  getAll: async (filters = {}) => {
    const params = { ...filters };
    if (filters.page != null) params.page = normalizePage(filters.page);
    if (filters.limit != null) params.limit = normalizeLimit(filters.limit);
    if (filters.estado != null) params.estado = normalizeEstadoBache(filters.estado);
    const response = await api.get("/baches", { params });
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
    formData.append("posicion", data.posicion);

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

  changeEstado: async (id, estado, images = []) => {
    // si hay imágenes, enviamos multipart/form-data
    if (images && images.length > 0) {
      const formData = new FormData();
      formData.append("estado", estado);
      images.forEach((img) => formData.append("imagenes", img));
      const response = await api.patch(`/baches/${id}/estado`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } else {
      const response = await api.patch(`/baches/${id}/estado`, { estado });
      return response.data;
    }
  },
};

