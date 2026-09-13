import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Filter,
  Waves,
  Flame,
  Wind,
  Layers,
  Shield,
  SlidersHorizontal
} from 'lucide-react';
import { DistrictProfile, HazardType } from '../types';
import { EcoGuardMap } from '../components/EcoGuardMap';

interface InteractiveMapPageProps {
  districts: DistrictProfile[];
  selectedDistrict: DistrictProfile | null;
  onSelectDistrict: (district: DistrictProfile) => void;
}

export const InteractiveMapPage: React.FC<InteractiveMapPageProps> = ({
  districts,
  selectedDistrict,
  onSelectDistrict
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hazardFilter, setHazardFilter] = useState<'ALL' | HazardType>('ALL');
  const [minRisk, setMinRisk] = useState<number>(0);
  const [selectedState, setSelectedState] = useState<string>('ALL');

  const states = Array.from(new Set(districts.map((d) => d.state))).sort();

  const filteredDistricts = districts.filter((d) => {
    const matchesSearch =
      d.district_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHazard = hazardFilter === 'ALL' || d.dominant_hazard === hazardFilter;
    const matchesRisk = d.overall_risk_score >= minRisk;
    const matchesState = selectedState === 'ALL' || d.state === selectedState;
    return matchesSearch && matchesHazard && matchesRisk && matchesState;
  });

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-4 lg:p-6 space-y-4 max-w-[1700px] mx-auto">
      {/* Top Filter & Query Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search district, river basin, state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Hazard Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setHazardFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              hazardFilter === 'ALL'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Hazards
          </button>
          <button
            onClick={() => setHazardFilter('FLOOD')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-all cursor-pointer ${
              hazardFilter === 'FLOOD'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Waves className="w-3.5 h-3.5 text-blue-400" />
            Floods
          </button>
          <button
            onClick={() => setHazardFilter('FIRE')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-all cursor-pointer ${
              hazardFilter === 'FIRE'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Wildfires
          </button>
          <button
            onClick={() => setHazardFilter('POLLUTION')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-all cursor-pointer ${
              hazardFilter === 'POLLUTION'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-purple-400" />
            Air Quality
          </button>
        </div>

        {/* State Dropdown */}
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
        >
          <option value="ALL">All States / UTs ({districts.length})</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Min Risk Slider */}
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Min Risk:</span>
          <input
            type="range"
            min="0"
            max="80"
            step="10"
            value={minRisk}
            onChange={(e) => setMinRisk(Number(e.target.value))}
            className="w-20 accent-emerald-500"
          />
          <span className="font-mono font-bold text-emerald-400">{minRisk}%</span>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="flex-1 w-full rounded-2xl overflow-hidden shadow-2xl relative">
        <EcoGuardMap
          districts={filteredDistricts}
          selectedDistrict={selectedDistrict}
          onSelectDistrict={onSelectDistrict}
          activeFilter={hazardFilter}
        />
      </div>
    </div>
  );
};
