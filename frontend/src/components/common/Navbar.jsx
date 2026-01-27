import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../hooks/useToast.js";
import NotificationBadge from "./NotificationBadge.jsx";
import GoogleIcon from "./GoogleIcon.jsx";
import "../../styles/Navbar.css";

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { showError } = useToast();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleGoogleLogin = async () => {
    const result = await loginWithGoogle();
    if (!result?.success && result?.message) {
      showError(result.message);
    }
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
              <button
                onClick={handleGoogleLogin}
                className="navbar-google-button"
                title="Iniciar sesión con Google"
              >
                <GoogleIcon width={18} height={18} />
                <span>Iniciar con Google</span>
              </button>
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

