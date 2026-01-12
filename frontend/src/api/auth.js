import axios from "axios";
import { API_URL } from "../utils/constants.js";

const api = axios.create({
  baseURL: API_URL,
});

export const authAPI = {
  register: async (email, password, nombre, apellido, edad, sexo) => {
    const response = await api.post("/auth/register", { 
      email, 
      password, 
      nombre, 
      apellido, 
      edad, 
      sexo 
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  getMe: async (token) => {
    const response = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

