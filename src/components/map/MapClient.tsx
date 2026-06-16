"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix Leaflet's default icon path issues in React
const iconRetinaUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png";
const iconUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png";
const shadowUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

const issues = [
  {
    id: "MH-PUN-0142",
    title: "Massive pothole on Main Street",
    position: [18.5308, 73.8475],
    status: "New",
  },
  {
    id: "MH-PUN-0143",
    title: "Garbage piled up near school",
    position: [18.5089, 73.8056],
    status: "Acknowledged",
  },
  {
    id: "MH-PUN-0144",
    title: "Street lights not working",
    position: [18.5590, 73.7868],
    status: "Resolved",
  }
];

export default function MapClient() {
  
  useEffect(() => {
    L.Marker.prototype.options.icon = defaultIcon;
  }, []);

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={[18.5204, 73.8567]} // Default center to Pune for dummy data
        zoom={12} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {issues.map((issue) => (
          <Marker 
            key={issue.id} 
            position={issue.position as [number, number]}
          >
            <Popup>
              <div className="font-sans">
                <p className="font-bold mb-1">{issue.title}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">{issue.id}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                    issue.status === 'New' ? 'bg-destructive/20 text-destructive' :
                    issue.status === 'Resolved' ? 'bg-green-500/20 text-green-700' :
                    'bg-secondary text-secondary-foreground'
                  }`}>
                    {issue.status}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
