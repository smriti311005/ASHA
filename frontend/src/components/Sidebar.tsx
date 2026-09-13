import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Waves,
  Flame,
  Wind,
  Sliders,
  BellRing,
  Cpu,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type NavTab = 
  | 'dashboard'
  | 'map'
  | 'floods'
  | 'fires'
  | 'pollution'
  | 'sandbox'
  | 'alerts'
  | 'models';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  alertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, alertCount }) => {
  const { theme, toggleTheme } = useTheme();
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Command Center', icon: LayoutDashboard, badge: null },
    { id: 'map' as NavTab, label: 'Interactive India Map', icon: MapPin, badge: 'Live' },
    { id: 'floods' as NavTab, label: 'Sentinel-1 Flood Watch', icon: Waves, badge: null, color: 'text-blue-400' },
    { id: 'fires' as NavTab, label: 'FIRMS Wildfire Tracker', icon: Flame, badge: null, color: 'text-amber-400' },
    { id: 'pollution' as NavTab, label: 'CPCB AQI Forecaster', icon: Wind, badge: null, color: 'text-purple-400' },
    { id: 'sandbox' as NavTab, label: 'AI Model Sandbox', icon: Sliders, badge: 'ML Lab', color: 'text-emerald-400' },
    { id: 'alerts' as NavTab, label: 'Emergency Alerts', icon: BellRing, badge: alertCount > 0 ? `${alertCount}` : null, alert: alertCount > 0, color: 'text-red-400' },
    { id: 'models' as NavTab, label: 'Model Metrics & Docs', icon: Cpu, badge: null }
  ];

  return (
    <aside className="w-64 bg-[#0c1222]/80 backdrop-blur-md border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Operations & Intelligence
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-emerald-400' : item.color ? item.color : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    item.alert
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                      : isActive
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Section with Theme Switcher & NDMA Card */}
      <div className="p-3 border-t border-slate-800/80 space-y-3">
        {/* Quick Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/70 text-xs font-semibold text-slate-300 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
            <span>Theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
            Toggle
          </span>
        </button>

        {/* Status Card */}
        <div className={`p-3 rounded-xl border transition-all ${
          theme === 'light'
            ? 'bg-slate-50 border-slate-200 shadow-xs'
            : 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className={`text-xs font-bold ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
              NDMA Standard Compliance
            </span>
          </div>
          <p className={`text-[11px] leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            Multi-hazard classification adheres to CPCB NAQI, ISRO NDEM, and CWC flood stage protocols.
          </p>
          <div className={`mt-2.5 flex items-center justify-between text-[10px] font-mono ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
            <span>Inference: &lt;12ms</span>
            <span className="text-emerald-500 font-bold">Offline Standalone</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
