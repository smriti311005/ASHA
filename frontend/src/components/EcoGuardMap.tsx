import React, { useState } from 'react';
import { GoogleMapComponent } from './GoogleMapComponent';
import { LeafletMap } from './LeafletMap';
import { DistrictProfile, HazardType } from '../types';
import { Map, Layers, Key, Check, Satellite, Compass } from 'lucide-react';

interface EcoGuardMapProps {
  districts: DistrictProfile[];
  selectedDistrict: DistrictProfile | null;
  onSelectDistrict: (district: DistrictProfile) => void;
  activeFilter?: 'ALL' | HazardType;
  showHeatmap?: boolean;
}

export const EcoGuardMap: React.FC<EcoGuardMapProps> = ({
  districts,
  selectedDistrict,
  onSelectDistrict,
  activeFilter = 'ALL',
  showHeatmap = false,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(
    localStorage.getItem('ECOGUARD_GMAPS_KEY') || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const hasKey =
    apiKeyInput &&
    apiKeyInput !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE' &&
    apiKeyInput.length > 15;

  const [engine, setEngine] = useState<'google' | 'leaflet'>(hasKey ? 'google' : 'leaflet');
  const [showKeyModal, setShowKeyModal] = useState(false);

  const handleSaveKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem('ECOGUARD_GMAPS_KEY', apiKeyInput.trim());
      setSavedSuccess(true);
      setEngine('google');
      setTimeout(() => {
        setSavedSuccess(false);
        setShowKeyModal(false);
      }, 1200);
    }
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#080d1a]">
      {/* Floating Engine Switcher Toolbar */}
      <div className="absolute top-3.5 left-3.5 z-[500] flex items-center gap-2 bg-slate-950/90 backdrop-blur-xl px-2.5 py-1.5 rounded-2xl border border-slate-700/80 shadow-2xl">
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase pl-1.5 pr-0.5 flex items-center gap-1">
          <Compass className="w-3 h-3 text-emerald-400" />
          Map Engine
        </span>

        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setEngine('google')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all text-xs cursor-pointer ${
              engine === 'google'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40 border border-blue-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Map className="w-3.5 h-3.5 text-blue-300" />
            Google Maps API
            {hasKey ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <span className="px-1 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] rounded font-mono">
                Key Req.
              </span>
            )}
          </button>

          <button
            onClick={() => setEngine('leaflet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all text-xs cursor-pointer ${
              engine === 'leaflet'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/40 border border-emerald-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-300" />
            Tactical Radar
          </button>
        </div>

        {/* API Key settings trigger */}
        <button
          onClick={() => setShowKeyModal(true)}
          title="Configure Google Maps API Key"
          className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 transition-all cursor-pointer"
        >
          <Key className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* API Key Modal / Drawer */}
      {showKeyModal && (
        <div className="absolute inset-0 z-[1000] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Google Maps JavaScript API</h3>
                  <p className="text-xs text-slate-400">Configure or update your API Credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white text-lg font-mono px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                API Key (Maps JavaScript API)
              </label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Keys can be created at{' '}
                <a
                  href="https://console.cloud.google.com/google/maps-apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline inline-flex items-center gap-0.5"
                >
                  Google Cloud Console ↗
                </a>
                . Saved locally in your browser.
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] space-y-1 text-slate-400">
              <p className="font-semibold text-slate-300">Features enabled with Google Maps:</p>
              <p>• Dark Night Vector Maps with smooth zoom & rotate</p>
              <p>• High-Resolution Satellite & Aerial Hybrid imagery</p>
              <p>• Dynamic AQI Heatmap Layer with gradient blending</p>
              <p>• Live Hazard Danger Circles & Interactive Info Windows</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Saved & Activated!</span>
                  </>
                ) : (
                  <span>Save & Activate</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render Selected Map Engine */}
      {engine === 'google' ? (
        <GoogleMapComponent
          districts={districts}
          selectedDistrict={selectedDistrict}
          onSelectDistrict={onSelectDistrict}
          activeFilter={activeFilter}
          showHeatmap={showHeatmap}
        />
      ) : (
        <LeafletMap
          districts={districts}
          selectedDistrict={selectedDistrict}
          onSelectDistrict={onSelectDistrict}
          activeFilter={activeFilter}
        />
      )}
    </div>
  );
};
