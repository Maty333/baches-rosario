import { createContext, useContext, useEffect, useState } from "react";
import { getSocket } from "../utils/socket.js";
import { useAuth } from "./AuthContext.jsx";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications debe usarse dentro de NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();

    socket.on("bacheActualizado", (data) => {
      if (data.estado === "solucionado") {
        setNotifications((prev) => [
          {
            id: Date.now(),
            type: "success",
            message: `¡Un bache ha sido solucionado! Tardó ${data.tiempoSolucion || "N/A"} días.`,
            bacheId: data.id || data._id,
            timestamp: Date.now(),
          },
          ...prev,
        ]);
      } else if (data.estado === "en_proceso") {
        setNotifications((prev) => [
          {
            id: Date.now(),
            type: "info",
            message: `Un bache está siendo procesado: ${data.titulo || "Bache"}`,
            bacheId: data.id || data._id,
            timestamp: Date.now(),
          },
          ...prev,
        ]);
      }
    });

    socket.on("nuevoBache", (bache) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "info",
          message: `Nuevo bache reportado: ${bache.titulo || "Bache"}`,
          bacheId: bache._id || bache.id,
          timestamp: Date.now(),
        },
        ...prev,
      ]);
    });

    return () => {
      socket.off("bacheActualizado");
      socket.off("nuevoBache");
    };
  }, [isAuthenticated]);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, removeNotification, clearNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

