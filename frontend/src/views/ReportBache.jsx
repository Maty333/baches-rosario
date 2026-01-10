import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { bachesAPI } from "../api/baches.js";
import { toast } from "react-toastify";
import MapView from "../components/map/MapView.jsx";
import ImageUpload from "../components/baches/ImageUpload.jsx";
import { ROSARIO_CENTER } from "../utils/constants.js";
import { reverseGeocode, geocode } from "../utils/geocoding.js";
import "../styles/ReportBache.css";

const ReportBache = () => {
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(ROSARIO_CENTER);
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);
  const [geocodingAddress, setGeocodingAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    if (!direccion) {
      toast.error("Por favor, ingresa la dirección");
      return;
    }

    setLoading(true);
    try {
      await bachesAPI.create(
        {
          ...data,
          ubicacion: {
            ...location,
            direccion,
          },
        },
        images
      );
      toast.success("Bache reportado exitosamente");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al reportar bache");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = async (newLocation) => {
    setLocation(newLocation);

    // Geocodificación inversa automática cuando se mueve el marcador
    setGeocodingAddress(true);
    try {
      const address = await reverseGeocode(newLocation.lat, newLocation.lng);
      if (address) {
        setDireccion(address);
      }
    } catch (error) {
      console.error("Error obteniendo dirección:", error);
    } finally {
      setGeocodingAddress(false);
    }
  };

  // Autocompletado de direcciones
  const handleAddressInput = async (e) => {
    const value = e.target.value;
    setDireccion(value);

    if (value.length > 3) {
      try {
        const results = await geocode(value);
        setAddressSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error buscando direcciones:", error);
      }
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectAddress = (suggestion) => {
    setDireccion(suggestion.direccion);
    setLocation({ lat: suggestion.lat, lng: suggestion.lng });
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  return (
    <div className="report-bache-container">
      <div className="report-bache-card">
        <h2>Reportar Nuevo Bache</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="titulo">Título *</label>
            <input
              type="text"
              id="titulo"
              {...register("titulo", { required: "El título es requerido" })}
            />
            {errors.titulo && (
              <span className="error">{errors.titulo.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción *</label>
            <textarea
              id="descripcion"
              rows="4"
              {...register("descripcion", {
                required: "La descripción es requerida",
              })}
            />
            {errors.descripcion && (
              <span className="error">{errors.descripcion.message}</span>
            )}
          </div>

          <div className="form-group">
            <label>Ubicación en el mapa *</label>
            <div className="map-container">
              <MapView
                draggable={true}
                initialCenter={location}
                onLocationChange={handleLocationChange}
              />
            </div>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Dirección (ej: Av. Pellegrini 1234)"
                value={direccion}
                onChange={handleAddressInput}
                onFocus={() =>
                  addressSuggestions.length > 0 && setShowSuggestions(true)
                }
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="address-input"
                required
                disabled={geocodingAddress}
              />
              {geocodingAddress && (
                <small style={{ color: "#666", fontStyle: "italic" }}>
                  Obteniendo dirección...
                </small>
              )}
              {showSuggestions && addressSuggestions.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 1000,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  {addressSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectAddress(suggestion)}
                      style={{
                        padding: "10px",
                        cursor: "pointer",
                        borderBottom: "1px solid #eee",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#f5f5f5")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "white")
                      }
                    >
                      {suggestion.direccion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Imágenes (opcional, máximo 5)</label>
            <ImageUpload images={images} onChange={setImages} maxImages={5} />
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? "Reportando..." : "Reportar Bache"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportBache;
