import { api } from "../utils/axiosConfig.js";
import { normalizeLimit, normalizePage, normalizeRol, normalizeSearch, normalizeEstadoBache } from "../utils/validators.js";

export const adminAPI = {
  getStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data;
  },

  getAllBaches: async (filters = {}) => {
    const params = {
      page: normalizePage(filters.page),
      limit: normalizeLimit(filters.limit),
    };
    const estado = normalizeEstadoBache(filters.estado);
    if (estado) params.estado = estado;
    if (filters.estadoModeracion) params.estadoModeracion = filters.estadoModeracion;
    const response = await api.get("/admin/baches", { params });
    return response.data;
  },

  aprobarBache: async (id) => {
    const response = await api.post(`/admin/baches/${id}/aprobar`);
    return response.data;
  },

  rechazarBache: async (id, motivoRechazo) => {
    const response = await api.post(`/admin/baches/${id}/rechazar`, {
      motivoRechazo: motivoRechazo || undefined,
    });
    return response.data;
  },

  getAllUsers: async (filters = {}) => {
    const params = {
      page: normalizePage(filters.page),
      limit: normalizeLimit(filters.limit),
    };
    const rol = normalizeRol(filters.rol);
    if (rol) params.rol = rol;
    const search = normalizeSearch(filters.search);
    if (search) params.search = search;
    const response = await api.get("/admin/usuarios", { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/admin/usuarios/${id}`);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await api.put(`/admin/usuarios/${id}`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/usuarios/${id}`);
    return response.data;
  },
};

