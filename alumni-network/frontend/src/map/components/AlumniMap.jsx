import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import axios from 'axios';
import MarkerPopup from './MarkerPopup';
import Filters from './Filters';
import '../../map/styles/map.css';
import 'leaflet/dist/leaflet.css';

// Vite-safe fix for Leaflet icon URLs (replace require)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

const DEFAULT_CENTER = [20.5937, 78.9629];

function BoundsFetcher({ onBoundsChange }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
      onBoundsChange(bbox);
    }
  });
  return null;
}

export default function AlumniMap({ apiBase = '', useMock = true }) {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ company: 'All', batch: 'All' });
  const mapRef = useRef();

  async function fetchForBbox(bbox) {
    setLoading(true); setError(null);
    try {
      if (useMock) {
        const url = '/map/data/sample-response.json';
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Mock data not found (${res.status})`);
        const data = await res.json();
        setAlumni(Array.isArray(data) ? data : []);
      } else {
        // if bbox is null/undefined, call without bbox (backend may return limited set)
        const qs = bbox ? `?bbox=${encodeURIComponent(bbox)}` : '';
        const url = `${apiBase || ''}/api/alumni${qs}`;
        const res = await axios.get(url);
        setAlumni(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('fetchForBbox error', err);
      setError('Failed to load alumni');
      setAlumni([]); // keep UI stable
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // initial fetch: try using map bounds if available
    const map = mapRef.current;
    if (map && typeof map.getBounds === 'function') {
      const b = map.getBounds();
      const bbox = `${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`;
      fetchForBbox(bbox);
    } else {
      fetchForBbox(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = alumni.filter(a => {
    if (filters.company !== 'All' && a.company !== filters.company) return false;
    if (filters.batch !== 'All' && String(a.graduation_year) !== String(filters.batch)) return false;
    return true;
  });

  return (
    <div className="alumni-map-wrapper">
      <h2 className="map-title">See where our alumni work — get inspired</h2>
      <Filters alumni={alumni} filters={filters} setFilters={setFilters} />

      <div className="map-container">
        {loading && <div className="map-loading">Loading...</div>}
        {error && <div className="map-error">{error}</div>}
        <MapContainer center={DEFAULT_CENTER} zoom={4} style={{ height: '70vh' }} whenCreated={(m)=>mapRef.current=m}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <BoundsFetcher onBoundsChange={(bbox)=>fetchForBbox(bbox)} />
          <MarkerClusterGroup>
            {filtered.map(a => {
              if (!a.display_point) return null; // don't show hidden
              const position = [a.display_point.lat, a.display_point.lng];
              return (
                <Marker key={a.id} position={position}>
                  <Popup>
                    <MarkerPopup alumni={a} />
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      <div className="map-footer">
        <small>Privacy: only alumni who opted in are shown.</small>
      </div>
    </div>
  );
}
