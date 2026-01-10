import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import html2canvas from "html2canvas";
import { ROSARIO_CENTER, ROSARIO_BOUNDS } from "../../utils/constants.js";
import "leaflet/dist/leaflet.css";

// Fix para iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Componente para el botón de centrar en Rosario
const CenterToRosarioButton = () => {
  const map = useMap();

  const handleCenterToRosario = () => {
    map.setView([ROSARIO_CENTER.lat, ROSARIO_CENTER.lng], 13, {
      animate: true,
      duration: 1.0,
    });
  };

  return (
    <button
      onClick={handleCenterToRosario}
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 1000,
        padding: "10px 15px",
        backgroundColor: "#3498db",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        fontSize: "14px",
        fontWeight: "bold",
        transition: "background-color 0.3s",
      }}
      onMouseEnter={(e) => (e.target.style.backgroundColor = "#2980b9")}
      onMouseLeave={(e) => (e.target.style.backgroundColor = "#3498db")}
      title="Centrar en Rosario"
    >
      📍 Rosario
    </button>
  );
};

// Componente para el botón de descargar mapa
const DownloadMapButton = ({ mapContainerRef }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadMap = async () => {
    if (!mapContainerRef.current) return;

    setDownloading(true);
    try {
      // Esperar un momento para que el mapa se renderice completamente
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(mapContainerRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2, // Mayor resolución
        logging: false,
      });

      // Crear un enlace de descarga
      const link = document.createElement("a");
      const date = new Date().toISOString().split("T")[0];
      link.download = `mapa-baches-rosario-${date}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error al descargar el mapa:", error);
      alert("Error al descargar el mapa. Por favor, intenta nuevamente.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadMap}
      disabled={downloading}
      style={{
        position: "absolute",
        top: "10px",
        right: "140px",
        zIndex: 1000,
        padding: "10px 15px",
        backgroundColor: downloading ? "#95a5a6" : "#27ae60",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: downloading ? "not-allowed" : "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        fontSize: "14px",
        fontWeight: "bold",
        transition: "background-color 0.3s",
      }}
      onMouseEnter={(e) => {
        if (!downloading) {
          e.target.style.backgroundColor = "#229954";
        }
      }}
      onMouseLeave={(e) => {
        if (!downloading) {
          e.target.style.backgroundColor = "#27ae60";
        }
      }}
      title="Descargar mapa con baches"
    >
      {downloading ? "⏳ Descargando..." : "💾 Descargar"}
    </button>
  );
};

const MapView = ({
  baches = [],
  onMarkerClick,
  draggable = false,
  onLocationChange,
  initialCenter,
}) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  // Limpiar el mapa al desmontar
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current = null;
      }
    };
  }, []);

  const getMarkerColor = (estado) => {
    switch (estado) {
      case "reportado":
        return "#f39c12";
      case "en_proceso":
        return "#3498db";
      case "solucionado":
        return "#27ae60";
      default:
        return "#95a5a6";
    }
  };

  const createCustomIcon = (estado) => {
    return L.divIcon({
      className: "custom-marker",
      html: `<div style="background-color: ${getMarkerColor(
        estado
      )}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  return (
    <div
      ref={mapContainerRef}
      style={{ position: "relative", height: "100%", width: "100%" }}
    >
      <MapContainer
        key="map-container"
        center={initialCenter || ROSARIO_CENTER}
        zoom={13}
        minZoom={11}
        maxZoom={19}
        maxBounds={ROSARIO_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{ height: "100%", width: "100%" }}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <CenterToRosarioButton />
        {!draggable && <DownloadMapButton mapContainerRef={mapContainerRef} />}

        {draggable && (
          <DraggableMarker
            initialPosition={initialCenter || ROSARIO_CENTER}
            onLocationChange={onLocationChange}
          />
        )}

        {baches.map((bache) => (
          <Marker
            key={bache._id}
            position={[bache.ubicacion.lat, bache.ubicacion.lng]}
            icon={createCustomIcon(bache.estado)}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(bache),
            }}
          >
            <Popup>
              <div>
                <strong>{bache.titulo}</strong>
                <br />
                {bache.ubicacion.direccion}
                <br />
                <small>Estado: {bache.estado}</small>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

const DraggableMarker = ({ initialPosition, onLocationChange }) => {
  const [position, setPosition] = useState(initialPosition);

  const eventHandlers = {
    dragend: (e) => {
      const marker = e.target;
      const newPos = marker.getLatLng();
      setPosition(newPos);
      if (onLocationChange) {
        onLocationChange({ lat: newPos.lat, lng: newPos.lng });
      }
    },
  };

  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={eventHandlers}
      icon={L.icon({
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      })}
    >
      <Popup>Arrastra el marcador para seleccionar la ubicación</Popup>
    </Marker>
  );
};

export default MapView;
