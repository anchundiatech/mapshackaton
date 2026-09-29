"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import GlobeGL, { GlobeMethods } from "react-globe.gl";
import { Hackathon } from "../lib/types";

interface GlobeProps {
  hackathons: Hackathon[];
  selectedHackathon: Hackathon | null;
  onSelectHackathon: (hackathon: Hackathon) => void;
  isDarkMode: boolean;
}

// After filtering, lat/lng are guaranteed present.
type GeoHackathon = Hackathon & { location: { lat: number; lng: number; city: string; country: string } };

function isGeocoded(h: Hackathon): h is GeoHackathon {
  return h.location.lat !== null && h.location.lng !== null;
}

export default function Globe({ hackathons, selectedHackathon, onSelectHackathon, isDarkMode }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Size the canvas to fill its flex/grid parent (globe.gl needs explicit px dims).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleGlobeReady = useCallback(() => {
    const controls = globeRef.current?.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.enablePan = false;
      controls.minDistance = 120;
      controls.maxDistance = 500;
    }
    globeRef.current?.pointOfView({ lat: 15, lng: 10, altitude: 2.2 });
  }, []);

  // Pause auto-rotation while something is focused; resume once cleared.
  useEffect(() => {
    const controls = globeRef.current?.controls();
    if (controls) controls.autoRotate = !selectedHackathon;
  }, [selectedHackathon]);

  // Fly the camera to the selected hackathon.
  useEffect(() => {
    if (!selectedHackathon || !isGeocoded(selectedHackathon)) return;
    globeRef.current?.pointOfView(
      { lat: selectedHackathon.location.lat, lng: selectedHackathon.location.lng, altitude: 1.4 },
      1000
    );
  }, [selectedHackathon]);

  const createMarkerEl = useCallback(
    (d: object) => {
      const hackathon = d as GeoHackathon;
      const isActive = hackathon.status === "active";
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          ${
            isActive
              ? `<span class="absolute inline-flex h-7 w-7 rounded-full bg-emerald-400 opacity-60 animate-ping"></span>`
              : ""
          }
          <div class="relative rounded-full w-4 h-4 ${
            isActive ? "bg-emerald-500 ring-emerald-400/40" : "bg-blue-600 ring-blue-500/40"
          } border-2 border-white shadow-lg ring-4 transition-transform duration-200 group-hover:scale-125"></div>
          <div class="absolute bottom-[130%] left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-zinc-900/90 border border-zinc-700/50 text-white font-medium text-[9px] tracking-tight whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            ${hackathon.name}
          </div>
        </div>
      `;
      const marker = wrapper.firstElementChild as HTMLElement;
      marker.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectHackathon(hackathon);
      });
      return wrapper;
    },
    [onSelectHackathon]
  );

  const points = hackathons.filter(isGeocoded);
  const ring = selectedHackathon && isGeocoded(selectedHackathon) ? [selectedHackathon] : [];

  return (
    <div ref={containerRef} className="w-full h-full relative z-10 bg-zinc-100 dark:bg-zinc-950">
      {size.width > 0 && size.height > 0 && (
        <GlobeGL
          ref={globeRef}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl={
            isDarkMode
              ? "//unpkg.com/three-globe/example/img/earth-night.jpg"
              : "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          }
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl={isDarkMode ? "//unpkg.com/three-globe/example/img/night-sky.png" : null}
          showAtmosphere
          atmosphereColor={isDarkMode ? "#3b82f6" : "#60a5fa"}
          atmosphereAltitude={0.18}
          onGlobeReady={handleGlobeReady}
          htmlElementsData={points}
          htmlLat={(d) => (d as GeoHackathon).location.lat}
          htmlLng={(d) => (d as GeoHackathon).location.lng}
          htmlAltitude={0.01}
          htmlElement={createMarkerEl}
          ringsData={ring}
          ringLat={(d) => (d as GeoHackathon).location.lat}
          ringLng={(d) => (d as GeoHackathon).location.lng}
          ringColor={() => (t: number) => `rgba(59, 130, 246, ${1 - t})`}
          ringMaxRadius={4}
          ringPropagationSpeed={3}
          ringRepeatPeriod={900}
        />
      )}
    </div>
  );
}
