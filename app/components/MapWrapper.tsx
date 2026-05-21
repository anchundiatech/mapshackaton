"use client";

import dynamic from "next/dynamic";
import { Hackathon } from "../data/hackathons";

const LazyMap = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 font-medium">
      <div className="flex items-center gap-3">
        <svg
          className="animate-spin h-5 w-5 text-zinc-600 dark:text-zinc-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span className="text-sm">Inicializando mapa interactivo...</span>
      </div>
    </div>
  ),
});

interface MapWrapperProps {
  hackathons: Hackathon[];
  selectedHackathon: Hackathon | null;
  onSelectHackathon: (hackathon: Hackathon) => void;
  isDarkMode: boolean;
}

export default function MapWrapper(props: MapWrapperProps) {
  return <LazyMap {...props} />;
}
