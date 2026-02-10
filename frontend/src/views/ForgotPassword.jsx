import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../api/auth.js";
import { useToast } from "../hooks/useToast.js";
import "../styles/Login.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const validateEmail = (emailValue) => {
    const newErrors = {};
    if (!emailValue.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      newErrors.email = "Ingresá un email válido";
    }
    return newErrors;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (errors.email) {
      const newErrors = validateEmail(value);
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateEmail(email);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSubmitted(true);
      showSuccess("Si existe una cuenta asociada, recibirás un correo con instrucciones.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const message = err.response?.data?.message || "Error al solicitar restablecimiento";
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="success-message">
            <h2>✓ Solicitud enviada</h2>
            <p>Si existe una cuenta asociada al email, te hemos enviado un enlace para restablecer tu contraseña.</p>
            <p className="info-text">Revisa tu bandeja de entrada y sigue las instrucciones en el correo (válido por 1 hora).</p>
            <Link to="/login" className="submit-button" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
              Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Recuperar Contraseña</h2>
        <p className="form-description">Ingresá el email de tu cuenta y te enviaremos un enlace para restablecer tu contraseña.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => setErrors(validateEmail(email))}
              className={errors.email ? "error" : ""}
              placeholder="tu@email.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? "Enviando..." : "Enviar enlace de restablecimiento"}
          </button>
        </form>

        <p className="register-link">
          ¿Recordaste tu contraseña? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
