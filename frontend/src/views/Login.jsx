import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../hooks/useToast.js";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const { login, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useToast();

  // Auto-login cuando llega desde el link de verificación de email (#token=...)
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#token=")) return;
    const token = decodeURIComponent(hash.replace("#token=", "").split("&")[0]);
    if (!token) return;
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    );
    (async () => {
      const result = await loginWithToken(token);
      if (result.success) {
        showSuccess("¡Cuenta verificada! Ya estás dentro.");
        navigate("/", { replace: true });
      } else {
        showError(result.message || "No se pudo iniciar sesión.");
      }
    })();
  }, [loginWithToken, navigate, showSuccess, showError]);

  useEffect(() => {
    const verified = searchParams.get("verified");
    const error = searchParams.get("error");
    if (verified === "1") {
      showSuccess("Cuenta verificada. Ya podés iniciar sesión.");
      setSearchParams({}, { replace: true });
    } else if (error) {
      const messages = {
        token_required: "Faltó el token de verificación.",
        token_invalid_or_expired:
          "El enlace de verificación venció o no es válido. Podés registrarte de nuevo para recibir otro correo.",
        verification_failed: "No se pudo verificar el email. Intentá de nuevo.",
      };
      showError(messages[error] || "Error al verificar el email.");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, showSuccess, showError]);

  const isLocked = lockedUntil && Date.now() < lockedUntil;
  const lockSecondsLeft = isLocked
    ? Math.ceil((lockedUntil - Date.now()) / 1000)
    : 0;

  const validateLoginForm = () => {
    if (!email.trim()) return "El email es requerido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return "El email no es válido";
    if (!password) return "La contraseña es requerida";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) {
      showError(
        `Demasiados intentos. Esperá ${lockSecondsLeft}s y volvé a intentar.`
      );
      return;
    }

    const localError = validateLoginForm();
    if (localError) {
      showError(localError);
      return;
    }

    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      showSuccess("Sesión iniciada correctamente");
      setFailedAttempts(0);
      setLockedUntil(null);
      navigate("/");
    } else {
      showError(result.message);
      setFailedAttempts((prev) => {
        const next = prev + 1;
        if (next >= 3) {
          setLockedUntil(Date.now() + 30_000);
        }
        return next;
      });
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || isLocked}
            className="submit-button"
          >
            {loading
              ? "Iniciando sesión..."
              : isLocked
              ? `Esperá ${lockSecondsLeft}s...`
              : "Iniciar Sesión"}
          </button>
        </form>

        <p className="register-link">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
