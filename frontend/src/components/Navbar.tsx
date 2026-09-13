import React, { useState, useEffect } from 'react';
import { ShieldAlert, Radio, Activity, Bell, Satellite, Zap, Sun, Moon } from 'lucide-react';
import { DashboardSummary } from '../types';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  summary?: DashboardSummary | null;
  onOpenAlerts: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ summary, onOpenAlerts }) => {
  const { theme, toggleTheme } = useTheme();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const criticalCount = summary?.national_summary.critical_districts ?? 3;
  const activeFires = summary?.national_summary.active_fire_hotspots ?? 8;
  const floodedArea = summary?.national_summary.total_flooded_area_km2 ?? 244.7;

  return (
    <header className="h-16 bg-[#0c1222]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Brand & Platform Tag */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-500/30 text-emerald-400">
          <ShieldAlert className="w-5 h-5 text-emerald-400" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              ASHA <span className="text-emerald-400 font-extrabold">AI</span>
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full tracking-wider">
              AUTONOMOUS SENTINEL
            </span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            Autonomous Multi-Hazard Command Grid • India
          </p>
        </div>
      </div>

      {/* Center Live Telemetry Strip */}
      <div className="hidden xl:flex items-center gap-6 text-xs bg-slate-900/60 border border-slate-800/80 px-4 py-1.5 rounded-full">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-radar-pulse" />
          <span className="text-slate-400 font-medium">Critical Zones:</span>
          <span className="font-bold text-red-400">{criticalCount}</span>
        </div>
        <div className="w-px h-3 bg-slate-800" />
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-slate-400 font-medium">FIRMS Fire Hotspots:</span>
          <span className="font-bold text-amber-400">{activeFires}</span>
        </div>
        <div className="w-px h-3 bg-slate-800" />
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-slate-400 font-medium">Flooded Surface:</span>
          <span className="font-bold text-blue-400">{floodedArea} km²</span>
        </div>
      </div>

      {/* Right Actions & Clock */}
      <div className="flex items-center gap-3">
        {/* Satellite Sync Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-300">
          <Satellite className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-[11px] font-mono text-teal-400/90">SENTINEL-1 & FIRMS LIVE</span>
        </div>

        {/* Live IST Clock */}
        <div className="hidden sm:block px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
          {time || '02:30:00 IST'}
        </div>

        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer group"
          id="theme-toggle-btn"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
              <span className="text-slate-200">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-500 group-hover:-rotate-12 transition-transform duration-300" />
              <span className="text-slate-800">Dark</span>
            </>
          )}
        </button>

        {/* Alert Bulletin Siren Button */}
        <button
          onClick={onOpenAlerts}
          className="relative flex items-center gap-2 px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 text-xs font-semibold rounded-lg transition-all shadow-sm group cursor-pointer"
        >
          <Bell className="w-4 h-4 text-red-400 group-hover:animate-bounce" />
          <span className="hidden sm:inline">Active Alerts</span>
          <span className="px-1.5 py-0.2 bg-red-500 text-white text-[10px] font-bold rounded-full">
            {summary?.recent_alerts.length ?? 3}
          </span>
        </button>
      </div>
    </header>
  );
};
