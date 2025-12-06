"use client";


import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Next.js/React
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom colored marker for different companies
const createColoredIcon = (color: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background: linear-gradient(135deg, ${color}, ${color}dd);
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

// Company color mapping
const companyColors: Record<string, string> = {
  Google: "#4285F4",
  Microsoft: "#00A4EF",
  Amazon: "#FF9900",
  Flipkart: "#F7D000",
  Infosys: "#007CC3",
  TCS: "#008CD6",
  Wipro: "#8B2332",
  Accenture: "#A100FF",
  Deloitte: "#86BC25",
  default: "#0066FF",
};

export interface AlumniMarker {
  id: string;
  name: string;
  graduation_year?: number;
  company?: string;
  role?: string;
  city?: string;
  state?: string;
  display_point: {
    lat: number;
    lng: number;
  };
}

interface AlumniMapProps {
  alumni: AlumniMarker[];
  center?: [number, number];
  zoom?: number;
}

// Component to fit bounds to markers
function FitBounds({ alumni }: { alumni: AlumniMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (alumni.length > 0) {
      const bounds = L.latLngBounds(
        alumni.map((a) => [a.display_point.lat, a.display_point.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
    }
  }, [alumni, map]);

  return null;
}

export default function AlumniMap({
  alumni,
  center = [20.5937, 78.9629], // Center of India
  zoom = 4,
}: AlumniMapProps) {
  // Set default icon
  useEffect(() => {
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

  if (alumni.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#f0f7ff] to-[#e8f4ff] rounded-xl">
        <div className="text-center p-8">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-[#e4f0ff] flex items-center justify-center">
            <svg
              className="h-8 w-8 text-[#7088aa]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <p className="text-[#7088aa] text-lg font-medium">No locations to display</p>
          <p className="text-[#a8bdda] text-sm mt-1">
            Alumni with location data will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%", borderRadius: "inherit" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds alumni={alumni} />
      
      {alumni.map((alumnus) => {
        const color = companyColors[alumnus.company || ""] || companyColors.default;
        const icon = createColoredIcon(color);

        return (
          <Marker
            key={alumnus.id}
            position={[alumnus.display_point.lat, alumnus.display_point.lng]}
            icon={icon}
          >
            <Popup>
              <div style={{ minWidth: 220, fontFamily: "Inter, sans-serif" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: 18,
                    }}
                  >
                    {alumnus.company ? alumnus.company[0] : "A"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#001145" }}>
                      {alumnus.name}
                    </div>
                    <div style={{ fontSize: 13, color: "#4a5f7c" }}>
                      {alumnus.role} @ {alumnus.company}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      background: "#e4f0ff",
                      color: "#001145",
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Batch {alumnus.graduation_year}
                  </span>
                  <span
                    style={{
                      background: "#f0fdf4",
                      color: "#166534",
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    📍 {alumnus.city}, {alumnus.state}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => alert("Connect feature coming soon!")}
                    style={{
                      flex: 1,
                      background: "linear-gradient(135deg, #0066FF, #0044dd)",
                      color: "white",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Connect
                  </button>
                  <button
                    onClick={() => window.open(`/alumni/${alumnus.id}`, "_blank")}
                    style={{
                      flex: 1,
                      background: "#f6f9fe",
                      color: "#0066FF",
                      border: "1px solid #dbeaff",
                      padding: "8px 12px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
