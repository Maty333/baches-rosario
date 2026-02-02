import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../hooks/useToast.js";
import GoogleIcon from "../components/common/GoogleIcon.jsx";
import "../styles/Register.css";

const Register = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [edad, setEdad] = useState("");
  const [sexo, setSexo] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const handleGoogleLogin = async () => {
    const result = await loginWithGoogle();
    if (!result?.success && result?.message) {
      showError(result.message);
    }
  };

  const validateNombre = (value) => {
    if (!value.trim()) {
      return "El nombre es requerido";
    } else if (value.trim().length < 2) {
      return "El nombre debe tener al menos 2 caracteres";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) {
      return "El nombre solo puede contener letras y espacios";
    }
    return "";
  };

  const validateApellido = (value) => {
    if (!value.trim()) {
      return "El apellido es requerido";
    } else if (value.trim().length < 2) {
      return "El apellido debe tener al menos 2 caracteres";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) {
      return "El apellido solo puede contener letras y espacios";
    }
    return "";
  };

  const validateEmail = (value) => {
    if (!value.trim()) {
      return "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return "El email no es válido";
    }
    return "";
  };

  const validatePassword = (value) => {
    if (!value) {
      return "La contraseña es requerida";
    } else if (value.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return "La contraseña debe contener al menos una mayúscula, una minúscula y un número";
    }
    return "";
  };

  const validateEdad = (value) => {
    if (!value) {
      return "La edad es requerida";
    } else {
      const edadNum = parseInt(value);
      if (isNaN(edadNum) || edadNum < 13 || edadNum > 120) {
        return "La edad debe ser un número entre 13 y 120 años";
      }
    }
    return "";
  };

  const validateSexo = (value) => {
    if (!value) {
      return "El sexo es requerido";
    } else if (
      !["masculino", "femenino", "otro", "prefiero no decir"].includes(value)
    ) {
      return "Selecciona una opción válida";
    }
    return "";
  };

  const isFieldValid = (fieldName, value) => {
    if (!value) return false;
    switch (fieldName) {
      case "nombre":
        return validateNombre(value) === "";
      case "apellido":
        return validateApellido(value) === "";
      case "email":
        return validateEmail(value) === "";
      case "password":
        return validatePassword(value) === "";
      case "edad":
        return validateEdad(value) === "";
      case "sexo":
        return validateSexo(value) === "";
      default:
        return false;
    }
  };

  const validateForm = () => {
    const newErrors = {
      nombre: validateNombre(nombre),
      apellido: validateApellido(apellido),
      email: validateEmail(email),
      password: validatePassword(password),
      edad: validateEdad(edad),
      sexo: validateSexo(sexo),
    };

    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const errorMessages = Object.values(errors).filter((msg) => msg);
      if (errorMessages.length > 0) {
        showError(`Errores en el formulario: ${errorMessages.join(", ")}`);
      } else {
        showError("Por favor, completa todos los campos requeridos");
      }
      return;
    }

    setLoading(true);

    const result = await register(
      email,
      password,
      nombre,
      apellido,
      parseInt(edad),
      sexo
    );

    if (result.success) {
      if (result.requiresVerification) {
        showSuccess(
          result.message || "Revisá tu email para verificar tu cuenta.",
          { autoClose: 8000 }
        );
        navigate("/login");
      } else {
        showSuccess("Registro exitoso");
        navigate("/");
      }
    } else {
      if (result.errors && Array.isArray(result.errors)) {
        const backendErrors = {};
        result.errors.forEach((err) => {
          const field = err.param || err.path;
          if (field) {
            backendErrors[field] = err.msg;
          }
        });
        setErrors((prevErrors) => ({ ...prevErrors, ...backendErrors }));
      }

      if (result.message) {
        showError(result.message, { autoClose: 5000 });
      } else {
        showError(
          "Error al registrarse. Por favor, verifica los datos ingresados."
        );
      }
    }

    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Registrarse</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre *</label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => {
                const value = e.target.value;
                setNombre(value);
                const error = validateNombre(value);
                setErrors({ ...errors, nombre: error });
              }}
              onBlur={(e) => {
                const error = validateNombre(e.target.value);
                setErrors({ ...errors, nombre: error });
              }}
              className={
                errors.nombre
                  ? "error"
                  : isFieldValid("nombre", nombre)
                  ? "valid"
                  : ""
              }
            />
            {errors.nombre && (
              <span className="error-message">{errors.nombre}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="apellido">Apellido *</label>
            <input
              type="text"
              id="apellido"
              value={apellido}
              onChange={(e) => {
                const value = e.target.value;
                setApellido(value);
                const error = validateApellido(value);
                setErrors({ ...errors, apellido: error });
              }}
              onBlur={(e) => {
                const error = validateApellido(e.target.value);
                setErrors({ ...errors, apellido: error });
              }}
              className={
                errors.apellido
                  ? "error"
                  : isFieldValid("apellido", apellido)
                  ? "valid"
                  : ""
              }
            />
            {errors.apellido && (
              <span className="error-message">{errors.apellido}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);
                if (value.length >= 3 || value.length === 0) {
                  const error = validateEmail(value);
                  setErrors({ ...errors, email: error });
                } else {
                  setErrors({ ...errors, email: "" });
                }
              }}
              onBlur={(e) => {
                const error = validateEmail(e.target.value);
                setErrors({ ...errors, email: error });
              }}
              className={
                errors.email
                  ? "error"
                  : isFieldValid("email", email)
                  ? "valid"
                  : ""
              }
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña *</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);
                  const error = validatePassword(value);
                  setErrors({ ...errors, password: error });
                }}
                onBlur={(e) => {
                  const error = validatePassword(e.target.value);
                  setErrors({ ...errors, password: error });
                }}
                className={
                  errors.password
                    ? "error"
                    : isFieldValid("password", password)
                    ? "valid"
                    : ""
                }
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
            <small className="form-hint">
              Mínimo 6 caracteres, debe incluir mayúscula, minúscula y número
            </small>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="edad">Edad *</label>
            <input
              type="number"
              id="edad"
              value={edad}
              onChange={(e) => {
                const value = e.target.value;
                setEdad(value);
                if (value) {
                  const error = validateEdad(value);
                  setErrors({ ...errors, edad: error });
                } else {
                  setErrors({ ...errors, edad: "" });
                }
              }}
              onBlur={(e) => {
                const error = validateEdad(e.target.value);
                setErrors({ ...errors, edad: error });
              }}
              min="13"
              max="120"
              className={
                errors.edad
                  ? "error"
                  : isFieldValid("edad", edad)
                  ? "valid"
                  : ""
              }
            />
            {errors.edad && (
              <span className="error-message">{errors.edad}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="sexo">Sexo *</label>
            <select
              id="sexo"
              value={sexo}
              onChange={(e) => {
                const value = e.target.value;
                setSexo(value);
                const error = validateSexo(value);
                setErrors({ ...errors, sexo: error });
              }}
              onBlur={(e) => {
                const error = validateSexo(e.target.value);
                setErrors({ ...errors, sexo: error });
              }}
              className={
                errors.sexo
                  ? "error"
                  : isFieldValid("sexo", sexo)
                  ? "valid"
                  : ""
              }
            >
              <option value="">Selecciona una opción</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
              <option value="prefiero no decir">Prefiero no decir</option>
            </select>
            {errors.sexo && (
              <span className="error-message">{errors.sexo}</span>
            )}
          </div>
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div className="divider">
          <span>o</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="google-button"
        >
          <GoogleIcon />
          Continuar con Google
        </button>

        <p className="login-link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
