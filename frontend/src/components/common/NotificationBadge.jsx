import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext.jsx";
import "../../styles/NotificationBadge.css";

const NotificationBadge = () => {
  const { notifications, removeNotification, clearNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (notifications.length === 0) {
    return null;
  }

  const handleNotificationClick = (notification) => {
    if (notification.bacheId) {
      navigate(`/bache/${notification.bacheId}`);
    }
    removeNotification(notification.id);
    setIsOpen(false);
  };

  const unreadCount = notifications.length;

  return (
    <div className="notification-badge-container">
      <button
        className="notification-badge-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`${unreadCount} notificaciones`}
      >
        <span className="notification-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-count">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="notification-backdrop" onClick={() => setIsOpen(false)} />
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notificaciones</h3>
              {notifications.length > 0 && (
                <button className="notification-clear" onClick={clearNotifications}>
                  Limpiar todo
                </button>
              )}
            </div>
            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="notification-empty">No hay notificaciones</div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item notification-${notification.type || "info"}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-content">
                      <p className="notification-message">{notification.message}</p>
                      <span className="notification-time">
                        {new Date(notification.timestamp || notification.id).toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <button
                      className="notification-close"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      aria-label="Cerrar notificación"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBadge;
