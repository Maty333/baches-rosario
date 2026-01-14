import { useState, useEffect } from "react";
import { checkConnection } from "../../utils/axiosConfig.js";
import "../../styles/ConnectionStatus.css";

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isConnected, setIsConnected] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setIsConnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const checkServerConnection = async () => {
      if (!navigator.onLine) {
        setIsConnected(false);
        return;
      }

      setChecking(true);
      try {
        const connected = await checkConnection();
        setIsConnected(connected);
      } catch {
        setIsConnected(false);
      } finally {
        setChecking(false);
      }
    };

    checkServerConnection();
    const interval = setInterval(checkServerConnection, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && isConnected) {
    return null;
  }

  return (
    <div className={`connection-status ${!isOnline || !isConnected ? "offline" : ""}`}>
      <span className="connection-icon">
        {!isOnline ? "📡" : checking ? "🔄" : "⚠️"}
      </span>
      <span className="connection-message">
        {!isOnline
          ? "Sin conexión a internet"
          : !isConnected
          ? "No se puede conectar al servidor"
          : "Verificando conexión..."}
      </span>
    </div>
  );
};

export default ConnectionStatus;
