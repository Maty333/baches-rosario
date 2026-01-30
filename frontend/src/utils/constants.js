export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

export const ESTADOS_BACHE = {
  REPORTADO: "reportado",
  EN_PROCESO: "en_proceso",
  SOLUCIONADO: "solucionado",
};

export const ESTADOS_LABELS = {
  reportado: "Reportado",
  en_proceso: "En Proceso",
  solucionado: "Solucionado",
};

export const ROSARIO_CENTER = {
  lat: -32.9442,
  lng: -60.68,
};

// Límites geográficos de Rosario para restringir el mapa
export const ROSARIO_BOUNDS = [
  [-33.1, -60.85], // Suroeste (lat, lng)
  [-32.75, -60.45], // Noreste (lat, lng)
];
