import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import NotificationBadge from "./NotificationBadge.jsx";
import "../../styles/Navbar.css";

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🕳️ Baches Rosario
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link">
            Inicio
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/reportar" className="navbar-link">
                Reportar Bache
              </Link>
              {isAdmin && (
                <Link to="/admin" className="navbar-link">
                  Admin
                </Link>
              )}
              <div className="navbar-user">
                <span className="navbar-username">{user?.nombre}</span>
                <NotificationBadge />
                <a
                  href={`${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000"}/api-docs`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="navbar-link"
                  title="Documentación de la API (Swagger)"
                >
                  📚 API Docs
                </a>
                <button onClick={handleLogout} className="navbar-logout">
                  Salir
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="navbar-link navbar-register">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

