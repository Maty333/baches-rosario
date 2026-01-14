import { toast } from "react-toastify";

/**
 * Hook personalizado para notificaciones consistentes
 * Unifica el uso de toasts en toda la aplicación
 */
export const useToast = () => {
  const showSuccess = (message, options = {}) => {
    toast.success(message, {
      position: "top-right",
      autoClose: options.autoClose ?? 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  };

  const showError = (message, options = {}) => {
    toast.error(message, {
      position: "top-right",
      autoClose: options.autoClose ?? 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  };

  const showWarning = (message, options = {}) => {
    toast.warning(message, {
      position: "top-right",
      autoClose: options.autoClose ?? 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  };

  const showInfo = (message, options = {}) => {
    toast.info(message, {
      position: "top-right",
      autoClose: options.autoClose ?? 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  };

  const showLoading = (message) => {
    return toast.loading(message, {
      position: "top-right",
    });
  };

  const updateToast = (toastId, type, message, options = {}) => {
    toast.update(toastId, {
      render: message,
      type: type,
      isLoading: false,
      autoClose: options.autoClose ?? 3000,
      ...options,
    });
  };

  const dismissToast = (toastId) => {
    toast.dismiss(toastId);
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    updateToast,
    dismissToast,
  };
};
