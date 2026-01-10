import { useState, useEffect } from "react";
import { adminAPI } from "../api/admin.js";
import { bachesAPI } from "../api/baches.js";
import { toast } from "react-toastify";
import { ESTADOS_BACHE, ESTADOS_LABELS } from "../utils/constants.js";
import Loading from "../components/common/Loading.jsx";
import "../styles/AdminPanel.css";

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [baches, setBaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ estado: "", page: 1 });

  useEffect(() => {
    loadStats();
    loadBaches();
  }, [filters]);

  const loadStats = async () => {
    try {
      const data = await adminAPI.getStats();
      setStats(data);
    } catch (error) {
      toast.error("Error cargando estadísticas");
    }
  };

  const loadBaches = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllBaches(filters);
      setBaches(data.baches);
    } catch (error) {
      toast.error("Error cargando baches");
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = async (bacheId, nuevoEstado) => {
    try {
      // Necesitamos crear este endpoint en el backend
      const response = await fetch(`http://localhost:3000/api/baches/${bacheId}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (response.ok) {
        toast.success("Estado actualizado");
        loadBaches();
        loadStats();
      } else {
        toast.error("Error al actualizar estado");
      }
    } catch (error) {
      toast.error("Error al actualizar estado");
    }
  };

  if (loading && !stats) {
    return <Loading />;
  }

  return (
    <div className="admin-panel-container">
      <h1>Panel de Administración</h1>

      {stats && (
        <div className="admin-stats">
          <div className="stat-card">
            <h3>Total Baches</h3>
            <p className="stat-number">{stats.baches.total}</p>
          </div>
          <div className="stat-card">
            <h3>Reportados</h3>
            <p className="stat-number">{stats.baches.reportados}</p>
          </div>
          <div className="stat-card">
            <h3>En Proceso</h3>
            <p className="stat-number">{stats.baches.enProceso}</p>
          </div>
          <div className="stat-card">
            <h3>Solucionados</h3>
            <p className="stat-number">{stats.baches.solucionados}</p>
          </div>
          <div className="stat-card">
            <h3>Tiempo Promedio</h3>
            <p className="stat-number">{stats.baches.tiempoPromedioSolucion} días</p>
          </div>
        </div>
      )}

      <div className="admin-baches">
        <h2>Gestión de Baches</h2>
        <div className="admin-filters">
          <select
            value={filters.estado}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value, page: 1 })}
          >
            <option value="">Todos los estados</option>
            <option value={ESTADOS_BACHE.REPORTADO}>Reportados</option>
            <option value={ESTADOS_BACHE.EN_PROCESO}>En Proceso</option>
            <option value={ESTADOS_BACHE.SOLUCIONADO}>Solucionados</option>
          </select>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="admin-baches-list">
            {baches.map((bache) => (
              <div key={bache._id} className="admin-bache-item">
                <div className="admin-bache-info">
                  <h3>{bache.titulo}</h3>
                  <p>{bache.ubicacion.direccion}</p>
                  <p className="admin-bache-date">
                    {new Date(bache.fechaReporte).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <div className="admin-bache-actions">
                  <select
                    value={bache.estado}
                    onChange={(e) => handleEstadoChange(bache._id, e.target.value)}
                    className="estado-select"
                  >
                    {Object.entries(ESTADOS_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

