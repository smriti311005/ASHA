import React from 'react';
import {
  ShieldAlert,
  Waves,
  Flame,
  Wind,
  AlertTriangle,
  ArrowUpRight,
  Radio,
  Satellite,
  Activity,
  Layers,
  CheckCircle,
  Eye,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { DashboardSummary, DistrictProfile, HazardType } from '../types';
import { EcoGuardMap } from '../components/EcoGuardMap';
import { useTheme } from '../context/ThemeContext';

interface DashboardPageProps {
  summary: DashboardSummary | null;
  districts: DistrictProfile[];
  selectedDistrict: DistrictProfile | null;
  onSelectDistrict: (district: DistrictProfile) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  summary,
  districts,
  selectedDistrict,
  onSelectDistrict,
  onNavigateToTab
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const stats = summary?.national_summary || {
    critical_districts: 3,
    high_risk_districts: 4,
    medium_risk_districts: 5,
    safe_monitored_districts: 4,
    total_monitored: 16,
    total_flooded_area_km2: 244.7,
    active_fire_hotspots: 8,
    average_national_aqi: 148
  };

  const topHotspots = summary?.top_vulnerable_hotspots || districts.slice(0, 5);
  const alerts = summary?.recent_alerts || [];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner Alert / Threat Bar */}
      <div className={`p-4 rounded-2xl border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
        isLight
          ? 'bg-gradient-to-r from-red-50 via-amber-50/60 to-white border-red-200/80 shadow-red-500/5'
          : 'bg-gradient-to-r from-red-950/40 via-amber-950/20 to-slate-900 border-red-500/30'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-500 shrink-0 animate-radar-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400">
                ACTIVE EARLY WARNING ADVISORY
              </span>
              <span className="px-2 py-0.5 text-[10px] bg-red-500/20 text-red-700 dark:text-red-300 font-mono rounded-full border border-red-500/30 font-bold">
                DEFCON-1 LEVEL
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>
              Simultaneous high-risk events detected: Severe flooding in Brahmaputra / Mahanadi basins, Wildfires in Uttarakhand, and Severe Smog in Indo-Gangetic Plain.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateToTab('alerts')}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-600/30 shrink-0 cursor-pointer"
        >
          <span>View All {alerts.length} Active Bulletins</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Top 4 KPI Disaster Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Critical Zones Card */}
        <div className={`p-4 rounded-2xl border relative overflow-hidden group hover:border-red-500/50 transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/70 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Critical Threat Zones
            </span>
            <span className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {stats.critical_districts}
            </span>
            <span className="text-xs text-red-600 dark:text-red-400 font-bold font-mono">Urgent Evacuation</span>
          </div>
          <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500 font-medium' : 'text-slate-400'}`}>
            Across 3 vulnerability sectors
          </p>
          <div className={`w-full h-1.5 rounded-full mt-3 overflow-hidden ${isLight ? 'bg-slate-100 border border-slate-200' : 'bg-slate-800'}`}>
            <div className="bg-red-500 h-full w-[65%]" />
          </div>
        </div>

        {/* Flood Inundation Card */}
        <div className={`p-4 rounded-2xl border relative overflow-hidden group hover:border-blue-500/50 transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/70 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Detected Inundation
            </span>
            <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Waves className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {stats.total_flooded_area_km2}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold font-mono">km² Water</span>
          </div>
          <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500 font-medium' : 'text-slate-400'}`}>
            Sentinel-1 Dual-Pol SAR Verified
          </p>
          <div className={`w-full h-1.5 rounded-full mt-3 overflow-hidden ${isLight ? 'bg-slate-100 border border-slate-200' : 'bg-slate-800'}`}>
            <div className="bg-blue-500 h-full w-[78%]" />
          </div>
        </div>

        {/* Active Forest Fires Card */}
        <div className={`p-4 rounded-2xl border relative overflow-hidden group hover:border-amber-500/50 transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/70 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              NASA FIRMS Fires
            </span>
            <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {stats.active_fire_hotspots}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold font-mono">Thermal Points</span>
          </div>
          <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500 font-medium' : 'text-slate-400'}`}>
            MODIS &amp; VIIRS Active Hotspots
          </p>
          <div className={`w-full h-1.5 rounded-full mt-3 overflow-hidden ${isLight ? 'bg-slate-100 border border-slate-200' : 'bg-slate-800'}`}>
            <div className="bg-amber-500 h-full w-[45%]" />
          </div>
        </div>

        {/* Air Quality Index Card */}
        <div className={`p-4 rounded-2xl border relative overflow-hidden group hover:border-purple-500/50 transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/70 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Avg National AQI
            </span>
            <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Wind className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {stats.average_national_aqi}
            </span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-bold font-mono">Moderate / Poor</span>
          </div>
          <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500 font-medium' : 'text-slate-400'}`}>
            CPCB 6-Criteria NAQI Blend
          </p>
          <div className={`w-full h-1.5 rounded-full mt-3 overflow-hidden ${isLight ? 'bg-slate-100 border border-slate-200' : 'bg-slate-800'}`}>
            <div className="bg-purple-500 h-full w-[58%]" />
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map & Live Satellite Constellation Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live India Map */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-white'}`}>
                Live Disaster Telemetry Map
              </h3>
            </div>
            <button
              onClick={() => onNavigateToTab('map')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Expand Map &amp; Layers</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-[460px] rounded-2xl overflow-hidden shadow-2xl">
            <EcoGuardMap
              districts={districts}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={onSelectDistrict}
              activeFilter="ALL"
            />
          </div>
        </div>

        {/* Right 1 Col: Top Vulnerable Hotspots & Satellite Feeds */}
        <div className="space-y-4">
          {/* Top Vulnerable Hotspots */}
          <div className={`p-4 rounded-2xl border space-y-3 transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/70 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? 'text-slate-800' : 'text-slate-300'
              }`}>
                <TrendingUp className="w-4 h-4 text-red-500" />
                Priority Disaster Hotspots
              </h3>
              <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                Ranked by Composite AI
              </span>
            </div>

            <div className="space-y-2">
              {topHotspots.slice(0, 5).map((d) => (
                <div
                  key={d.district_id}
                  onClick={() => onSelectDistrict(d)}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer group ${
                    isLight
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      : 'bg-slate-950/70 hover:bg-slate-800/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: d.status_color }}
                    />
                    <div>
                      <h4 className={`text-xs font-bold transition-colors ${
                        isLight ? 'text-slate-800 group-hover:text-emerald-600' : 'text-slate-200 group-hover:text-emerald-400'
                      }`}>
                        {d.district_name}
                      </h4>
                      <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {d.state} • {d.dominant_hazard}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase"
                      style={{
                        backgroundColor: `${d.status_color}20`,
                        color: d.status_color
                      }}
                    >
                      {d.overall_risk_score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-Time Satellite Constellation Tracker */}
          <div className={`p-4 rounded-2xl border space-y-3 transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/70 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? 'text-slate-800' : 'text-slate-300'
              }`}>
                <Satellite className="w-4 h-4 text-teal-500" />
                Active Satellite Passes
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-2 text-xs">
              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div>
                  <p className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    Sentinel-1A (C-SAR)
                  </p>
                  <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Assam / Brahmaputra Overpass
                  </p>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                  Pass: -42 min
                </span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div>
                  <p className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    NASA FIRMS (VIIRS/SNPP)
                  </p>
                  <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Uttarakhand Thermal Scan
                  </p>
                </div>
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                  Pass: -18 min
                </span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div>
                  <p className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    CPCB CAAQMS Network
                  </p>
                  <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Indo-Gangetic Air Stations
                  </p>
                </div>
                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30 font-bold">
                  Stream: Real-time
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
