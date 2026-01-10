/**
 * Utilidades de geocodificación usando Nominatim (OpenStreetMap)
 * Gratis y sin límites para uso razonable
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org";

/**
 * Geocodificación inversa: convierte coordenadas en dirección
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {Promise<string>} Dirección formateada
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `${NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`,
      {
        headers: {
          "User-Agent": "BachesRosario/1.0", // Requerido por Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error en geocodificación inversa");
    }

    const data = await response.json();
    
    if (data.address) {
      // Formatear dirección para Argentina
      const address = data.address;
      const parts = [];
      
      if (address.road) parts.push(address.road);
      if (address.house_number) parts.push(address.house_number);
      if (address.suburb) parts.push(address.suburb);
      if (address.city || address.town) parts.push(address.city || address.town);
      
      return parts.length > 0 ? parts.join(", ") : data.display_name;
    }
    
    return data.display_name || "Dirección no disponible";
  } catch (error) {
    console.error("Error en geocodificación inversa:", error);
    return null;
  }
};

/**
 * Geocodificación directa: convierte dirección en coordenadas
 * @param {string} query - Dirección a buscar
 * @returns {Promise<Array>} Array de resultados con coordenadas
 */
export const geocode = async (query) => {
  try {
    const response = await fetch(
      `${NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=es&countrycodes=ar`,
      {
        headers: {
          "User-Agent": "BachesRosario/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error en geocodificación");
    }

    const data = await response.json();
    return data.map((result) => ({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      direccion: result.display_name,
      nombre: result.name || result.display_name,
    }));
  } catch (error) {
    console.error("Error en geocodificación:", error);
    return [];
  }
};
