import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";
import "./Navbar.css";

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { notifications } = useNotifications();
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
                {notifications.length > 0 && (
                  <span className="navbar-notification-badge">{notifications.length}</span>
                )}
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

