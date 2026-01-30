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

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const token = getTokenFromHash();

    if (!token) {
      showError("No se recibió la sesión. Intentá iniciar con Google de nuevo.");
      navigate("/login");
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
  }, [loginWithToken, navigate, showSuccess, showError]);

  return <Loading />;
};

export default GoogleCallback;
