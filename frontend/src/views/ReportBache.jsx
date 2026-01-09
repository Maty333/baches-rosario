import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { bachesAPI } from "../api/baches.js";
import { toast } from "react-toastify";
import MapView from "../components/map/MapView.jsx";
import ImageUpload from "../components/baches/ImageUpload.jsx";
import { ROSARIO_CENTER } from "../utils/constants.js";
import "./ReportBache.css";

const ReportBache = () => {
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(ROSARIO_CENTER);
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

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

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
    // Aquí podrías hacer una llamada a una API de geocodificación inversa
    // para obtener la dirección automáticamente
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
            {errors.titulo && <span className="error">{errors.titulo.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción *</label>
            <textarea
              id="descripcion"
              rows="4"
              {...register("descripcion", { required: "La descripción es requerida" })}
            />
            {errors.descripcion && <span className="error">{errors.descripcion.message}</span>}
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
            <input
              type="text"
              placeholder="Dirección (ej: Av. Pellegrini 1234)"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="address-input"
              required
            />
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

