import React, { useState, useEffect } from 'react';
import {
  Waves,
  Satellite,
  Gauge,
  CloudRain,
  Sliders,
  ShieldAlert,
  ArrowUpRight,
  Eye,
  Activity,
  Layers
} from 'lucide-react';
import { DistrictProfile } from '../types';
import { api } from '../services/api';

interface FloodWatchPageProps {
  districts: DistrictProfile[];
  onSelectDistrict: (district: DistrictProfile) => void;
}

export const FloodWatchPage: React.FC<FloodWatchPageProps> = ({
  districts,
  onSelectDistrict
}) => {
  const floodDistricts = districts.filter(
    (d) => d.dominant_hazard === 'FLOOD' || d.hazard_breakdown.flood.risk_score > 30
  );

  const [selectedZone, setSelectedZone] = useState<DistrictProfile>(
    floodDistricts[0] || districts[0]
  );
  const [sarChip, setSarChip] = useState<any>(null);
  const [sarThreshold, setSarThreshold] = useState<number>(-22); // dB threshold for water
  const [viewMode, setViewMode] = useState<'mask' | 'raw_sar'>('mask');

  useEffect(() => {
    if (selectedZone) {
      api.getSARChip(selectedZone.district_id)
        .then((chip) => setSarChip(chip))
        .catch((err) => console.error(err));
    }
  }, [selectedZone]);

  const fTelemetry = selectedZone.telemetry;
  const fBreakdown = selectedZone.hazard_breakdown.flood;
  const riverRatio = Math.round((fTelemetry.river_gauge_m / Math.max(1, fTelemetry.river_danger_mark_m)) * 100);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-950 border border-blue-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <Waves className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                SENTINEL-1 SAR FLOOD DETECTION &amp; INUNDATION ENGINE
              </h2>
              <span className="px-2 py-0.5 text-[10px] bg-blue-500/20 text-blue-300 font-mono rounded-full border border-blue-500/30">
                C-BAND RADAR (10m GRD)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Synthetic Aperture Radar penetrates heavy monsoon cloud cover to segment surface water specular backscatter.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-blue-300 bg-blue-950/60 px-3.5 py-1.5 rounded-xl border border-blue-900/50">
          <Satellite className="w-4 h-4 text-blue-400" />
          <span>Active Orbit: Sentinel-1A / 1B Dual-Pol (VV+VH)</span>
        </div>
      </div>

      {/* Main Grid: SAR Chip Viewer & River Gauge Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Sentinel-1 SAR Radar Chip & Water Mask Extraction */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Satellite className="w-4 h-4 text-blue-400" />
                  {selectedZone.district_name} SAR Footprint
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedZone.state} • Elevation: {selectedZone.telemetry.rainfall_24h_mm}mm 24h Rain
                </p>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setViewMode('mask')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    viewMode === 'mask'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Water Mask (AI)
                </button>
                <button
                  onClick={() => setViewMode('raw_sar')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    viewMode === 'raw_sar'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Raw SAR dB
                </button>
              </div>
            </div>

            {/* Inundation Metrics Banner */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-blue-900/30">
                <p className="text-[11px] text-slate-400">Flood Inundation Area</p>
                <p className="text-xl font-extrabold text-blue-400 mt-0.5">
                  {fBreakdown.estimated_flooded_km2} km²
                </p>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-blue-900/30">
                <p className="text-[11px] text-slate-400">Surface Expansion</p>
                <p className="text-xl font-extrabold text-teal-400 mt-0.5">
                  +{selectedZone.sar_satellite?.water_body_expansion_pct ?? 78}%
                </p>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-blue-900/30">
                <p className="text-[11px] text-slate-400">AI Risk Rating</p>
                <p className="text-xl font-extrabold text-red-400 mt-0.5">
                  {fBreakdown.risk_score}% ({fBreakdown.category})
                </p>
              </div>
            </div>

            {/* Interactive SAR Matrix Chip (16x16 pixels) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>
                  {viewMode === 'mask' ? 'SegFormer Flood Segmentation Mask' : 'VV Polarization Backscatter (dB)'}
                </span>
                <span className="font-mono text-[11px] text-blue-400">
                  {sarChip?.polarization} • Resolution: {sarChip?.spatial_resolution}
                </span>
              </div>

              <div className="p-3 bg-black/90 rounded-2xl border border-slate-800 aspect-square max-h-[360px] flex items-center justify-center">
                {sarChip ? (
                  <div className="grid grid-cols-16 gap-1 w-full h-full">
                    {sarChip.segmentation_mask.flatMap((row: number[], rIdx: number) =>
                      row.map((val: number, cIdx: number) => {
                        const dB = sarChip.sar_vv_matrix[rIdx][cIdx];
                        const isWater = viewMode === 'mask' ? val === 1 : dB <= sarThreshold;
                        return (
                          <div
                            key={`${rIdx}-${cIdx}`}
                            className={`rounded-[2px] transition-all duration-300 relative group cursor-pointer ${
                              isWater
                                ? 'bg-blue-500 shadow-md shadow-blue-500/60 scale-105'
                                : 'bg-slate-800/80 hover:bg-slate-700'
                            }`}
                          >
                            <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-30 bg-slate-900 text-slate-100 text-[9px] px-1.5 py-0.5 rounded border border-slate-700 font-mono whitespace-nowrap">
                              {dB} dB ({isWater ? 'Inundated' : 'Dry'})
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  <div className="text-slate-500 text-xs">Loading SAR radar chip...</div>
                )}
              </div>
            </div>

            {/* Threshold Slider */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>SAR Backscatter Water Threshold:</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="-28"
                  max="-16"
                  step="1"
                  value={sarThreshold}
                  onChange={(e) => setSarThreshold(Number(e.target.value))}
                  className="w-28 accent-blue-500"
                />
                <span className="font-mono font-bold text-blue-400">{sarThreshold} dB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: River Gauge & Hydrological Telemetry */}
        <div className="lg:col-span-5 space-y-4">
          {/* Hydrological Telemetry Card */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Gauge className="w-4 h-4 text-blue-400" />
              River Basin Hydro-Telemetry
            </h3>

            {/* Gauge vs Danger Mark */}
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-[11px] text-slate-400">Current Water Gauge Level</span>
                  <p className="text-2xl font-extrabold text-white mt-0.5">
                    {fTelemetry.river_gauge_m} m
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400">Official Danger Mark</span>
                  <p className="text-2xl font-bold text-red-400 mt-0.5">
                    {fTelemetry.river_danger_mark_m} m
                  </p>
                </div>
              </div>

              {/* Overtopping Progress Bar */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Gauge Stage Ratio</span>
                  <span className={`font-bold ${riverRatio > 100 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {riverRatio}% {riverRatio > 100 ? 'OVER DANGER LEVEL' : 'Within Bounds'}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      riverRatio > 100 ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(100, riverRatio)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Precipitation & Soil Moisture */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <CloudRain className="w-3.5 h-3.5 text-blue-400" /> 72h Cumulative
                </div>
                <p className="text-lg font-bold text-white mt-1">
                  {fTelemetry.rainfall_72h_mm} mm
                </p>
                <span className="text-[10px] text-blue-400">NASA GPM IMERG</span>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Activity className="w-3.5 h-3.5 text-teal-400" /> Soil Saturation
                </div>
                <p className="text-lg font-bold text-white mt-1">
                  {fTelemetry.soil_saturation_pct}%
                </p>
                <span className="text-[10px] text-teal-400">Drainage saturated</span>
              </div>
            </div>

            {/* Early Warning Recommendation */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-950/50 to-slate-950 border border-blue-800/40 space-y-2">
              <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-400" /> Actionable Directive
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {fBreakdown.recommended_action}
              </p>
            </div>
          </div>

          {/* Flood-Prone Districts Selector List */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              All Monitored Flood Basins ({floodDistricts.length})
            </h4>

            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {floodDistricts.map((d) => (
                <div
                  key={d.district_id}
                  onClick={() => {
                    setSelectedZone(d);
                    onSelectDistrict(d);
                  }}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    selectedZone.district_id === d.district_id
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div>
                    <h5 className="text-xs font-bold">{d.district_name}</h5>
                    <p className="text-[10px] text-slate-400">{d.state}</p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-400">
                    {d.hazard_breakdown.flood.risk_score}% Risk
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
