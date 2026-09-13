import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DistrictProfile, HazardType } from '../types';
import { Waves, Flame, Wind, AlertTriangle, Eye, Shield } from 'lucide-react';

interface LeafletMapProps {
  districts: DistrictProfile[];
  selectedDistrict: DistrictProfile | null;
  onSelectDistrict: (district: DistrictProfile) => void;
  activeFilter?: 'ALL' | HazardType;
}

// Helper component to center map when selected district changes
const MapController: React.FC<{ selectedDistrict: DistrictProfile | null }> = ({ selectedDistrict }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedDistrict) {
      map.flyTo([selectedDistrict.lat, selectedDistrict.lng], 8, { duration: 1.5 });
    }
  }, [selectedDistrict, map]);
  return null;
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  districts,
  selectedDistrict,
  onSelectDistrict,
  activeFilter = 'ALL'
}) => {
  const [mapType, setMapType] = useState<'dark' | 'satellite'>('dark');

  const filteredDistricts = districts.filter((d) => {
    if (activeFilter === 'ALL') return true;
    return d.dominant_hazard === activeFilter;
  });

  const getMarkerColor = (d: DistrictProfile) => {
    if (d.overall_category === 'CRITICAL') return '#ef4444';
    if (d.overall_category === 'HIGH') return '#f97316';
    if (d.overall_category === 'MEDIUM') return '#eab308';
    return '#10b981';
  };

  const getHazardIcon = (hazard: HazardType) => {
    switch (hazard) {
      case 'FLOOD': return <Waves className="w-3.5 h-3.5 text-blue-400 inline mr-1" />;
      case 'FIRE': return <Flame className="w-3.5 h-3.5 text-amber-400 inline mr-1" />;
      case 'POLLUTION': return <Wind className="w-3.5 h-3.5 text-purple-400 inline mr-1" />;
    }
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 bg-[#090d16]">
      {/* Map Control Bar Overlay */}
      <div className="absolute top-4 right-4 z-[400] flex items-center gap-2 bg-[#0c1222]/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-lg text-xs">
        <button
          onClick={() => setMapType('dark')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            mapType === 'dark'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Dark Carto
        </button>
        <button
          onClick={() => setMapType('satellite')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            mapType === 'satellite'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Esri Satellite
        </button>
      </div>

      {/* Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-[#0c1222]/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-xl text-xs space-y-2 pointer-events-auto">
        <div className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          Hazard Severity Index
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
            <span className="text-slate-300">Critical (&gt;75%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-slate-300">High (55-75%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="text-slate-300">Medium (30-55%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Safe / Low (&lt;30%)</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={[22.5937, 78.9629]}
        zoom={5}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ minHeight: '100%', height: '100%' }}
      >
        <MapController selectedDistrict={selectedDistrict} />

        {mapType === 'dark' ? (
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        {filteredDistricts.map((district) => {
          const isSelected = selectedDistrict?.district_id === district.district_id;
          const color = getMarkerColor(district);
          const isCritical = district.overall_category === 'CRITICAL';

          return (
            <React.Fragment key={district.district_id}>
              {/* Outer pulsing circle for critical disaster zones */}
              {isCritical && (
                <CircleMarker
                  center={[district.lat, district.lng]}
                  radius={24}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.15,
                    weight: 1,
                    dashArray: '4, 4'
                  }}
                />
              )}

              <CircleMarker
                center={[district.lat, district.lng]}
                radius={isSelected ? 16 : isCritical ? 14 : 11}
                pathOptions={{
                  color: isSelected ? '#ffffff' : color,
                  fillColor: color,
                  fillOpacity: isSelected ? 0.95 : 0.8,
                  weight: isSelected ? 3 : 2
                }}
                eventHandlers={{
                  click: () => onSelectDistrict(district)
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                  <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                    {getHazardIcon(district.dominant_hazard)}
                    <span>{district.district_name}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{ backgroundColor: `${color}30`, color: color }}
                    >
                      {district.overall_risk_score}%
                    </span>
                  </div>
                </Tooltip>

                <Popup>
                  <div className="p-1 space-y-2 min-w-[220px]">
                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
                      <div>
                        <h4 className="font-bold text-sm text-white">{district.district_name}</h4>
                        <p className="text-[11px] text-slate-400">{district.state}</p>
                      </div>
                      <span
                        className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase"
                        style={{ backgroundColor: `${color}30`, color: color }}
                      >
                        {district.overall_category}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-center text-[10px] py-1 bg-slate-900/60 rounded-lg border border-slate-800">
                      <div>
                        <p className="text-slate-400">Flood</p>
                        <p className="font-bold text-blue-400">
                          {district.hazard_breakdown.flood.risk_score}%
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Fire</p>
                        <p className="font-bold text-amber-400">
                          {district.hazard_breakdown.fire.risk_score}%
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">AQI</p>
                        <p className="font-bold text-purple-400">
                          {district.hazard_breakdown.pollution.aqi}
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
                      {district.primary_action}
                    </p>

                    <button
                      onClick={() => onSelectDistrict(district)}
                      className="w-full mt-2 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Full AI Telemetry
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
