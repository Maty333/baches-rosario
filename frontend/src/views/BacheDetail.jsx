import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bachesAPI } from "../api/baches.js";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "react-toastify";
import CommentSection from "../components/comments/CommentSection.jsx";
import { ESTADOS_LABELS, API_URL, SOCKET_URL } from "../utils/constants.js";
import { sanitizeText } from "../utils/sanitize.js";
import Loading from "../components/common/Loading.jsx";
import "../styles/BacheDetail.css";

const BacheDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bache, setBache] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votando, setVotando] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [pruebas, setPruebas] = useState([]);
  const [sendingEstado, setSendingEstado] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    loadBache();
  }, [id]);

  // cuando cambia el bache recargado, reiniciamos el formulario de estado
  useEffect(() => {
    if (bache) {
      setNuevoEstado(bache.estado);
      setPruebas([]);
    }
  }, [bache]);

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

  const handleEstadoSubmit = async () => {
    if (!nuevoEstado) return;

    if (user?.rol !== "admin" && pruebas.length === 0) {
      toast.error("Se requieren imágenes de prueba");
      return;
    }

    try {
      setSendingEstado(true);
      await bachesAPI.changeEstado(id, nuevoEstado, pruebas);
      toast.success("Estado actualizado");
      await loadBache();
    } catch (error) {
      toast.error("Error al cambiar estado");
    } finally {
      setSendingEstado(false);
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
          <h1>{sanitizeText(bache.titulo)}</h1>
          <span className={estadoClass}>{ESTADOS_LABELS[bache.estado]}</span>
        </div>

        <div className="bache-detail-info">
          <p className="bache-detail-location">📍 {sanitizeText(bache.ubicacion?.direccion || "")}</p>
          {bache.posicion && (
            <p className="bache-detail-position">
              📍 Posición: {
                bache.posicion === "medio" ? "Medio de la calle" :
                bache.posicion === "derecha" ? "Derecha" :
                bache.posicion === "izquierda" ? "Izquierda" :
                bache.posicion
              }
            </p>
          )}
          <p className="bache-detail-date">
            Reportado el {new Date(bache.fechaReporte).toLocaleDateString("es-AR")}
          </p>
          {bache.tiempoSolucion && (
            <p className="bache-detail-solution">
              Solucionado en {bache.tiempoSolucion} días
            </p>
          )}
        </div>

        <p className="bache-detail-description">{sanitizeText(bache.descripcion)}</p>

        {bache.imagenes && bache.imagenes.length > 0 && (
          <div className="bache-detail-images">
            {bache.imagenes.map((imagen, index) => (
              <img
                key={index}
                src={`${SOCKET_URL}${imagen}`}
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

        {/* formulario de cambio de estado (autor o admin) */}
        {(user?.rol === "admin" || user?._id === bache.reportadoPor?._id) && (
          <div className="bache-detail-estado-form">
            <h3>Cambiar estado</h3>
            <select
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value)}
            >
              {Object.entries(ESTADOS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            {/* los usuarios normales deben adjuntar al menos una imagen */}
            {user?.rol !== "admin" && (
              <>
                <p>Subí una o más imágenes de prueba</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setPruebas(Array.from(e.target.files))}
                />
                {pruebas.length > 0 && <p>{pruebas.length} archivo(s) seleccionado(s)</p>}
              </>
            )}

            <button
              onClick={handleEstadoSubmit}
              disabled={sendingEstado}
              className="update-estado-button"
            >
              {sendingEstado ? "Actualizando..." : "Actualizar estado"}
            </button>
          </div>
        )}

        <CommentSection bacheId={id} />
      </div>
    </div>
  );
};

export default BacheDetail;

