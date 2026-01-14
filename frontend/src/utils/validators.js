export function toInt(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function normalizePage(value) {
  return Math.max(1, toInt(value, 1));
}

export function normalizeLimit(value) {
  return clamp(toInt(value, 20), 1, 100);
}

export function normalizeEstadoBache(value) {
  if (!value) return "";
  const allowed = ["reportado", "en_proceso", "solucionado"];
  return allowed.includes(value) ? value : "";
}

export function normalizeRol(value) {
  if (!value) return "";
  const allowed = ["usuario", "admin"];
  return allowed.includes(value) ? value : "";
}

export function normalizeSearch(value) {
  if (!value) return "";
  return String(value).trim().slice(0, 100);
}

export function normalizeCoords(lat, lng) {
  const latNum = typeof lat === "number" ? lat : parseFloat(lat);
  const lngNum = typeof lng === "number" ? lng : parseFloat(lng);
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) return null;
  return { lat: latNum, lng: lngNum };
}

