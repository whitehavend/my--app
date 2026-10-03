import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [0, 20];
const pinIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const MapClickHandler = ({ onLocationChange }) => {
  useMapEvents({
    click: (event) => onLocationChange(event.latlng),
  });
  return null;
};

const RecenterMap = ({ latitude, longitude }) => {
  const map = useMap();

  useEffect(() => {
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      map.setView([latitude, longitude], 16);
    }
  }, [latitude, longitude, map]);

  return null;
};

const DeliveryLocationPicker = ({ value, onChange }) => {
  const hasPin = value && Number.isFinite(Number(value.latitude)) && Number.isFinite(Number(value.longitude));
  const latitude = hasPin ? Number(value.latitude) : null;
  const longitude = hasPin ? Number(value.longitude) : null;
  const center = hasPin ? [latitude, longitude] : DEFAULT_CENTER;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300">
      <MapContainer center={center} zoom={hasPin ? 16 : 2} scrollWheelZoom className="h-72 w-full" style={{ height: "320px" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationChange={onChange} />
        <RecenterMap latitude={latitude} longitude={longitude} />
        {hasPin && <Marker position={center} icon={pinIcon} draggable eventHandlers={{ dragend: (event) => onChange(event.target.getLatLng()) }} />}
      </MapContainer>
    </div>
  );
};

export default DeliveryLocationPicker;
