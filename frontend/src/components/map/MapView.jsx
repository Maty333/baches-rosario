import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { ROSARIO_CENTER } from "../../utils/constants.js";
import "leaflet/dist/leaflet.css";

// Fix para iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const MapView = ({ baches = [], onMarkerClick, draggable = false, onLocationChange, initialCenter }) => {

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
      html: `<div style="background-color: ${getMarkerColor(estado)}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  return (
    <MapContainer
      center={initialCenter || ROSARIO_CENTER}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

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
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      })}
    >
      <Popup>Arrastra el marcador para seleccionar la ubicación</Popup>
    </Marker>
  );
};

export default MapView;

