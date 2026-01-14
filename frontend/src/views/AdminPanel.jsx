import { useMemo, useState, useEffect } from "react";
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
  const [filters, setFilters] = useState({ estado: "", page: 1, limit: 20 });
  const [bachesPagination, setBachesPagination] = useState(null);

  const [activeTab, setActiveTab] = useState("dashboard");

  const [users, setUsers] = useState([]);
  const [usersPagination, setUsersPagination] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userFilters, setUserFilters] = useState({ rol: "", search: "", page: 1, limit: 20 });

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserLoading, setSelectedUserLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    edad: "",
    sexo: "",
  });
  const [savingUser, setSavingUser] = useState(false);

  const loadStats = async () => {
    try {
      const data = await adminAPI.getStats();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
      toast.error("Error cargando estadísticas");
      setLoading(false);
    }
  };

  const loadBaches = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllBaches(filters);
      setBaches(data.baches);
      setBachesPagination(data.pagination);
    } catch (error) {
      toast.error("Error cargando baches");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const data = await adminAPI.getAllUsers(userFilters);
      setUsers(data.usuarios || []);
      setUsersPagination(data.pagination);
    } catch (error) {
      toast.error("Error cargando usuarios");
    } finally {
      setUsersLoading(false);
    }
  };

  const loadUserDetail = async (userId) => {
    try {
      setSelectedUserLoading(true);
      const data = await adminAPI.getUserById(userId);
      setSelectedUser(data);
      setEditMode(false);
      setEditForm({
        nombre: data.nombre || "",
        apellido: data.apellido || "",
        email: data.email || "",
        edad: data.edad ?? "",
        sexo: data.sexo || "",
      });
    } catch (error) {
      toast.error("Error cargando detalle del usuario");
    } finally {
      setSelectedUserLoading(false);
    }
  };

  const closeUserModal = () => {
    setSelectedUserId(null);
    setSelectedUser(null);
    setEditMode(false);
  };

  const saveUser = async () => {
    if (!selectedUser?._id) return;
    try {
      setSavingUser(true);
      const payload = {};
      if (editForm.nombre) payload.nombre = editForm.nombre;
      if (editForm.apellido) payload.apellido = editForm.apellido;
      if (editForm.email) payload.email = editForm.email;
      if (editForm.edad !== "" && editForm.edad != null) payload.edad = Number(editForm.edad);
      if (editForm.sexo) payload.sexo = editForm.sexo;

      const res = await adminAPI.updateUser(selectedUser._id, payload);
      toast.success(res.message || "Usuario actualizado");
      await loadUsers();
      await loadUserDetail(selectedUser._id);
      setEditMode(false);
    } catch (error) {
      const msg =
        error.response?.data?.errors?.map((e) => e.msg).join(" | ") ||
        error.response?.data?.message ||
        "Error actualizando usuario";
      toast.error(msg);
    } finally {
      setSavingUser(false);
    }
  };

  const deleteUser = async () => {
    if (!selectedUser?._id) return;
    const name = `${selectedUser.nombre || ""} ${selectedUser.apellido || ""}`.trim() || selectedUser.email;
    const ok = window.confirm(
      `¿Eliminar al usuario "${name}"?\n\nEsto también eliminará sus baches y comentarios asociados.`
    );
    if (!ok) return;

    try {
      setSavingUser(true);
      const res = await adminAPI.deleteUser(selectedUser._id);
      toast.success(res.message || "Usuario eliminado");
      closeUserModal();
      await loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error eliminando usuario");
    } finally {
      setSavingUser(false);
    }
  };

  const handleEstadoChange = async (bacheId, nuevoEstado) => {
    try {
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

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === "baches") loadBaches();
  }, [activeTab, filters]);

  useEffect(() => {
    if (activeTab === "usuarios") loadUsers();
  }, [activeTab, userFilters]);

  useEffect(() => {
    if (selectedUserId) loadUserDetail(selectedUserId);
  }, [selectedUserId]);

  const bachesChart = useMemo(() => {
    if (!stats?.baches) return null;
    const total = stats.baches.total || 0;
    const items = [
      { label: "Reportados", value: stats.baches.reportados || 0, color: "#e67e22" },
      { label: "En proceso", value: stats.baches.enProceso || 0, color: "#3498db" },
      { label: "Solucionados", value: stats.baches.solucionados || 0, color: "#27ae60" },
    ];
    return { total, items };
  }, [stats]);

  if (loading && !stats) {
    return (
      <div className="admin-panel-container">
        <Loading />
      </div>
    );
  }

  return (
    <div className="admin-panel-container">
      <h1>Panel de Administración</h1>

      <div className="admin-tabs">
        <button
          className={activeTab === "dashboard" ? "tab active" : "tab"}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>
        <button className={activeTab === "baches" ? "tab active" : "tab"} onClick={() => setActiveTab("baches")}>
          Baches
        </button>
        <button
          className={activeTab === "usuarios" ? "tab active" : "tab"}
          onClick={() => setActiveTab("usuarios")}
        >
          Usuarios
        </button>
      </div>

      {activeTab === "dashboard" && (
        <div className="admin-section">
          {stats && (
            <>
              <div className="admin-stats">
                <div className="stat-card">
                  <h3>Total Baches</h3>
                  <p className="stat-number">{stats.baches?.total ?? 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Usuarios</h3>
                  <p className="stat-number">{stats.usuarios?.total ?? 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Comentarios</h3>
                  <p className="stat-number">{stats.comentarios?.total ?? 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Tiempo Promedio</h3>
                  <p className="stat-number">{stats.baches?.tiempoPromedioSolucion ?? 0} días</p>
                </div>
              </div>

              {bachesChart && (
                <div className="chart-card">
                  <h2>Baches por estado</h2>
                  <div className="bar-chart">
                    {bachesChart.items.map((it) => {
                      const pct = bachesChart.total > 0 ? Math.round((it.value / bachesChart.total) * 100) : 0;
                      return (
                        <div key={it.label} className="bar-row">
                          <div className="bar-label">{it.label}</div>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${pct}%`, background: it.color }} />
                          </div>
                          <div className="bar-value">
                            {it.value} ({pct}%)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "baches" && (
        <div className="admin-baches admin-section">
          <h2>Gestión de Baches</h2>
          <div className="admin-filters">
            <select value={filters.estado} onChange={(e) => setFilters({ ...filters, estado: e.target.value, page: 1 })}>
              <option value="">Todos los estados</option>
              <option value={ESTADOS_BACHE.REPORTADO}>Reportados</option>
              <option value={ESTADOS_BACHE.EN_PROCESO}>En Proceso</option>
              <option value={ESTADOS_BACHE.SOLUCIONADO}>Solucionados</option>
            </select>
          </div>

          {loading ? (
            <Loading />
          ) : (
            <>
              <div className="admin-baches-list">
                {baches.map((bache) => (
                  <div key={bache._id} className="admin-bache-item">
                    <div className="admin-bache-info">
                      <h3>{bache.titulo || "Sin título"}</h3>
                      <p>{bache.ubicacion?.direccion || "Sin dirección"}</p>
                      <p className="admin-bache-date">
                        {bache.fechaReporte ? new Date(bache.fechaReporte).toLocaleDateString("es-AR") : "Sin fecha"}
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

              {bachesPagination && (
                <div className="pagination">
                  <button
                    className="btn"
                    disabled={filters.page <= 1}
                    onClick={() => setFilters((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                  >
                    Anterior
                  </button>
                  <span className="page-info">
                    Página {bachesPagination.page} de {bachesPagination.pages}
                  </span>
                  <button
                    className="btn"
                    disabled={bachesPagination.page >= bachesPagination.pages}
                    onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "usuarios" && (
        <div className="admin-users admin-section">
          <h2>Gestión de Usuarios</h2>
          <div className="admin-filters users-filters">
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o email"
              value={userFilters.search}
              onChange={(e) => setUserFilters((p) => ({ ...p, search: e.target.value, page: 1 }))}
            />
            <select value={userFilters.rol} onChange={(e) => setUserFilters((p) => ({ ...p, rol: e.target.value, page: 1 }))}>
              <option value="">Todos los roles</option>
              <option value="usuario">Usuario</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {usersLoading ? (
            <Loading />
          ) : (
            <>
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Baches</th>
                      <th>Comentarios</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="empty">
                          No hay usuarios para mostrar
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u._id}>
                          <td>{`${u.nombre || ""} ${u.apellido || ""}`.trim() || "-"}</td>
                          <td>{u.email}</td>
                          <td>
                            <span className={u.rol === "admin" ? "badge badge-admin" : "badge"}>{u.rol}</span>
                          </td>
                          <td>{u.totalBaches ?? 0}</td>
                          <td>{u.totalComentarios ?? 0}</td>
                          <td style={{ textAlign: "right" }}>
                            <button className="btn btn-secondary" onClick={() => setSelectedUserId(u._id)}>
                              Ver / editar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {usersPagination && (
                <div className="pagination">
                  <button
                    className="btn"
                    disabled={userFilters.page <= 1}
                    onClick={() => setUserFilters((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                  >
                    Anterior
                  </button>
                  <span className="page-info">
                    Página {usersPagination.page} de {usersPagination.pages}
                  </span>
                  <button
                    className="btn"
                    disabled={usersPagination.page >= usersPagination.pages}
                    onClick={() => setUserFilters((p) => ({ ...p, page: p.page + 1 }))}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}

          {selectedUserId && (
            <div className="modal-backdrop" onMouseDown={closeUserModal}>
              <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Detalle de usuario</h3>
                  <button className="icon-btn" onClick={closeUserModal} aria-label="Cerrar">
                    ✕
                  </button>
                </div>

                {selectedUserLoading || !selectedUser ? (
                  <Loading />
                ) : (
                  <>
                    <div className="modal-body">
                      <div className="user-meta">
                        <div>
                          <div className="muted">ID</div>
                          <div className="mono">{selectedUser._id}</div>
                        </div>
                        <div>
                          <div className="muted">Rol</div>
                          <div>
                            <span className={selectedUser.rol === "admin" ? "badge badge-admin" : "badge"}>
                              {selectedUser.rol}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="muted">Registrado</div>
                          <div>{new Date(selectedUser.fechaRegistro || selectedUser.createdAt).toLocaleString("es-AR")}</div>
                        </div>
                      </div>

                      <div className="modal-actions">
                        <button className="btn btn-secondary" onClick={() => setEditMode((v) => !v)}>
                          {editMode ? "Cancelar edición" : "Editar"}
                        </button>
                        <button className="btn btn-danger" onClick={deleteUser} disabled={savingUser}>
                          {savingUser ? "Eliminando..." : "Eliminar usuario"}
                        </button>
                      </div>

                      {editMode ? (
                        <div className="form-grid">
                          <div className="field">
                            <label>Nombre</label>
                            <input value={editForm.nombre} onChange={(e) => setEditForm((p) => ({ ...p, nombre: e.target.value }))} />
                          </div>
                          <div className="field">
                            <label>Apellido</label>
                            <input
                              value={editForm.apellido}
                              onChange={(e) => setEditForm((p) => ({ ...p, apellido: e.target.value }))}
                            />
                          </div>
                          <div className="field">
                            <label>Email</label>
                            <input value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
                          </div>
                          <div className="field">
                            <label>Edad</label>
                            <input
                              type="number"
                              min="13"
                              max="120"
                              value={editForm.edad}
                              onChange={(e) => setEditForm((p) => ({ ...p, edad: e.target.value }))}
                            />
                          </div>
                          <div className="field">
                            <label>Sexo</label>
                            <select value={editForm.sexo} onChange={(e) => setEditForm((p) => ({ ...p, sexo: e.target.value }))}>
                              <option value="">(sin cambios)</option>
                              <option value="masculino">Masculino</option>
                              <option value="femenino">Femenino</option>
                              <option value="otro">Otro</option>
                              <option value="prefiero no decir">Prefiero no decir</option>
                            </select>
                          </div>
                          <div className="field" />
                          <div className="field">
                            <button className="btn" onClick={saveUser} disabled={savingUser}>
                              {savingUser ? "Guardando..." : "Guardar cambios"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="stats-grid">
                          <div className="stat-mini">
                            <div className="muted">Baches</div>
                            <div className="big">{selectedUser.estadisticas?.totalBaches ?? 0}</div>
                          </div>
                          <div className="stat-mini">
                            <div className="muted">Comentarios</div>
                            <div className="big">{selectedUser.estadisticas?.totalComentarios ?? 0}</div>
                          </div>
                          <div className="stat-mini">
                            <div className="muted">Reportados</div>
                            <div className="big">{selectedUser.estadisticas?.bachesPorEstado?.reportados ?? 0}</div>
                          </div>
                          <div className="stat-mini">
                            <div className="muted">En proceso</div>
                            <div className="big">{selectedUser.estadisticas?.bachesPorEstado?.enProceso ?? 0}</div>
                          </div>
                          <div className="stat-mini">
                            <div className="muted">Solucionados</div>
                            <div className="big">{selectedUser.estadisticas?.bachesPorEstado?.solucionados ?? 0}</div>
                          </div>
                        </div>
                      )}

                      {!editMode && selectedUser.estadisticas?.ultimosBaches?.length > 0 && (
                        <div className="recent">
                          <h4>Últimos baches</h4>
                          <ul>
                            {selectedUser.estadisticas.ultimosBaches.map((b) => (
                              <li key={b._id}>
                                <span className="recent-title">{b.titulo}</span>
                                <span className="recent-meta">
                                  {ESTADOS_LABELS[b.estado] || b.estado} · {new Date(b.fechaReporte).toLocaleDateString("es-AR")} ·{" "}
                                  {b.totalVotos} votos
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

