import React, { useEffect, useState } from 'react';
import {
  X,
  Waves,
  Flame,
  Wind,
  ShieldAlert,
  Satellite,
  Gauge,
  Thermometer,
  CloudRain,
  Compass,
  Trees,
  Activity,
  Send,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { DistrictProfile, DistrictDetailsResponse } from '../types';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
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

interface DistrictDrawerProps {
  district: DistrictProfile | null;
  onClose: () => void;
  onDispatchAlert: (alertId: string, location: string) => void;
}

export const DistrictDrawer: React.FC<DistrictDrawerProps> = ({
  district,
  onClose,
  onDispatchAlert
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [details, setDetails] = useState<DistrictDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  useEffect(() => {
    if (district) {
      setLoading(true);
      setDispatchStatus(null);
      api.getDistrictDetails(district.district_id)
        .then((res) => setDetails(res))
        .catch((err) => console.error('Error fetching district details:', err))
        .finally(() => setLoading(false));
    } else {
      setDetails(null);
    }
  }, [district]);

  if (!district) return null;

  const flood = district.hazard_breakdown.flood;
  const fire = district.hazard_breakdown.fire;
  const pollution = district.hazard_breakdown.pollution;
  const telemetry = district.telemetry;

  const aqiChartData = details?.aqi_forecast ? [
    { time: 'Now', aqi: details.aqi_forecast.current.aqi, pm25: telemetry.pm25 },
    { time: '+6 Hours', aqi: details.aqi_forecast.forecast_6h.predicted_aqi, pm25: details.aqi_forecast.forecast_6h.predicted_pm25 },
    { time: '+12 Hours', aqi: details.aqi_forecast.forecast_12h.predicted_aqi, pm25: details.aqi_forecast.forecast_12h.predicted_pm25 },
    { time: '+24 Hours', aqi: details.aqi_forecast.forecast_24h.predicted_aqi, pm25: details.aqi_forecast.forecast_24h.predicted_pm25 }
  ] : [];

  const hazardComparisonData = [
    { name: 'Flood Risk', score: flood.risk_score, color: '#3b82f6' },
    { name: 'Fire Risk', score: fire.risk_score, color: '#f59e0b' },
    { name: 'Pollution Risk', score: pollution.risk_score, color: '#a855f7' }
  ];

  const handleQuickDispatch = async () => {
    try {
      const res = await api.dispatchAlert(
        `ALT-LIVE-${district.district_id}`,
        'SMS Broadcast (CAP)',
        '+91-9876543210 (SDMA)'
      );
      setDispatchStatus('Dispatched via CAP Gateway');
      onDispatchAlert(`ALT-LIVE-${district.district_id}`, `${district.district_name}, ${district.state}`);
    } catch (e) {
      setDispatchStatus('Failed to dispatch');
    }
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-full sm:w-[480px] lg:w-[540px] backdrop-blur-xl border-l shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 ${
      isLight ? 'bg-white/98 border-slate-200 text-slate-900' : 'bg-[#0c1222]/95 border-slate-800 text-slate-100'
    }`}>
      {/* Header */}
      <div className={`p-4 lg:p-5 border-b flex items-center justify-between ${
        isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-900/50 border-slate-800/80'
      }`}>
        <div className="flex items-center gap-3">
          <div
            className="w-3.5 h-10 rounded-full"
            style={{ backgroundColor: district.status_color }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{district.district_name}</h2>
              <span
                className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase"
                style={{
                  backgroundColor: `${district.status_color}25`,
                  color: district.status_color,
                  border: `1px solid ${district.status_color}50`
                }}
              >
                {district.overall_category} RISK
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-500 font-medium' : 'text-slate-400'}`}>
              {district.state} • Coordinates: {district.lat.toFixed(3)}°N, {district.lng.toFixed(3)}°E
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200'
              : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-5">
        {/* Composite Score Banner */}
        <div className={`p-4 rounded-2xl border relative overflow-hidden transition-all ${
          isLight
            ? 'bg-slate-50 border-slate-200 shadow-sm'
            : 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Overall Multi-Hazard Index
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {district.overall_risk_score}
                </span>
                <span className={`text-sm font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>/ 100</span>
                <span
                  className="ml-2 text-xs font-bold uppercase tracking-wider"
                  style={{ color: district.status_color }}
                >
                  • {district.overall_category}
                </span>
              </div>
            </div>

            <div className={`w-16 h-16 rounded-2xl border flex flex-col items-center justify-center text-center p-1 ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-950/80 border-slate-800'
            }`}>
              <span className="text-[9px] font-bold text-slate-500 uppercase">Dominant</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[58px]">
                {district.dominant_hazard}
              </span>
            </div>
          </div>

          {/* Mini Bar Comparison */}
          <div className="mt-4 space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className={`flex items-center gap-1 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <Waves className="w-3.5 h-3.5 text-blue-500" /> Flood Risk
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{flood.risk_score}% ({flood.category})</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${flood.risk_score}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className={`flex items-center gap-1 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <Flame className="w-3.5 h-3.5 text-amber-500" /> Wildfire Danger
                </span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{fire.risk_score}% ({fire.category})</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${fire.risk_score}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className={`flex items-center gap-1 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <Wind className="w-3.5 h-3.5 text-purple-500" /> Air Quality (NAQI)
                </span>
                <span className="font-bold text-purple-600 dark:text-purple-400">{pollution.aqi} ({pollution.category})</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (pollution.aqi / 500) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: Observed Facts vs AI Predicted Hazard */}
        <div className={`p-4 rounded-2xl border space-y-3 transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
            isLight ? 'text-slate-800' : 'text-slate-300'
          }`}>
            <Satellite className="w-4 h-4 text-teal-500" />
            Observed Sensor &amp; Satellite Verifications
          </div>
          <div className="space-y-2">
            {district.observed_facts.map((fact, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 text-xs p-2.5 rounded-xl border ${
                  isLight
                    ? 'text-slate-700 bg-slate-50 border-slate-200'
                    : 'text-slate-300 bg-slate-950/60 border-slate-800/80'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{fact}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION: Synthetic SAR Radar Scene (If Flood Prone) */}
        {details?.sar_radar_chip && (
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLight ? 'bg-blue-50/70 border-blue-200' : 'bg-blue-950/20 border-blue-900/40'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-300 uppercase tracking-wider">
                <Waves className="w-4 h-4 text-blue-500" />
                Sentinel-1 SAR Flood Inundation Chip
              </div>
              <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                {details.sar_radar_chip.radar_sensor}
              </span>
            </div>

            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              isLight ? 'bg-white border-blue-100 shadow-xs' : 'bg-slate-950/80 border-blue-900/30'
            }`}>
              <div>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Detected Flood Area</p>
                <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                  {details.sar_radar_chip.detected_inundation_km2} km²
                </p>
              </div>
              <div>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Water Pixel Density</p>
                <p className="text-base font-bold text-teal-600 dark:text-teal-400">
                  {details.sar_radar_chip.water_pixel_coverage_pct}%
                </p>
              </div>
              <div>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Polarization</p>
                <p className={`text-base font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {details.sar_radar_chip.polarization}
                </p>
              </div>
            </div>

            {/* Simulated 16x16 SAR Grid View */}
            <div className="space-y-1">
              <div className={`text-[10px] flex justify-between ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                <span>SAR Backscatter &amp; Flood Mask Grid</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">■ Flooded Pixel | ■ Dry Land</span>
              </div>
              <div className={`grid grid-cols-16 gap-0.5 p-2 rounded-lg border ${
                isLight ? 'bg-slate-900 border-slate-700' : 'bg-black/70 border-slate-800'
              }`}>
                {details.sar_radar_chip.segmentation_mask.flatMap((row, rIdx) =>
                  row.map((val, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`h-2.5 rounded-[1px] transition-all ${
                        val === 1 ? 'bg-blue-500 shadow-sm shadow-blue-500/50' : 'bg-slate-800/80'
                      }`}
                      title={val === 1 ? 'Flooded Water Body (SAR Low dB)' : 'Dry Terrain'}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION: NASA FIRMS Active Fire Hotspots (If Fire Prone) */}
        {district.fire_hotspots.length > 0 && (
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-amber-950/20 border-amber-900/40'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-300 uppercase tracking-wider">
                <Flame className="w-4 h-4 text-amber-500" />
                NASA FIRMS / ISRO Thermal Detections ({district.fire_hotspots.length})
              </div>
            </div>

            <div className="space-y-2">
              {district.fire_hotspots.map((h, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                    isLight
                      ? 'bg-white border-amber-200 shadow-xs'
                      : 'bg-slate-950/80 border-amber-900/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <div>
                      <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        {h.lat.toFixed(3)}°N, {h.lng.toFixed(3)}°E
                      </span>
                      <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{h.sensor}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-600 dark:text-amber-400">{h.frp_mw} MW</span>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{h.brightness_k} K</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: 24h AQI Forecasting Trend Chart */}
        {details?.aqi_forecast && (
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLight ? 'bg-purple-50/70 border-purple-200' : 'bg-purple-950/20 border-purple-900/40'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wider">
                <Wind className="w-4 h-4 text-purple-500" />
                24-Hour Predictive AQI Curve
              </div>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                Trend: {details.aqi_forecast.forecast_24h.trend}
              </span>
            </div>

            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={aqiChartData}>
                  <defs>
                    <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke={isLight ? "#475569" : "#64748b"} fontSize={10} tickLine={false} />
                  <YAxis stroke={isLight ? "#475569" : "#64748b"} fontSize={10} tickLine={false} domain={[0, 'dataMax + 50']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isLight ? '#ffffff' : '#0f172a',
                      borderColor: isLight ? '#e2e8f0' : '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: isLight ? '#0f172a' : '#f8fafc'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="aqi"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#aqiGrad)"
                    name="Predicted AQI"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <p className={`text-[11px] leading-relaxed p-2.5 rounded-xl border ${
              isLight ? 'text-purple-950 bg-white border-purple-200' : 'text-purple-200/80 bg-purple-900/20 border-purple-800/40'
            }`}>
              💡 {details.aqi_forecast.recommended_action}
            </p>
          </div>
        )}

        {/* SECTION: Raw Physical Telemetry Grid */}
        <div className={`p-4 rounded-2xl border space-y-3 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isLight ? 'text-slate-800' : 'text-slate-300'
          }`}>
            <Activity className="w-4 h-4 text-emerald-500" />
            Live Physical Sensor Telemetry
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
              <div className="flex items-center gap-1 text-slate-500 text-[10px] font-semibold">
                <CloudRain className="w-3 h-3 text-blue-500" /> 24h Rain
              </div>
              <p className={`font-bold mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{telemetry.rainfall_24h_mm} mm</p>
            </div>

            <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
              <div className="flex items-center gap-1 text-slate-500 text-[10px] font-semibold">
                <Gauge className="w-3 h-3 text-blue-500" /> River Gauge
              </div>
              <p className={`font-bold mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{telemetry.river_gauge_m} m</p>
            </div>

            <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
              <div className="flex items-center gap-1 text-slate-500 text-[10px] font-semibold">
                <Thermometer className="w-3 h-3 text-amber-500" /> Surface Temp
              </div>
              <p className={`font-bold mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{telemetry.surface_temp_c} °C</p>
            </div>

            <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
              <div className="flex items-center gap-1 text-slate-500 text-[10px] font-semibold">
                <Compass className="w-3 h-3 text-teal-500" /> Wind Speed
              </div>
              <p className={`font-bold mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{telemetry.wind_speed_kmh} km/h</p>
            </div>

            <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
              <div className="flex items-center gap-1 text-slate-500 text-[10px] font-semibold">
                <Trees className="w-3 h-3 text-emerald-500" /> Vegetation NDVI
              </div>
              <p className={`font-bold mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{telemetry.ndvi_vegetation}</p>
            </div>

            <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
              <div className="flex items-center gap-1 text-slate-500 text-[10px] font-semibold">
                <Wind className="w-3 h-3 text-purple-500" /> PM2.5 Conc.
              </div>
              <p className={`font-bold mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{telemetry.pm25} µg/m³</p>
            </div>
          </div>
        </div>

        {/* SECTION: Recommended Disaster Action & 1-Click Dispatch */}
        <div className={`p-4 rounded-2xl border space-y-3 ${
          isLight
            ? 'bg-emerald-50/80 border-emerald-200'
            : 'bg-gradient-to-br from-emerald-950/30 to-slate-950 border-emerald-900/40'
        }`}>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-300 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-emerald-500" />
            Early Warning Directive
          </div>
          <p className={`text-xs leading-relaxed font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
            {district.primary_action}
          </p>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              onClick={handleQuickDispatch}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Dispatch Emergency Warning
            </button>
          </div>

          {dispatchStatus && (
            <p className="text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
              ✓ {dispatchStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
