"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Calendar,
  MapPin,
  Trophy,
  ExternalLink,
  Moon,
  Sun,
  X,
  Compass,
  Laptop,
} from "lucide-react";
import { Hackathon } from "../lib/types";
import MapWrapper from "./MapWrapper";

interface HackathonExplorerProps {
  initialHackathons: Hackathon[];
  fetchedAt: string;
}

export default function HackathonExplorer({ initialHackathons, fetchedAt }: HackathonExplorerProps) {
  const [hackathons] = useState<Hackathon[]>(initialHackathons);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "upcoming">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "map" | "list">("split"); // Responsive views

  // 1. Dark Mode setup
  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // 2. Extract all unique categories
  const categories = useMemo(() => {
    const allCats = new Set<string>();
    hackathons.forEach((h) => h.categories.forEach((c) => allCats.add(c)));
    return Array.from(allCats).sort();
  }, [hackathons]);

  // 3. Filter Hackathons
  const filteredHackathons = useMemo(() => {
    return hackathons.filter((hackathon) => {
      const matchesSearch =
        hackathon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hackathon.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hackathon.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hackathon.location.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hackathon.organizer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" || hackathon.status === selectedStatus;

      const matchesCategory =
        selectedCategory === "all" || hackathon.categories.includes(selectedCategory);

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [hackathons, searchQuery, selectedStatus, selectedCategory]);

  // Only hackathons we could actually place on the map (geocoding may fail
  // for some in-person venues, or still be warming up in the cache).
  const mappableHackathons = useMemo(
    () => filteredHackathons.filter((h) => h.location.lat !== null && h.location.lng !== null),
    [filteredHackathons]
  );

  // Statistics
  const stats = useMemo(() => {
    const activeCount = hackathons.filter((h) => h.status === "active").length;
    const upcomingCount = hackathons.filter((h) => h.status === "upcoming").length;
    return { active: activeCount, upcoming: upcomingCount, total: hackathons.length };
  }, [hackathons]);

  const handleSelectHackathon = (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon);
    // On mobile/tablet, if we are in list view, switch to map to focus
    if (window.innerWidth < 1024) {
      setViewMode("map");
    }
  };

  // Format date range nicely
  const formatDate = (startStr: string, endStr: string) => {
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    const start = new Date(startStr);
    const end = new Date(endStr);

    // Using 'es-ES' or fallback for date formatting
    const formatter = new Intl.DateTimeFormat("es-ES", options);
    return `${formatter.format(start)} - ${formatter.format(end)}`;
  };

  const lastUpdatedLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "short" }).format(
        new Date(fetchedAt)
      );
    } catch {
      return null;
    }
  }, [fetchedAt]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 transition-colors duration-300">

      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-md flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">HackaMap</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              Hackathones reales desde Devpost{lastUpdatedLabel ? ` · actualizado ${lastUpdatedLabel}` : ""}
            </p>
          </div>
        </div>

        {/* Statistics Pill */}
        <div className="hidden md:flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>{stats.active} Activos</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>{stats.upcoming} Futuros</span>
          </div>
          <div className="text-zinc-400 dark:text-zinc-600">
            Total: {stats.total}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile View Toggle */}
          <div className="flex lg:hidden bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded border border-zinc-200 dark:border-zinc-700 mr-2">
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-1 text-xs font-medium rounded ${
                viewMode === "map"
                  ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Mapa
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 text-xs font-medium rounded ${
                viewMode === "list"
                  ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Lista
            </button>
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            title="Cambiar tema"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex flex-1 w-full overflow-hidden relative">

        {/* Left Sidebar (Search, Filters, and List) */}
        <aside
          className={`w-full lg:w-[420px] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full z-10 shrink-0 transition-transform duration-300 absolute lg:static left-0 top-0 bottom-0 ${
            viewMode === "list" || viewMode === "split"
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Sidebar Search and Status Filter */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col gap-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar hackathones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Quick Filter Buttons */}
            <div className="grid grid-cols-3 gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded border border-zinc-200/60 dark:border-zinc-800">
              <button
                onClick={() => setSelectedStatus("all")}
                className={`py-1.5 text-xs font-semibold rounded text-center transition-all ${
                  selectedStatus === "all"
                    ? "bg-white dark:bg-zinc-850 shadow-sm text-zinc-900 dark:text-black"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedStatus("active")}
                className={`py-1.5 text-xs font-semibold rounded text-center transition-all flex items-center justify-center gap-1 ${
                  selectedStatus === "active"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-emerald-600"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${selectedStatus === "active" ? "bg-white" : "bg-emerald-500"}`}></span>
                Activos
              </button>
              <button
                onClick={() => setSelectedStatus("upcoming")}
                className={`py-1.5 text-xs font-semibold rounded text-center transition-all flex items-center justify-center gap-1 ${
                  selectedStatus === "upcoming"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-blue-600"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${selectedStatus === "upcoming" ? "bg-white" : "bg-blue-600"}`}></span>
                Futuros
              </button>
            </div>

            {/* Category horizontal pill container */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar scrollbar-thin shrink-0">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
                  selectedCategory === "all"
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-350 dark:hover:border-zinc-700"
                }`}
              >
                Todas Categorías
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
                    selectedCategory === cat
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                      : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-350 dark:hover:border-zinc-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* List Scroll Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            <div className="text-xs font-medium text-zinc-400 dark:text-zinc-500 flex items-center justify-between mb-2">
              <span>Resultados encontrados</span>
              <span>{filteredHackathons.length}</span>
            </div>

            {filteredHackathons.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-md">
                <Laptop className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-zinc-500">Ningún hackathon coincide</p>
                <p className="text-xs text-zinc-400 mt-1">Prueba a limpiar los filtros o la búsqueda</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStatus("all");
                    setSelectedCategory("all");
                  }}
                  className="mt-3.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Restaurar Filtros
                </button>
              </div>
            ) : (
              filteredHackathons.map((hackathon) => {
                const isSelected = selectedHackathon?.id === hackathon.id;
                const isActive = hackathon.status === "active";
                return (
                  <div
                    key={hackathon.id}
                    onClick={() => handleSelectHackathon(hackathon)}
                    className={`p-4 rounded-md border text-left cursor-pointer transition-all duration-200 relative overflow-hidden ${
                      isSelected
                        ? "bg-zinc-55 dark:bg-zinc-850 border-blue-600 ring-1 ring-blue-600 shadow-sm"
                        : "bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    {/* Status side strip - Solid color indicator */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 ${
                        isActive ? "bg-emerald-500" : "bg-blue-600"
                      }`}
                    />

                    <div className="pl-1">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          {hackathon.organizer}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50"
                              : "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50"
                          }`}
                        >
                          {isActive ? "Activo" : "Futuro"}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm leading-tight text-zinc-900 dark:text-zinc-50 mb-1">
                        {hackathon.name}
                      </h3>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3">
                        {hackathon.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[11px] font-medium text-zinc-450 dark:text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 stroke-[2]" />
                          {new Date(hackathon.startDate).toLocaleDateString("es-ES", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          -{" "}
                          {new Date(hackathon.endDate).toLocaleDateString("es-ES", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>

                        <span className="flex items-center gap-1 capitalize">
                          <MapPin className="w-3.5 h-3.5 stroke-[2]" />
                          {hackathon.type === "virtual" ? "Virtual" : hackathon.location.city}
                        </span>
                      </div>

                      {/* Display Category Pills */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {hackathon.categories.map((cat) => (
                          <span
                            key={cat}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Map View (Map Component) */}
        <main
          className={`flex-1 h-full relative ${
            viewMode === "map" || viewMode === "split" ? "block" : "hidden lg:block"
          }`}
        >
          <MapWrapper
            hackathons={mappableHackathons}
            selectedHackathon={selectedHackathon}
            onSelectHackathon={handleSelectHackathon}
            isDarkMode={isDarkMode}
          />

          {/* Floating toggle list on mobile when Map is active */}
          {viewMode === "map" && (
            <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
              <button
                onClick={() => setViewMode("list")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 font-bold text-sm shadow-xl active:scale-95 transition-transform border border-zinc-750 dark:border-zinc-200"
              >
                Ver Lista ({filteredHackathons.length})
              </button>
            </div>
          )}

          {/* Floating Details Overlay Drawer (No Gradients, Solid Colors, Sleek Borders) */}
          {selectedHackathon && (
            <div className="absolute right-4 bottom-4 left-4 sm:left-auto sm:w-[440px] max-h-[90%] sm:max-h-[550px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 z-30 shadow-2xl rounded-lg flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-350">

              {/* Card Banner - Solid Background matching theme */}
              <div className={`px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 text-white ${
                selectedHackathon.status === "active" ? "bg-emerald-600" : "bg-blue-600"
              } flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase bg-white/20 px-2 py-0.5 rounded tracking-wide border border-white/25">
                    {selectedHackathon.type}
                  </span>
                  <span className="text-xs font-medium text-white/90">
                    {selectedHackathon.status === "active" ? "● En Progreso" : "▲ Próximamente"}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedHackathon(null)}
                  className="p-1 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Card Details Contents */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                <div>
                  <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
                    Organizado por {selectedHackathon.organizer}
                  </span>
                  <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 leading-tight">
                    {selectedHackathon.name}
                  </h2>
                </div>

                {/* Date and Location Panel - Solid flat card style */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-md grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[9px] block">
                      Fechas del Evento
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                      <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{formatDate(selectedHackathon.startDate, selectedHackathon.endDate)}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[9px] block">
                      Ubicación
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                      <MapPin className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span className="truncate">
                        {selectedHackathon.type === "virtual"
                          ? "Virtual (Global)"
                          : `${selectedHackathon.location.city}${selectedHackathon.location.country ? `, ${selectedHackathon.location.country}` : ""}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <span className="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[9px] block">
                    Acerca del Hackathon
                  </span>
                  <p className="text-xs text-zinc-655 dark:text-zinc-350 leading-relaxed font-normal">
                    {selectedHackathon.description}
                  </p>
                </div>

                {/* Prizes - Solid display container */}
                <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded">
                      <Trophy className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[9px] block">
                        Premios
                      </span>
                      <span className="text-xs font-extrabold text-zinc-850 dark:text-zinc-100">
                        {selectedHackathon.prizes}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-1">
                  <span className="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[9px] block">
                    Categorías
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedHackathon.categories.map((cat) => (
                      <span
                        key={cat}
                        className="text-xs font-medium px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button Area */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
                <a
                  href={selectedHackathon.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 font-extrabold text-xs tracking-wider uppercase text-white rounded transition-transform active:scale-98 shadow ${
                    selectedHackathon.status === "active"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <span>Visitar Sitio Oficial</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
