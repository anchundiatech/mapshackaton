"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Hackathon } from "../data/hackathons";

interface MapProps {
  hackathons: Hackathon[];
  selectedHackathon: Hackathon | null;
  onSelectHackathon: (hackathon: Hackathon) => void;
  isDarkMode: boolean;
}

export default function Map({
  hackathons,
  selectedHackathon,
  onSelectHackathon,
  isDarkMode,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // 1. Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    // Create Leaflet Map instance
    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: false, // We'll reposition it or style it
      maxBounds: [[-85, -180], [85, 180]],
      minZoom: 2,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapInstanceRef.current = map;

    // Clean up on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Manage Tile Layer (Light / Dark theme)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layer if it exists
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    // Use CartoDB Positron for light theme, Dark Matter for dark theme
    const tileUrl = isDarkMode
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    const attribution = isDarkMode
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

    const tileLayer = L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
    });

    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;
  }, [isDarkMode]);

  // 3. Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove all old markers
    Object.values(markersRef.current).forEach((marker) => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    // Helper to create styled DOM marker
    const createMarkerIcon = (hackathon: Hackathon, isSelected: boolean) => {
      const isActive = hackathon.status === "active";
      const baseColor = isActive ? "bg-emerald-500" : "bg-blue-600";
      const ringColor = isActive ? "ring-emerald-400/30" : "ring-blue-500/30";
      const iconSizeClass = isSelected ? "w-10 h-10" : "w-7 h-7";
      const borderSize = isSelected ? "border-[3px]" : "border-2";

      return L.divIcon({
        className: "custom-leaflet-marker-wrapper",
        html: `
          <div class="relative flex items-center justify-center transform transition-all duration-300 ${isSelected ? "scale-110" : "hover:scale-105"}">
            ${
              isActive
                ? `<span class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping"></span>`
                : ""
            }
            <div class="relative rounded-full ${iconSizeClass} ${baseColor} text-white flex items-center justify-center shadow-lg ${borderSize} border-white dark:border-zinc-900 transition-all duration-300 ring-4 ${ringColor}">
              ${
                isActive
                  ? `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>`
                  : `<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`
              }
            </div>
            <div class="absolute top-[105%] px-1.5 py-0.5 rounded bg-zinc-900/90 dark:bg-zinc-800/95 border border-zinc-700/50 text-white font-medium text-[9px] tracking-tight whitespace-nowrap shadow-md opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              ${hackathon.name}
            </div>
          </div>
        `,
        iconSize: isSelected ? [40, 40] : [28, 28],
        iconAnchor: isSelected ? [20, 20] : [14, 14],
      });
    };

    // Draw markers
    hackathons.forEach((hackathon) => {
      const isSelected = selectedHackathon?.id === hackathon.id;
      const marker = L.marker([hackathon.location.lat, hackathon.location.lng], {
        icon: createMarkerIcon(hackathon, isSelected),
        zIndexOffset: isSelected ? 1000 : 0,
      });

      marker.on("click", () => {
        onSelectHackathon(hackathon);
      });

      marker.addTo(map);
      markersRef.current[hackathon.id] = marker;
    });
  }, [hackathons, selectedHackathon, onSelectHackathon]);

  // 4. Pan to Selected Hackathon
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedHackathon) return;

    const { lat, lng } = selectedHackathon.location;
    map.setView([lat, lng], 6, {
      animate: true,
      duration: 0.8,
    });
  }, [selectedHackathon]);

  return <div ref={containerRef} className="w-full h-full relative z-10" />;
}
