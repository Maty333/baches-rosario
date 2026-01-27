import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api/auth.js";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapValidationErrors = (validationErrors = []) => {
    const errorMessages = validationErrors.map((err) => {
      const field = err.param || err.path || "campo";
      return `${field}: ${err.msg}`;
    });
    return {
      message: errorMessages.join(" | "),
      errors: validationErrors,
    };
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      loadUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async (token) => {
    try {
      const userData = await authAPI.getMe(token);
      setUser(userData);
    } catch (error) {
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      if (error.response?.status === 429) {
        return {
          success: false,
          message:
            error.response?.data?.message ||
            "Demasiados intentos. Esperá unos minutos y volvé a intentar.",
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || "Error al iniciar sesión",
      };
    }
  };

  const register = async (email, password, nombre, apellido, edad, sexo) => {
    try {
      const data = await authAPI.register(
        email,
        password,
        nombre,
        apellido,
        edad,
        sexo
      );
      localStorage.setItem("token", data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      if (error.response?.status === 429) {
        return {
          success: false,
          message:
            error.response?.data?.message ||
            "Demasiados intentos. Esperá unos minutos y volvé a intentar.",
        };
      }
      if (error.response?.data?.errors) {
        return {
          success: false,
          ...mapValidationErrors(error.response.data.errors),
        };
      }
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al registrarse. Por favor, verifica los datos ingresados.";
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "No estás autenticado" };
      }

      const data = await authAPI.updateProfile(token, profileData);
      const refreshedUser = await authAPI.getMe(token);
      setUser(refreshedUser);

      return {
        success: true,
        message: data.message || "Perfil actualizado",
        user: refreshedUser,
      };
    } catch (error) {
      if (error.response?.data?.errors) {
        return {
          success: false,
          ...mapValidationErrors(error.response.data.errors),
        };
      }
      return {
        success: false,
        message:
          error.response?.data?.message || "Error al actualizar el perfil",
      };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { authUrl } = await authAPI.getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Error al iniciar autenticación con Google",
      };
    }
  };

  const handleGoogleCallback = async (code) => {
    try {
      const data = await authAPI.googleCallback(code);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Error al autenticar con Google",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    handleGoogleCallback,
    updateProfile,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.rol === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
