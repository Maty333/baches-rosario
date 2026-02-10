import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../hooks/useToast.js";
import Loading from "../components/common/Loading.jsx";

/** Parsea el token del hash (#token=xxx) que envía el backend tras el redirect de Google */
const getTokenFromHash = () => {
  const hash = window.location.hash?.slice(1) || "";
  const params = new URLSearchParams(hash);
  return params.get("token");
};

/** Obtiene parámetros de error de la URL */
const getErrorFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("error");
};

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { loginWithToken, loginWithGoogle } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const errorParam = getErrorFromUrl();
    const token = getTokenFromHash();

    // Manejo de errores específicos de OAuth
    if (errorParam) {
      const errorMessages = {
        invalid_grant: "El código de autorización expiró. Por favor, intenta iniciar con Google de nuevo.",
        access_denied: "Acceso denegado. Por favor, intenta de nuevo.",
        server_error: "Error temporal en Google. Por favor, intenta más tarde.",
        temporarily_unavailable: "Google no está disponible en este momento. Por favor, intenta más tarde.",
      };

      const message = errorMessages[errorParam] || "Error al autenticar con Google. Intenta de nuevo.";
      showError(message);
      
      // Redirigir a login con opción de reintentar
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      return;
    }

    if (!token) {
      showError("No se recibió la sesión. Intentá iniciar con Google de nuevo.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    const finishLogin = async () => {
      const result = await loginWithToken(token);
      if (result.success) {
        showSuccess("Sesión iniciada correctamente con Google");
        navigate("/", { replace: true });
      } else {
        showError(result.message || "Error al iniciar sesión");
        navigate("/login");
      }
    };

    finishLogin();
  }, [loginWithToken, loginWithGoogle, navigate, showSuccess, showError]);

  return <Loading />;
};

export default GoogleCallback;
