import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bachesAPI } from "../api/baches.js";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "react-toastify";
import CommentSection from "../components/comments/CommentSection.jsx";
import { ESTADOS_LABELS } from "../utils/constants.js";
import Loading from "../components/common/Loading.jsx";
import "../styles/BacheDetail.css";

const BacheDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bache, setBache] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votando, setVotando] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadBache();
  }, [id]);

  const loadBache = async () => {
    try {
      const data = await bachesAPI.getById(id);
      setBache(data);
    } catch (error) {
      toast.error("Error cargando bache");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleVotar = async () => {
    if (!isAuthenticated) {
      toast.info("Debes iniciar sesión para votar");
      navigate("/login");
      return;
    }

    try {
      setVotando(true);
      const result = await bachesAPI.votar(id);
      setBache((prev) => ({
        ...prev,
        votos: result.votado
          ? [...(prev.votos || []), { usuario: "current" }]
          : prev.votos.filter((v) => v.usuario !== "current"),
      }));
      toast.success(result.votado ? "Voto agregado" : "Voto eliminado");
    } catch (error) {
      toast.error("Error al votar");
    } finally {
      setVotando(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!bache) {
    return <div>Bache no encontrado</div>;
  }

  const estadoClass = `bache-detail-estado bache-detail-estado-${bache.estado}`;

  return (
    <div className="bache-detail-container">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Volver
      </button>

      <div className="bache-detail">
        <div className="bache-detail-header">
          <h1>{bache.titulo}</h1>
          <span className={estadoClass}>{ESTADOS_LABELS[bache.estado]}</span>
        </div>

        <div className="bache-detail-info">
          <p className="bache-detail-location">📍 {bache.ubicacion.direccion}</p>
          <p className="bache-detail-date">
            Reportado el {new Date(bache.fechaReporte).toLocaleDateString("es-AR")}
          </p>
          {bache.tiempoSolucion && (
            <p className="bache-detail-solution">
              Solucionado en {bache.tiempoSolucion} días
            </p>
          )}
        </div>

        <p className="bache-detail-description">{bache.descripcion}</p>

        {bache.imagenes && bache.imagenes.length > 0 && (
          <div className="bache-detail-images">
            {bache.imagenes.map((imagen, index) => (
              <img
                key={index}
                src={`http://localhost:3000${imagen}`}
                alt={`Imagen ${index + 1}`}
                className="bache-detail-image"
              />
            ))}
          </div>
        )}

        <div className="bache-detail-actions">
          <button
            onClick={handleVotar}
            disabled={votando || !isAuthenticated}
            className="vote-button"
          >
            👍 Votar ({bache.votos?.length || 0})
          </button>
          <p className="bache-detail-author">
            Reportado por: {bache.reportadoPor?.nombre || "Anónimo"}
          </p>
        </div>

        <CommentSection bacheId={id} />
      </div>
    </div>
  );
};

export default BacheDetail;

