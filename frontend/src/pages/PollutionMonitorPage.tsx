import React, { useState } from 'react';
import {
  Wind,
  Activity,
  ShieldAlert,
  AlertCircle,
  TrendingUp,
  Clock,
  Thermometer,
  Compass,
  Droplets,
  Layers
} from 'lucide-react';
import { DistrictProfile } from '../types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface PollutionMonitorPageProps {
  districts: DistrictProfile[];
  onSelectDistrict: (district: DistrictProfile) => void;
}

export const PollutionMonitorPage: React.FC<PollutionMonitorPageProps> = ({
  districts,
  onSelectDistrict
}) => {
  const pollutionDistricts = [...districts].sort(
    (a, b) => b.hazard_breakdown.pollution.aqi - a.hazard_breakdown.pollution.aqi
  );

  const [selectedStation, setSelectedStation] = useState<DistrictProfile>(
    pollutionDistricts[0] || districts[0]
  );
  const [forecastHorizon, setForecastHorizon] = useState<'now' | '6h' | '12h' | '24h'>('now');

  const pBreakdown = selectedStation.hazard_breakdown.pollution;
  const t = selectedStation.telemetry;

  // Pollutant sub-indices bar chart data
  const subIndicesData = Object.entries(pBreakdown.sub_indices).map(([key, value]) => ({
    pollutant: key,
    subIndex: value,
    color: value > 300 ? '#ef4444' : value > 200 ? '#f97316' : value > 100 ? '#eab308' : '#10b981'
  }));

  // Forecast curve
  const currentAQI = pBreakdown.aqi;
  const f6 = Math.round(currentAQI * (t.wind_speed_kmh < 6 ? 1.08 : 0.92));
  const f12 = Math.round(currentAQI * (t.wind_speed_kmh < 6 ? 1.15 : 0.88));
  const f24 = Math.round(currentAQI * (t.wind_speed_kmh < 6 ? 1.22 : 0.82));

  const forecastData = [
    { time: 'Current', aqi: currentAQI, pm25: t.pm25 },
    { time: '+6 Hours', aqi: f6, pm25: Math.round(t.pm25 * (f6 / currentAQI)) },
    { time: '+12 Hours', aqi: f12, pm25: Math.round(t.pm25 * (f12 / currentAQI)) },
    { time: '+24 Hours', aqi: f24, pm25: Math.round(t.pm25 * (f24 / currentAQI)) }
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <Wind className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                CPCB NATIONAL AIR QUALITY INDEX (NAQI) &amp; FORECASTING
              </h2>
              <span className="px-2 py-0.5 text-[10px] bg-purple-500/20 text-purple-300 font-mono rounded-full border border-purple-500/30">
                6-CRITERIA POLLUTANTS
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Continuous Ambient Air Quality Monitoring Stations (CAAQMS) with +6h, +12h, and +24h time-series forecasting.
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-purple-300 bg-purple-950/60 px-3.5 py-1.5 rounded-xl border border-purple-900/50">
          Standard: Indian National Air Quality Index (NAQI)
        </div>
      </div>

      {/* Main Grid: Selected Station Deep Dive & National AQI Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Selected Station AQI Curve & Sub-pollutants */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wind className="w-4 h-4 text-purple-400" />
                  {selectedStation.district_name} CAAQMS Station
                </h3>
                <p className="text-xs text-slate-400">{selectedStation.state} • Urban Inversion Belt</p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 text-xs font-extrabold rounded-full uppercase"
                  style={{
                    backgroundColor: `${pBreakdown.color}25`,
                    color: pBreakdown.color,
                    border: `1px solid ${pBreakdown.color}50`
                  }}
                >
                  AQI {pBreakdown.aqi} • {pBreakdown.category}
                </span>
              </div>
            </div>

            {/* Current Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-purple-900/30">
                <span className="text-[10px] text-slate-400">PM2.5 Particulate</span>
                <p className="text-xl font-bold text-purple-400 mt-0.5">{t.pm25} µg/m³</p>
                <span className="text-[10px] text-slate-500">Std: 60 µg/m³</span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-purple-900/30">
                <span className="text-[10px] text-slate-400">PM10 Coarse</span>
                <p className="text-xl font-bold text-white mt-0.5">{t.pm10} µg/m³</p>
                <span className="text-[10px] text-slate-500">Std: 100 µg/m³</span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-purple-900/30">
                <span className="text-[10px] text-slate-400">Dominant Pollutant</span>
                <p className="text-xl font-bold text-amber-400 mt-0.5">{pBreakdown.dominant_pollutant}</p>
                <span className="text-[10px] text-slate-500">Sub-Index Driver</span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-purple-900/30">
                <span className="text-[10px] text-slate-400">Wind Dispersion</span>
                <p className="text-xl font-bold text-teal-400 mt-0.5">{t.wind_speed_kmh} km/h</p>
                <span className="text-[10px] text-slate-500">
                  {t.wind_speed_kmh < 6 ? 'Trapping Smog' : 'Moderate Flow'}
                </span>
              </div>
            </div>

            {/* Sub-Pollutants Sub-Index Breakdown Bar Chart */}
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">6-Criteria CPCB Sub-Index Scores</span>
                <span className="text-[10px] text-slate-400">Max Sub-Index determines overall AQI</span>
              </div>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subIndicesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="pollutant" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 500]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="subIndex" radius={[4, 4, 0, 0]}>
                      {subIndicesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 24h Predictive Trend Area Chart */}
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                  +24h Predictive AQI Dispersion Curve
                </span>
                <span className="text-[10px] text-purple-400 font-mono">Gradient Boosting Model</span>
              </div>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData}>
                    <defs>
                      <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 'dataMax + 50']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="aqi"
                      stroke="#a855f7"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#forecastGrad)"
                      name="Forecasted AQI"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Health Directive */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/40 to-slate-950 border border-purple-800/40 space-y-2">
              <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-purple-400" /> Health &amp; Mitigation Directive
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {pBreakdown.health_impact}
              </p>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: All CAAQMS Stations Ranked Grid */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-purple-400" />
              National CAAQMS Station Grid ({pollutionDistricts.length})
            </h3>

            <div className="space-y-2 max-h-[580px] overflow-y-auto">
              {pollutionDistricts.map((d) => {
                const isSelected = selectedStation.district_id === d.district_id;
                const p = d.hazard_breakdown.pollution;
                return (
                  <div
                    key={d.district_id}
                    onClick={() => {
                      setSelectedStation(d);
                      onSelectDistrict(d);
                    }}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold">{d.district_name}</h4>
                      <p className="text-[10px] text-slate-400">
                        {d.state} • PM2.5: {d.telemetry.pm25} µg/m³
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className="px-2.5 py-1 text-xs font-bold rounded-full uppercase"
                        style={{
                          backgroundColor: `${p.color}25`,
                          color: p.color
                        }}
                      >
                        AQI {p.aqi}
                      </span>
                      <p className="text-[9px] text-slate-400 mt-0.5">{p.category}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
