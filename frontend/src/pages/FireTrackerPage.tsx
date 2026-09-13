import React, { useState } from 'react';
import {
  Flame,
  Satellite,
  Thermometer,
  Wind,
  Compass,
  Trees,
  ShieldAlert,
  AlertTriangle,
  Activity,
  Layers
} from 'lucide-react';
import { DistrictProfile } from '../types';

interface FireTrackerPageProps {
  districts: DistrictProfile[];
  onSelectDistrict: (district: DistrictProfile) => void;
}

export const FireTrackerPage: React.FC<FireTrackerPageProps> = ({
  districts,
  onSelectDistrict
}) => {
  const fireDistricts = districts.filter(
    (d) => d.dominant_hazard === 'FIRE' || d.hazard_breakdown.fire.risk_score > 25
  );

  const [selectedFireZone, setSelectedFireZone] = useState<DistrictProfile>(
    fireDistricts[0] || districts[0]
  );

  // Collect all active thermal fire hotspots
  const allHotspots = districts.flatMap((d) =>
    d.fire_hotspots.map((h) => ({
      ...h,
      district_name: d.district_name,
      state: d.state,
      fire_risk: d.hazard_breakdown.fire.risk_score
    }))
  );

  const fBreakdown = selectedFireZone.hazard_breakdown.fire;
  const fTelemetry = selectedFireZone.telemetry;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 animate-fire-glow">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                NASA FIRMS &amp; ISRO NDEM FOREST FIRE EARLY WARNING
              </h2>
              <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 font-mono rounded-full border border-amber-500/30">
                VIIRS / MODIS / BHUVAN
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Thermal infrared anomalies correlated with Canadian Fire Weather Index (FWI) and fuel desiccation indices.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-amber-300 bg-amber-950/60 px-3.5 py-1.5 rounded-xl border border-amber-900/50">
            Active Thermal Hotspots: <span className="font-bold text-white">{allHotspots.length}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Hotspot Table & Wildfire Risk Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Active Hotspots & Thermal Radiative Power Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Satellite className="w-4 h-4 text-amber-400" />
                  NASA FIRMS &amp; ISRO Active Hotspot Registry
                </h3>
                <p className="text-xs text-slate-400">
                  Near real-time 375m &amp; 1km pixel thermal radiance detections
                </p>
              </div>
            </div>

            {/* Hotspots Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Location</th>
                    <th className="p-3">Coordinates</th>
                    <th className="p-3">Brightness Temp</th>
                    <th className="p-3">FRP (MW)</th>
                    <th className="p-3">Sensor Source</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {allHotspots.map((h, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-fire-glow" />
                          <span>{h.district_name}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-400">
                        {h.lat.toFixed(3)}°N, {h.lng.toFixed(3)}°E
                      </td>
                      <td className="p-3 font-bold text-amber-400 font-mono">
                        {h.brightness_k} K
                      </td>
                      <td className="p-3 font-bold text-red-400 font-mono">
                        {h.frp_mw} MW
                      </td>
                      <td className="p-3 text-slate-400">
                        <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800 text-[10px]">
                          {h.sensor}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            const d = districts.find((dist) => dist.district_name === h.district_name);
                            if (d) {
                              setSelectedFireZone(d);
                              onSelectDistrict(d);
                            }
                          }}
                          className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Zone Deep Dive Card */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  {selectedFireZone.district_name} Wildfire Danger Analysis
                </h4>
                <p className="text-xs text-slate-400">{selectedFireZone.state}</p>
              </div>

              <span
                className="px-2.5 py-1 text-xs font-bold rounded-full uppercase"
                style={{
                  backgroundColor: `${selectedFireZone.status_color}25`,
                  color: selectedFireZone.status_color
                }}
              >
                {fBreakdown.risk_score}% ({fBreakdown.category})
              </span>
            </div>

            {/* Fire Danger Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-900/30">
                <span className="text-[10px] text-slate-400">Fire Weather Index</span>
                <p className="text-xl font-bold text-amber-400 mt-0.5">
                  {fBreakdown.fire_weather_index_fwi}
                </p>
                <span className="text-[10px] text-slate-500">FWI Proxy (0-50)</span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-900/30">
                <span className="text-[10px] text-slate-400">Spread Velocity</span>
                <p className="text-xl font-bold text-red-400 mt-0.5">
                  {fBreakdown.estimated_spread_velocity_kmh} km/h
                </p>
                <span className="text-[10px] text-slate-500">Wind-Driven Front</span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-900/30">
                <span className="text-[10px] text-slate-400">Dry Spell Duration</span>
                <p className="text-xl font-bold text-white mt-0.5">
                  {fTelemetry.dry_spell_days} Days
                </p>
                <span className="text-[10px] text-slate-500">Zero Rain Period</span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-900/30">
                <span className="text-[10px] text-slate-400">Canopy Dryness (NDVI)</span>
                <p className="text-xl font-bold text-teal-400 mt-0.5">
                  {fTelemetry.ndvi_vegetation}
                </p>
                <span className="text-[10px] text-slate-500">{fBreakdown.fuel_moisture_status}</span>
              </div>
            </div>

            {/* Directive */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/40 to-slate-950 border border-amber-800/40 space-y-2">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Forest Fire Action Directive
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {fBreakdown.recommended_action}
              </p>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Environmental Telemetry & Forest Fire Corridor List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-amber-400" />
              Microclimate Fuel Condition
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Surface Temp
                </div>
                <p className="text-xl font-bold text-white mt-1">{fTelemetry.surface_temp_c} °C</p>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Wind className="w-3.5 h-3.5 text-blue-400" /> Relative Humidity
                </div>
                <p className="text-xl font-bold text-white mt-1">{fTelemetry.relative_humidity_pct} %</p>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Compass className="w-3.5 h-3.5 text-teal-400" /> Wind Velocity
                </div>
                <p className="text-xl font-bold text-white mt-1">{fTelemetry.wind_speed_kmh} km/h</p>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Trees className="w-3.5 h-3.5 text-emerald-400" /> Containment
                </div>
                <p className="text-base font-bold text-amber-400 mt-1">{fBreakdown.containment_difficulty}</p>
              </div>
            </div>
          </div>

          {/* Forest Fire Corridors List */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              High-Risk Forest Corridors ({fireDistricts.length})
            </h4>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {fireDistricts.map((d) => (
                <div
                  key={d.district_id}
                  onClick={() => {
                    setSelectedFireZone(d);
                    onSelectDistrict(d);
                  }}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    selectedFireZone.district_id === d.district_id
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div>
                    <h5 className="text-xs font-bold">{d.district_name}</h5>
                    <p className="text-[10px] text-slate-400">{d.state} • {d.fire_hotspots.length} hotspots</p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400">
                    {d.hazard_breakdown.fire.risk_score}% Danger
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
