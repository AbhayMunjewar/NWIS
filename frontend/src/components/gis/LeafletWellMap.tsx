import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { GisWell, CenterWell } from '../../types/gis';

interface LeafletWellMapProps {
  centerWell: CenterWell | null;
  wells: GisWell[];
  selectedWell: GisWell | null;
  onSelectWell: (well: GisWell) => void;
  radiusKm: number;
  tileUrl?: string;
}

export const LeafletWellMap: React.FC<LeafletWellMapProps> = ({
  centerWell,
  wells,
  selectedWell,
  onSelectWell,
  radiusKm,
  tileUrl = import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = centerWell?.latitude ?? 26.844;
    const initialLon = centerWell?.longitude ?? 95.328;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 11,
      zoomControl: false
    });

    // Standard OpenStreetMap raster tile layer for prototype
    const tileLayer = L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile URL if changed
  useEffect(() => {
    if (tileLayerRef.current && tileUrl) {
      tileLayerRef.current.setUrl(tileUrl);
    }
  }, [tileUrl]);

  // Update Markers & Radius Ring whenever data or selections change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const centerLat = centerWell?.latitude;
    const centerLon = centerWell?.longitude;
    const hasValidCenter = centerLat != null && centerLon != null && !isNaN(centerLat) && !isNaN(centerLon);

    const defaultLat = hasValidCenter ? centerLat : 26.844;
    const defaultLon = hasValidCenter ? centerLon : 95.328;

    // 1. Draw Search Radius Circle centered on current active well
    if (hasValidCenter) {
      L.circle([defaultLat, defaultLon], {
        radius: radiusKm * 1000,
        color: '#2563eb',
        weight: 2,
        dashArray: '6, 6',
        fillColor: '#3b82f6',
        fillOpacity: 0.08
      }).addTo(layerGroup);
    }

    // Bounds collector for auto-framing active well and radius
    const latLons: L.LatLngExpression[] = [];
    if (hasValidCenter) {
      latLons.push([defaultLat, defaultLon]);
    }

    // 2. Plot Well Markers
    wells.forEach((w) => {
      // Exclude wells with missing/invalid coordinates from map plotting
      if (w.latitude == null || w.longitude == null || isNaN(w.latitude) || isNaN(w.longitude)) {
        return;
      }

      const isCenter = centerWell?.well_id === w.well_id || w.is_current_well;
      const isSelected = selectedWell?.well_id === w.well_id;
      const hasEvents = w.historical_events_count > 0;

      latLons.push([w.latitude, w.longitude]);

      // Determine marker classification color according to specification:
      // Current / Active Well: Orange marker
      // Selected GIS Inspection Well: Green marker
      // Nearby Offset Well: Blue marker
      // Historical Hazard Incident Recorded: Red marker
      let bgColor = '#2563eb'; // Blue default for nearby offset
      let borderColor = '#93c5fd';
      let textColor = '#ffffff';
      let symbol = '▲';
      let ringClass = '';

      if (isCenter) {
        bgColor = '#f97316'; // Orange marker for Current / Active Well
        borderColor = '#ffedd5';
        textColor = '#431407';
        symbol = '★';
        ringClass = 'ring-4 ring-orange-500/50 animate-pulse scale-110';
      } else if (isSelected) {
        bgColor = '#10b981'; // Green marker for Selected GIS Inspection Well
        borderColor = '#d1fae5';
        textColor = '#064e3b';
        symbol = '●';
        ringClass = 'ring-4 ring-emerald-500/60 scale-125';
      } else if (hasEvents) {
        bgColor = '#dc2626'; // Red marker for Historical Hazard Incident
        borderColor = '#fecaca';
        textColor = '#ffffff';
        symbol = '!';
      }

      const iconHtml = `
        <div class="relative group" title="${w.well_name}">
          <div style="background-color: ${bgColor}; border-color: ${borderColor}; color: ${textColor};"
               class="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-bold shadow-lg cursor-pointer transition-transform hover:scale-115 ${ringClass}">
            ${symbol}
          </div>
          ${hasEvents && !isCenter && !isSelected ? `
            <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border border-slate-900 rounded-full flex items-center justify-center text-[8px] text-slate-950 font-bold">!</span>
          ` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-gis-well-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([w.latitude, w.longitude], { icon: customIcon }).addTo(layerGroup);

      // Tooltip popup content
      const popupHtml = `
        <div style="font-family: monospace; font-size: 11px; color: #f1f5f9; background: #0f172a; padding: 10px 12px; border-radius: 8px; border: 1px solid #334155; min-width: 190px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);">
          <div style="font-weight: bold; color: ${isCenter ? '#fb923c' : isSelected ? '#34d399' : '#60a5fa'}; font-size: 12px;">
            ${w.well_name} ${isCenter ? '(Active Center Well)' : ''}
          </div>
          <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">
            Region: <strong>${w.field}</strong> • ${w.distance_km === 0 ? 'Active Rig Location' : `${w.distance_km} km distance`}
          </div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #1e293b; line-height: 1.5;">
            <div>Target Depth: <strong>${w.target_depth_m ? `${w.target_depth_m}m` : 'N/A'}</strong></div>
            <div>Status: <span style="color: #34d399; font-weight: bold;">${w.status}</span></div>
            <div>Coordinates: <span style="color: #cbd5e1;">${w.latitude.toFixed(3)}°N, ${w.longitude.toFixed(3)}°E</span></div>
            ${w.historical_events_count > 0 ? `<div style="color: #f87171; font-weight: bold; margin-top: 2px;">⚠️ ${w.historical_events_count} Incident(s) Recorded</div>` : ''}
          </div>
          <div style="margin-top: 8px; color: #3b82f6; font-size: 10px; font-weight: bold; text-decoration: underline; cursor: pointer;">
            Click marker to inspect spatial details
          </div>
        </div>
      `;

      marker.bindTooltip(popupHtml, { direction: 'top', offset: [0, -12], opacity: 0.95 });

      marker.on('click', () => {
        onSelectWell(w);
      });
    });

    // 3. Viewport Smooth Flying & Framing
    if (hasValidCenter) {
      if (latLons.length > 1 && radiusKm >= 100) {
        // When viewing 100km+ radius, frame all active & offset well locations across Assam
        const allBounds = L.latLngBounds(latLons);
        map.flyToBounds(allBounds, { padding: [40, 40], maxZoom: 11, duration: 1.2 });
      } else {
        // Frame selected radius circle around active well
        const latDelta = radiusKm / 111.0;
        const lonDelta = radiusKm / (111.0 * Math.cos((defaultLat * Math.PI) / 180));
        const radiusBounds = L.latLngBounds(
          [defaultLat - latDelta, defaultLon - lonDelta],
          [defaultLat + latDelta, defaultLon + lonDelta]
        );
        map.flyToBounds(radiusBounds, { padding: [30, 30], maxZoom: 13, duration: 1.2 });
      }
    } else if (latLons.length > 0) {
      const bounds = L.latLngBounds(latLons);
      map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 11, duration: 1.2 });
    } else {
      map.setView([26.844, 95.328], 10);
    }
  }, [wells, selectedWell, centerWell, radiusKm]);

  return (
    <div className="relative w-full h-[540px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-[#070D18]">
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Active Region Geographic Location Overlay Banner */}
      {centerWell && centerWell.latitude != null && (
        <div className="absolute top-4 left-4 z-10 bg-slate-950/90 border border-slate-800/90 backdrop-blur-md rounded-lg px-3.5 py-2 text-xs font-mono shadow-2xl flex items-center gap-2.5">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
          </div>
          <div>
            <div className="text-slate-100 font-bold flex items-center gap-2">
              <span>📍 {centerWell.well_name} Area</span>
              <span className="text-[10px] text-orange-400 bg-orange-950/80 border border-orange-800/60 px-1.5 py-0.5 rounded font-bold">
                {centerWell.field}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Coordinates: <strong className="text-slate-200">{centerWell.latitude.toFixed(4)}°N, {centerWell.longitude.toFixed(4)}°E</strong> (Upper Assam)
            </div>
          </div>
        </div>
      )}

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-950/92 border border-slate-800/90 backdrop-blur-md rounded-lg p-3 text-[11px] font-mono text-slate-300 space-y-1.5 shadow-xl max-w-xs">
        <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between">
          <span>GIS Spatial Map Legend</span>
          <span className="text-[10px] text-blue-400 font-bold">{wells.length} Wells</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-orange-500 border border-orange-200 inline-flex items-center justify-center text-[9px] text-orange-950 font-bold shrink-0">★</span>
          <span>Current / Active Well (Orange)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-200 inline-flex items-center justify-center text-[9px] text-emerald-950 font-bold shrink-0">●</span>
          <span>Selected GIS Inspection Well (Green)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-blue-600 border border-blue-300 inline-flex items-center justify-center text-[9px] text-white font-bold shrink-0">▲</span>
          <span>Nearby Offset Well (Blue)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-rose-600 border border-rose-300 inline-flex items-center justify-center text-[9px] text-white font-bold shrink-0">!</span>
          <span>Historical Hazard Incident (Red)</span>
        </div>
        <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800 flex items-center justify-between">
          <span>Radius: <strong className="text-blue-300">{radiusKm} km</strong></span>
          <span>Basemap: <strong className="text-slate-400">OpenStreetMap</strong></span>
        </div>
      </div>
    </div>
  );
};
