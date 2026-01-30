import { Link } from "react-router-dom";
import { ESTADOS_LABELS, SOCKET_URL } from "../../utils/constants.js";
import "../../styles/BacheCard.css";

const BacheCard = ({ bache }) => {
  const estadoClass = `bache-card-estado bache-card-estado-${bache.estado}`;

  return (
    <Link to={`/bache/${bache._id}`} className="bache-card">
      {bache.imagenes && bache.imagenes.length > 0 && (
        <div className="bache-card-image">
          <img
            src={`${SOCKET_URL}${bache.imagenes[0]}`}
            alt={bache.titulo}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      )}
      <div className="bache-card-content">
        <h3 className="bache-card-title">{bache.titulo}</h3>
        <p className="bache-card-description">{bache.descripcion.substring(0, 100)}...</p>
        <div className="bache-card-info">
          <span className="bache-card-location">📍 {bache.ubicacion.direccion}</span>
          <span className={estadoClass}>{ESTADOS_LABELS[bache.estado]}</span>
        </div>
        <div className="bache-card-footer">
          <span className="bache-card-votos">👍 {bache.votos?.length || 0} votos</span>
          <span className="bache-card-date">
            {new Date(bache.fechaReporte).toLocaleDateString("es-AR")}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BacheCard;

