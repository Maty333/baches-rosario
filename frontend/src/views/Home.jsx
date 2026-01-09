import { useState, useEffect } from "react";
import { bachesAPI } from "../api/baches.js";
import MapView from "../components/map/MapView.jsx";
import BacheCard from "../components/baches/BacheCard.jsx";
import Loading from "../components/common/Loading.jsx";
import { useNavigate } from "react-router-dom";
import { ESTADOS_BACHE } from "../utils/constants.js";
import "./Home.css";

const Home = () => {
  const [baches, setBaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadBaches();
  }, [filter]);

  const loadBaches = async () => {
    try {
      setLoading(true);
      const params = filter ? { estado: filter } : {};
      const data = await bachesAPI.getAll(params);
      setBaches(data);
    } catch (error) {
      console.error("Error cargando baches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (bache) => {
    navigate(`/bache/${bache._id}`);
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Baches en Rosario</h1>
        <p>Reporta y sigue el estado de los baches en la ciudad</p>
        <div className="home-filters">
          <button
            className={filter === "" ? "filter-active" : ""}
            onClick={() => setFilter("")}
          >
            Todos
          </button>
          <button
            className={filter === ESTADOS_BACHE.REPORTADO ? "filter-active" : ""}
            onClick={() => setFilter(ESTADOS_BACHE.REPORTADO)}
          >
            Reportados
          </button>
          <button
            className={filter === ESTADOS_BACHE.EN_PROCESO ? "filter-active" : ""}
            onClick={() => setFilter(ESTADOS_BACHE.EN_PROCESO)}
          >
            En Proceso
          </button>
          <button
            className={filter === ESTADOS_BACHE.SOLUCIONADO ? "filter-active" : ""}
            onClick={() => setFilter(ESTADOS_BACHE.SOLUCIONADO)}
          >
            Solucionados
          </button>
        </div>
      </div>

      <div className="home-content">
        <div className="home-map">
          {loading ? (
            <Loading />
          ) : (
            <MapView baches={baches} onMarkerClick={handleMarkerClick} />
          )}
        </div>

        <div className="home-list">
          <h2>Lista de Baches ({baches.length})</h2>
          {loading ? (
            <Loading />
          ) : baches.length === 0 ? (
            <p className="no-baches">No hay baches para mostrar</p>
          ) : (
            <div className="baches-grid">
              {baches.map((bache) => (
                <BacheCard key={bache._id} bache={bache} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

