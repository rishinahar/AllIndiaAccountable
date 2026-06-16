"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the Leaflet map to disable SSR
// Leaflet requires the window object which isn't available during server render
const MapWithNoSSR = dynamic(() => import("@/components/map/MapClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted/20">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading map...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] -mx-4 -mt-2 animate-in fade-in duration-500 relative">
      {/* Floating Header Over Map */}
      <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
        <div className="flex-1 bg-background/90 backdrop-blur-md rounded-full px-4 py-3 shadow-lg border border-border/50 text-sm font-medium flex items-center justify-between">
          <span>Civic Issues Map</span>
          <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs">Pune, MH</span>
        </div>
      </div>

      {/* The Map */}
      <div className="flex-1 relative bg-muted z-0">
        <MapWithNoSSR />
      </div>
    </div>
  );
}
