import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../hooks/useToast.js";
import Loading from "../components/common/Loading.jsx";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      showError(
        "Error al autenticar con Google. Por favor, intenta nuevamente."
      );
      navigate("/login");
      return;
    }

    if (!code) {
      showError("No se recibió el código de autorización de Google.");
      navigate("/login");
      return;
    }

    const authenticate = async () => {
      const result = await handleGoogleCallback(code);
      if (result.success) {
        showSuccess("Sesión iniciada correctamente con Google");
        navigate("/");
      } else {
        showError(result.message || "Error al autenticar con Google");
        navigate("/login");
      }
    };

    authenticate();
  }, [searchParams, handleGoogleCallback, navigate, showSuccess, showError]);

  return <Loading />;
};

export default GoogleCallback;
