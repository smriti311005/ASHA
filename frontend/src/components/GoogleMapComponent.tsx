import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  HeatmapLayer,
  Circle,
} from '@react-google-maps/api';
import { DistrictProfile, HazardType } from '../types';
import {
  Waves,
  Flame,
  Wind,
  Shield,
  MapPin,
  AlertTriangle,
  Layers,
  Satellite,
  Radio,
  PlusCircle,
  Crosshair,
  Sparkles,
  Info,
  CheckCircle2,
  Trash2,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Center of India
const INDIA_CENTER = { lat: 22.5937, lng: 78.9629 };

const libraries: ('visualization' | 'places' | 'geometry')[] = ['visualization'];

// Google Maps Dark Style
const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#0a0e1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a9bb3' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0e1a' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1e2a3a' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#9da8b5' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#bdc5cf' }] },
  { featureType: 'poi', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#0f1724' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0d1f1a' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#1e4a2e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#172236' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#58748f' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1e2f46' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#6a8aa6' }] },
  { featureType: 'road.local', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#4a6680' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#071522' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d7faa' }] },
];

// Google Maps Light Style
const lightMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }, { weight: 3 }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#cbd5e1' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#94a3b8' }, { weight: 1.5 }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#1e293b' }] },
  { featureType: 'poi', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#dcfce7' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#166534' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#fef3c7' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#fde68a' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#92400e' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#bae6fd' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#0369a1' }] },
];

export interface MarkedPlace {
  id: string;
  name: string;
  category: 'GAUGE' | 'HOTSPOT' | 'CAAQMS' | 'NDRF' | 'CUSTOM';
  lat: number;
  lng: number;
  state: string;
  status: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'SAFE';
  details: string;
  metrics: { [key: string]: string | number };
}

// Curated Strategic Places Marked across India
export const STRATEGIC_MARKED_PLACES: MarkedPlace[] = [
  // 🌊 Hydrological River Gauges (Over Danger Mark alert stations)
  {
    id: 'gauge-1',
    name: 'Brahmaputra Gauge (Pandu Port)',
    category: 'GAUGE',
    lat: 26.1856,
    lng: 91.6881,
    state: 'Assam',
    status: 'Over Danger Mark (+0.44m)',
    severity: 'CRITICAL',
    details: 'Central Water Commission (CWC) telemetry indicates peak surge upstream from Tezpur.',
    metrics: { 'Water Stage': '50.12 m', 'Danger Mark': '49.68 m', 'Discharge': '44,200 m³/s' }
  },
  {
    id: 'gauge-2',
    name: 'Kosi River Gauge (Baltara Station)',
    category: 'GAUGE',
    lat: 25.5900,
    lng: 86.6800,
    state: 'Bihar',
    status: 'Severely Surging (+1.00m)',
    severity: 'CRITICAL',
    details: 'Embankment alert raised for Supaul, Saharsa, and Khagaria lowlands.',
    metrics: { 'Water Stage': '34.85 m', 'Danger Mark': '33.85 m', 'Breach Risk': 'High' }
  },
  {
    id: 'gauge-3',
    name: 'Mahanadi Gauge (Naraj Barrage)',
    category: 'GAUGE',
    lat: 20.4700,
    lng: 85.7600,
    state: 'Odisha',
    status: 'Approaching Warning Stage',
    severity: 'HIGH',
    details: '14 sluice gates opened at Hirakud Dam; coastal delta on 24h vigil.',
    metrics: { 'Water Stage': '26.90 m', 'Danger Mark': '26.41 m', 'Inflow': '8.2 Lakh Cusecs' }
  },
  {
    id: 'gauge-4',
    name: 'Yamuna River Gauge (Old Railway Bridge)',
    category: 'GAUGE',
    lat: 28.6653,
    lng: 77.2494,
    state: 'Delhi',
    status: 'Warning Level Exceeded',
    severity: 'HIGH',
    details: 'Hathnikund barrage release causing water level rise along Yamuna floodplains.',
    metrics: { 'Water Stage': '205.80 m', 'Warning Mark': '205.33 m', 'Trend': 'Rising' }
  },
  {
    id: 'gauge-5',
    name: 'Adyar Basin Gauge (Chembarambakkam)',
    category: 'GAUGE',
    lat: 13.0067,
    lng: 80.0544,
    state: 'Tamil Nadu',
    status: 'Regulated Discharge Active',
    severity: 'MEDIUM',
    details: 'Chennai urban drainage monitor maintaining controlled flow through Cooum & Adyar.',
    metrics: { 'Storage Level': '88.5%', 'Outflow': '1,200 cusecs', 'Capacity': '3.6 TMC' }
  },

  // 🔥 NASA FIRMS & ISRO Active Wildfire Hotspots
  {
    id: 'fire-1',
    name: 'Similipal Biosphere Reserve Core',
    category: 'HOTSPOT',
    lat: 21.8500,
    lng: 86.3500,
    state: 'Odisha',
    status: 'Active Thermal Radiance Cluster',
    severity: 'CRITICAL',
    details: 'NASA VIIRS 375m sensor detected high radiative energy front spreading northeast.',
    metrics: { 'FRP (Power)': '74.2 MW', 'Brightness Temp': '422 K', 'Spread Rate': '1.8 km/h' }
  },
  {
    id: 'fire-2',
    name: 'Chintapalle Forest Ridge',
    category: 'HOTSPOT',
    lat: 17.8700,
    lng: 82.3500,
    state: 'Andhra Pradesh',
    status: 'Canopy Flame Front',
    severity: 'HIGH',
    details: 'Dry deciduous vegetation fuel moisture below 12%; aerial water-bombing requested.',
    metrics: { 'FRP (Power)': '51.0 MW', 'Brightness Temp': '398 K', 'NDVI Dryness': '0.24' }
  },
  {
    id: 'fire-3',
    name: 'Bageshwar Coniferous Front',
    category: 'HOTSPOT',
    lat: 29.8400,
    lng: 79.7700,
    state: 'Uttarakhand',
    status: 'Pine Needle Floor Combustion',
    severity: 'HIGH',
    details: 'Slope-driven fire advancing towards lower Kumaon villages; SDRF deployed.',
    metrics: { 'FRP (Power)': '62.4 MW', 'Brightness Temp': '415 K', 'Wind Speed': '28 km/h' }
  },
  {
    id: 'fire-4',
    name: 'Bandipur Tiger Reserve Buffer',
    category: 'HOTSPOT',
    lat: 11.6600,
    lng: 76.6300,
    state: 'Karnataka',
    status: 'Thermal Radiance Outlier',
    severity: 'MEDIUM',
    details: 'Forest watchers created fire break lines along boundary cordon.',
    metrics: { 'FRP (Power)': '38.1 MW', 'Brightness Temp': '391 K', 'Status': 'Under Control' }
  },

  // 🌫️ CPCB CAAQMS Continuous Air Monitoring Super-Stations
  {
    id: 'caaqms-1',
    name: 'Anand Vihar CAAQMS Super-Station',
    category: 'CAAQMS',
    lat: 28.6469,
    lng: 77.3160,
    state: 'Delhi NCR',
    status: 'Severe+ Toxic Inversion Cap',
    severity: 'CRITICAL',
    details: 'Boundary layer compression trapping vehicular & biomass emissions under 250m.',
    metrics: { 'AQI Index': 438, 'PM2.5': '348 µg/m³', 'PM10': '490 µg/m³', 'NO2': '82 ppb' }
  },
  {
    id: 'caaqms-2',
    name: 'IIT Kanpur Atmospheric Super-Grid',
    category: 'CAAQMS',
    lat: 26.5123,
    lng: 80.2329,
    state: 'Uttar Pradesh',
    status: 'Severe Smog Belt',
    severity: 'HIGH',
    details: 'High optical aerosol depth observed via MODIS satellite telemetry.',
    metrics: { 'AQI Index': 382, 'PM2.5': '295 µg/m³', 'Wind': '4 km/h Stagnant', 'O3': '45 ppb' }
  },
  {
    id: 'caaqms-3',
    name: 'Ludhiana Industrial Focal Point',
    category: 'CAAQMS',
    lat: 30.8900,
    lng: 75.8800,
    state: 'Punjab',
    status: 'Very Poor Ambient Air',
    severity: 'HIGH',
    details: 'Post-harvest field burning combined with boiler smoke plumes.',
    metrics: { 'AQI Index': 345, 'PM2.5': '260 µg/m³', 'SO2': '42 µg/m³', 'CO': '3.2 mg/m³' }
  },
  {
    id: 'caaqms-4',
    name: 'Manali Petrochemical Corridor',
    category: 'CAAQMS',
    lat: 13.1670,
    lng: 80.2600,
    state: 'Tamil Nadu',
    status: 'Poor Air Dispersion',
    severity: 'MEDIUM',
    details: 'Marine inversion holding industrial VOCs along north Chennai shoreline.',
    metrics: { 'AQI Index': 290, 'PM2.5': '210 µg/m³', 'VOC Spike': '+34%', 'Temp': '31°C' }
  },

  // 🛡️ NDRF Rapid Response Disaster Bases
  {
    id: 'ndrf-1',
    name: 'NDRF 1st Battalion Rapid Base',
    category: 'NDRF',
    lat: 26.1150,
    lng: 91.6050,
    state: 'Assam (Patgaon, Guwahati)',
    status: 'High Readiness (Flood Flotilla Active)',
    severity: 'SAFE',
    details: 'Equipped with 45 inflatable motorboats, deep-divers, and drone search units.',
    metrics: { 'Personnel': '1,149 Troops', 'Disaster Ready': 'Floods / Landslides', 'Boats': '45 Units' }
  },
  {
    id: 'ndrf-2',
    name: 'NDRF 8th Battalion Hazmat HQ',
    category: 'NDRF',
    lat: 28.6850,
    lng: 77.4950,
    state: 'Uttar Pradesh (Ghaziabad / NCR)',
    status: 'CBRN & Urban Search Standby',
    severity: 'SAFE',
    details: 'Rapid response unit covering Delhi NCR disaster mitigation & emergency medical triage.',
    metrics: { 'Personnel': '1,150 Troops', 'Specialty': 'Urban Collapse / Hazmat', 'Status': 'Ready' }
  },
  {
    id: 'ndrf-3',
    name: 'NDRF 10th Battalion Coastal Command',
    category: 'NDRF',
    lat: 16.3750,
    lng: 80.5250,
    state: 'Andhra Pradesh (Guntur/Vijayawada)',
    status: 'Coastal Cyclone & Inundation Reserve',
    severity: 'SAFE',
    details: 'Deploys along Bay of Bengal coastline for storm surge and reservoir breaches.',
    metrics: { 'Personnel': '1,100 Troops', 'Coverage': 'AP, Telangana, Karnataka', 'Readiness': '100%' }
  },
  {
    id: 'ndrf-4',
    name: 'NDRF 5th Battalion Western Command',
    category: 'NDRF',
    lat: 18.7300,
    lng: 73.7100,
    state: 'Maharashtra (Sudumbare, Pune)',
    status: 'Ghats Flash Flood & Rescue Division',
    severity: 'SAFE',
    details: 'Mountain rescue & torrential rain mitigation corps for Western Ghats & Konkan.',
    metrics: { 'Personnel': '1,080 Troops', 'Specialty': 'Heavy Monsoon / Floods', 'Mobilized': 'Yes' }
  }
];

interface GoogleMapComponentProps {
  districts: DistrictProfile[];
  selectedDistrict: DistrictProfile | null;
  onSelectDistrict: (district: DistrictProfile) => void;
  activeFilter?: 'ALL' | HazardType;
  showHeatmap?: boolean;
}

const getRiskColor = (category: string): string => {
  if (category === 'CRITICAL') return '#ef4444';
  if (category === 'HIGH') return '#f97316';
  if (category === 'MEDIUM') return '#eab308';
  return '#10b981';
};

const getPlaceMarkerColor = (category: MarkedPlace['category'], severity: MarkedPlace['severity']): string => {
  if (category === 'GAUGE') return '#0284c7'; // Blue
  if (category === 'HOTSPOT') return '#ea580c'; // Fire Orange
  if (category === 'CAAQMS') return '#9333ea'; // Purple
  if (category === 'NDRF') return '#059669'; // Emerald
  return '#e11d48'; // Custom: Rose
};

const createCustomIcon = (color: string, isCritical: boolean, isSelected: boolean, glyph?: string) => {
  const size = isSelected ? 22 : isCritical ? 17 : 14;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size * 2}" height="${size * 2}" viewBox="0 0 ${size * 2} ${size * 2}">
      ${isCritical && !isSelected ? `<circle cx="${size}" cy="${size}" r="${size - 1}" fill="${color}" opacity="0.28"/>` : ''}
      <circle cx="${size}" cy="${size}" r="${isSelected ? size - 3 : size - 5}" fill="${color}" stroke="${isSelected ? '#ffffff' : color}" stroke-width="${isSelected ? 3 : 2}" opacity="0.95"/>
      ${isSelected ? `<circle cx="${size}" cy="${size}" r="4" fill="white"/>` : ''}
    </svg>
  `;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: { width: size * 2, height: size * 2 },
    anchor: { x: size, y: size },
  };
};

const createStrategicIcon = (place: MarkedPlace, isSelected: boolean) => {
  const color = getPlaceMarkerColor(place.category, place.severity);
  const size = isSelected ? 24 : 18;
  
  let symbolPath = '';
  if (place.category === 'GAUGE') {
    // Water wave glyph
    symbolPath = `<path d="M7 16c2 0 3-2 5-2s3 2 5 2 3-2 5-2" stroke="white" stroke-width="2.2" stroke-linecap="round" fill="none"/>`;
  } else if (place.category === 'HOTSPOT') {
    // Flame glyph
    symbolPath = `<path d="M12 7c1 3-1 4 0 7 2-1 3-3 3-5 1 2 2 4 1 6 0 3-2 5-5 5s-5-2-5-5c0-4 4-7 6-8z" fill="white"/>`;
  } else if (place.category === 'CAAQMS') {
    // Air cloud glyph
    symbolPath = `<path d="M7 15h10a3 3 0 0 0 0-6 4 4 0 0 0-7-2 3.5 3.5 0 0 0-3 5.5A2.5 2.5 0 0 0 7 15z" fill="white"/>`;
  } else if (place.category === 'NDRF') {
    // Shield glyph
    symbolPath = `<path d="M12 6l5 2v4c0 3.5-2.5 6-5 7-2.5-1-5-3.5-5-7V8l5-2z" fill="white"/>`;
  } else {
    // Custom star/pin
    symbolPath = `<circle cx="12" cy="12" r="4" fill="white"/>`;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.4"/>
      </filter>
      <circle cx="12" cy="12" r="${isSelected ? 11 : 9.5}" fill="${color}" stroke="#ffffff" stroke-width="${isSelected ? 2.5 : 1.8}" filter="url(#shadow)"/>
      ${symbolPath}
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: { width: size, height: size },
    anchor: { x: size / 2, y: size / 2 },
  };
};

const getEffectiveKey = (): string => {
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('ECOGUARD_GMAPS_KEY') : null;
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const k = localKey || envKey || '';
  if (k === 'YOUR_GOOGLE_MAPS_API_KEY_HERE' || k.trim().length < 15) return '';
  return k.trim();
};

export const GoogleMapComponent: React.FC<GoogleMapComponentProps> = (props) => {
  const [apiKey, setApiKey] = useState<string>(getEffectiveKey());
  const [inputVal, setInputVal] = useState('');

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim().length > 15) {
      localStorage.setItem('ECOGUARD_GMAPS_KEY', inputVal.trim());
      setApiKey(inputVal.trim());
    }
  };

  if (!apiKey) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/90 rounded-2xl border border-slate-800 p-8 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
          <Satellite className="w-8 h-8 text-blue-400" />
        </div>
        <div className="max-w-md space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
              Google Maps Platform
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">Activate Google Maps JavaScript API</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enter your Google Maps JavaScript API Key below or configure it in <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded font-mono">frontend/.env</code>.
          </p>
        </div>

        <form onSubmit={handleSaveKey} className="w-full max-w-sm space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Paste AIzaSy... API Key here"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={inputVal.trim().length < 15}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-md shadow-blue-600/30"
            >
              Activate
            </button>
          </div>
        </form>

        <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-left max-w-sm w-full space-y-1.5 text-slate-400">
          <p className="text-slate-200 font-semibold flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            3-Step Quick Setup:
          </p>
          <p>1. Open <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-blue-400 underline">Google Cloud Console ↗</a></p>
          <p>2. Enable <strong className="text-slate-300">Maps JavaScript API</strong></p>
          <p>3. Create an API Key and paste it above</p>
        </div>
      </div>
    );
  }

  return <GoogleMapInner apiKey={apiKey} {...props} />;
};

const GoogleMapInner: React.FC<GoogleMapComponentProps & { apiKey: string }> = ({
  apiKey,
  districts,
  selectedDistrict,
  onSelectDistrict,
  activeFilter = 'ALL',
  showHeatmap = false,
}) => {
  const { theme } = useTheme();
  const [activeDistrictInfo, setActiveDistrictInfo] = useState<DistrictProfile | null>(null);
  const [activePlaceInfo, setActivePlaceInfo] = useState<MarkedPlace | null>(null);
  const [mapStyleChoice, setMapStyleChoice] = useState<'auto' | 'dark' | 'light' | 'satellite'>('auto');
  
  // Custom user-dropped pins
  const [customPins, setCustomPins] = useState<MarkedPlace[]>([]);
  const [dropPinMode, setDropPinMode] = useState<boolean>(false);

  // Category filters for strategic marked places
  const [placeCategoryFilter, setPlaceCategoryFilter] = useState<'ALL' | 'GAUGE' | 'HOTSPOT' | 'CAAQMS' | 'NDRF'>('ALL');

  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    if (selectedDistrict && mapRef.current) {
      mapRef.current.panTo({ lat: selectedDistrict.lat, lng: selectedDistrict.lng });
      mapRef.current.setZoom(8);
    }
  }, [selectedDistrict]);

  // Determine actual Google Map style (auto respects website theme)
  const isDark = mapStyleChoice === 'dark' || (mapStyleChoice === 'auto' && theme === 'dark');
  const isSatellite = mapStyleChoice === 'satellite';
  const effectiveStyles = isSatellite ? undefined : isDark ? darkMapStyles : lightMapStyles;

  const filteredDistricts = districts.filter((d) => {
    if (activeFilter === 'ALL') return true;
    return d.dominant_hazard === activeFilter;
  });

  // Combine curated places and custom pins
  const allMarkedPlaces = [...STRATEGIC_MARKED_PLACES, ...customPins];
  const filteredPlaces = allMarkedPlaces.filter((p) => {
    if (placeCategoryFilter === 'ALL') return true;
    return p.category === placeCategoryFilter;
  });

  const heatmapData = (isLoaded && typeof google !== 'undefined' && (window as any).google?.maps)
    ? districts
        .filter((d) => d.hazard_breakdown?.pollution?.aqi > 150)
        .map((d) => ({
          location: new google.maps.LatLng(d.lat, d.lng),
          weight: d.hazard_breakdown.pollution.aqi / 100,
        }))
    : [];

  // Handle map click when in Drop Pin mode
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!dropPinMode || !e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const newPin: MarkedPlace = {
      id: `custom-${Date.now()}`,
      name: `Custom Hazard Beacon #${customPins.length + 1}`,
      category: 'CUSTOM',
      lat,
      lng,
      state: 'User Placed Landmark',
      status: 'Field Telemetry Active',
      severity: 'HIGH',
      details: `Disaster beacon deployed by operator at [${lat.toFixed(4)}, ${lng.toFixed(4)}].`,
      metrics: { 'Latitude': lat.toFixed(4), 'Longitude': lng.toFixed(4), 'Alert Type': 'Operator Watchpoint' }
    };
    setCustomPins((prev) => [newPin, ...prev]);
    setActivePlaceInfo(newPin);
    setDropPinMode(false);
  };

  const handleDeleteCustomPin = (id: string) => {
    setCustomPins((prev) => prev.filter((p) => p.id !== id));
    if (activePlaceInfo?.id === id) setActivePlaceInfo(null);
  };

  if (loadError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Google Maps API Error</h3>
          <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
            The provided Google Maps API key was rejected by Google. Ensure "Maps JavaScript API" is enabled in your Google Cloud Console.
          </p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('ECOGUARD_GMAPS_KEY');
            window.location.reload();
          }}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl cursor-pointer"
        >
          Clear Stored Key & Retry
        </button>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-2xl border border-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Initializing Google Maps SDK...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 right-3 z-[400] flex flex-wrap items-center gap-2 max-w-[95%]">
        {/* Drop Pin Mode Trigger */}
        <button
          onClick={() => setDropPinMode(!dropPinMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-lg backdrop-blur-md transition-all cursor-pointer border ${
            dropPinMode
              ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
              : 'bg-slate-900/90 text-slate-200 hover:text-white border-slate-700/80 hover:bg-slate-800'
          }`}
          title="Click anywhere on the map to mark custom points"
        >
          <Crosshair className="w-3.5 h-3.5 text-rose-400" />
          <span>{dropPinMode ? 'Click Map to Place Pin' : '+ Mark Place'}</span>
          {customPins.length > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-500/30 text-rose-200 text-[10px] rounded-full">
              {customPins.length}
            </span>
          )}
        </button>

        {/* Map Style Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-md px-2 py-1.5 rounded-xl border border-slate-700/80 shadow-xl text-xs">
          <button
            onClick={() => setMapStyleChoice('auto')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              mapStyleChoice === 'auto'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Automatically matches Website Theme (Light / Dark)"
          >
            <Sparkles className="w-3 h-3" /> Auto
          </button>
          <button
            onClick={() => setMapStyleChoice('dark')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              mapStyleChoice === 'dark'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-3 h-3" /> Dark
          </button>
          <button
            onClick={() => setMapStyleChoice('light')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              mapStyleChoice === 'light'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-3 h-3" /> Light
          </button>
          <button
            onClick={() => setMapStyleChoice('satellite')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              mapStyleChoice === 'satellite'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Satellite className="w-3 h-3" /> Satellite
          </button>
        </div>
      </div>

      {/* Top Left Marked Places Filter Pills */}
      <div className="absolute top-16 left-3 z-[400] hidden md:flex items-center gap-1 bg-slate-900/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl text-xs">
        <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider flex items-center gap-1">
          <MapPin className="w-3 h-3 text-emerald-400" />
          Marked Places:
        </span>
        <button
          onClick={() => setPlaceCategoryFilter('ALL')}
          className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
            placeCategoryFilter === 'ALL'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          All ({allMarkedPlaces.length + filteredDistricts.length})
        </button>
        <button
          onClick={() => setPlaceCategoryFilter('GAUGE')}
          className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 cursor-pointer ${
            placeCategoryFilter === 'GAUGE'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-blue-400 hover:bg-blue-500/10'
          }`}
        >
          <Waves className="w-3 h-3" /> River Gauges
        </button>
        <button
          onClick={() => setPlaceCategoryFilter('HOTSPOT')}
          className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 cursor-pointer ${
            placeCategoryFilter === 'HOTSPOT'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-amber-400 hover:bg-amber-500/10'
          }`}
        >
          <Flame className="w-3 h-3" /> Wildfire Points
        </button>
        <button
          onClick={() => setPlaceCategoryFilter('CAAQMS')}
          className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 cursor-pointer ${
            placeCategoryFilter === 'CAAQMS'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-purple-400 hover:bg-purple-500/10'
          }`}
        >
          <Wind className="w-3 h-3" /> CAAQMS Air
        </button>
        <button
          onClick={() => setPlaceCategoryFilter('NDRF')}
          className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 cursor-pointer ${
            placeCategoryFilter === 'NDRF'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-emerald-400 hover:bg-emerald-500/10'
          }`}
        >
          <Shield className="w-3 h-3" /> NDRF Bases
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-xl text-[11px] space-y-2">
        <p className="font-semibold text-slate-200 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" /> Google Maps Marked Index
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block bg-blue-500" />
            <span className="text-slate-300">River Gauges (5)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block bg-orange-500" />
            <span className="text-slate-300">Active Wildfires (4)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block bg-purple-500" />
            <span className="text-slate-300">Air Super-Stations (4)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block bg-emerald-500" />
            <span className="text-slate-300">NDRF Bases (4)</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex items-center gap-1">
          <Info className="w-3 h-3 text-cyan-400" /> Click any marker to view real-time telemetry
        </p>
      </div>

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%', cursor: dropPinMode ? 'crosshair' : 'default' }}
        center={INDIA_CENTER}
        zoom={5}
        onLoad={onLoad}
        onClick={handleMapClick}
        options={{
          mapTypeId: isSatellite ? 'satellite' : 'roadmap',
          styles: effectiveStyles,
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          clickableIcons: false,
          backgroundColor: isDark ? '#0a0e1a' : '#f8fafc',
          restriction: {
            latLngBounds: { north: 40, south: 6, east: 100, west: 65 },
            strictBounds: false,
          },
        }}
      >
        {/* AQI Heatmap Overlay */}
        {showHeatmap && isLoaded && (
          <HeatmapLayer
            data={heatmapData}
            options={{
              radius: 50,
              opacity: 0.5,
              gradient: ['rgba(0,0,0,0)', 'rgba(168,85,247,0.4)', 'rgba(239,68,68,0.7)'],
            }}
          />
        )}

        {/* Strategic Marked Places Across India */}
        {filteredPlaces.map((place) => {
          const isSelected = activePlaceInfo?.id === place.id;
          const color = getPlaceMarkerColor(place.category, place.severity);

          return (
            <React.Fragment key={place.id}>
              {/* Pulsing ring for critical severity places */}
              {place.severity === 'CRITICAL' && (
                <Circle
                  center={{ lat: place.lat, lng: place.lng }}
                  radius={28000}
                  options={{
                    fillColor: color,
                    fillOpacity: 0.12,
                    strokeColor: color,
                    strokeOpacity: 0.5,
                    strokeWeight: 1.5,
                  }}
                />
              )}

              <Marker
                position={{ lat: place.lat, lng: place.lng }}
                icon={createStrategicIcon(place, isSelected) as any}
                zIndex={isSelected ? 2000 : 800}
                onClick={() => {
                  setActivePlaceInfo(place);
                  setActiveDistrictInfo(null);
                }}
              />

              {/* InfoWindow for Marked Place */}
              {activePlaceInfo?.id === place.id && (
                <InfoWindow
                  position={{ lat: place.lat, lng: place.lng }}
                  onCloseClick={() => setActivePlaceInfo(null)}
                >
                  <div className="p-1 space-y-2 min-w-[240px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span style={{
                          display: 'inline-block',
                          padding: '1px 6px',
                          borderRadius: 4,
                          fontSize: 9,
                          fontWeight: 800,
                          backgroundColor: `${color}25`,
                          color,
                          border: `1px solid ${color}50`,
                          textTransform: 'uppercase',
                          marginBottom: 3
                        }}>
                          {place.category === 'GAUGE' ? 'River Water Gauge' :
                           place.category === 'HOTSPOT' ? 'NASA FIRMS Fire Hotspot' :
                           place.category === 'CAAQMS' ? 'CPCB CAAQMS Station' :
                           place.category === 'NDRF' ? 'NDRF Response Battalion' : 'Custom Hazard Pin'}
                        </span>
                        <h4 style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', margin: 0 }}>
                          {place.name}
                        </h4>
                        <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>{place.state}</p>
                      </div>
                      <span style={{
                        padding: '2px 8px', borderRadius: 999, fontSize: 10,
                        fontWeight: 700, backgroundColor: `${color}20`, color,
                        border: `1px solid ${color}50`, whiteSpace: 'nowrap'
                      }}>
                        {place.severity}
                      </span>
                    </div>

                    <div style={{
                      padding: '6px 8px', background: '#f8fafc', borderRadius: 8,
                      border: '1px solid #e2e8f0', fontSize: 11, color: '#334155', lineHeight: 1.4
                    }}>
                      <strong style={{ color: '#0f172a' }}>Status:</strong> {place.status}
                      <p style={{ margin: '4px 0 0', fontSize: 10.5, color: '#475569' }}>{place.details}</p>
                    </div>

                    {/* Key Metrics Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: Object.keys(place.metrics).length > 2 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                      gap: 4, padding: '4px 0', borderTop: '1px solid #e2e8f0'
                    }}>
                      {Object.entries(place.metrics).map(([k, v]) => (
                        <div key={k} style={{ textAlign: 'center', background: '#f1f5f9', padding: '3px 2px', borderRadius: 6 }}>
                          <p style={{ fontSize: 8.5, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>{k}</p>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', margin: 0 }}>{v}</p>
                        </div>
                      ))}
                    </div>

                    {place.category === 'CUSTOM' && (
                      <button
                        onClick={() => handleDeleteCustomPin(place.id)}
                        style={{
                          width: '100%', padding: '4px 8px', background: '#fee2e2', color: '#dc2626',
                          border: '1px solid #fca5a5', borderRadius: 6, fontSize: 10, fontWeight: 700,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
                        }}
                      >
                        <Trash2 style={{ width: 12, height: 12 }} /> Delete Custom Pin
                      </button>
                    )}
                  </div>
                </InfoWindow>
              )}
            </React.Fragment>
          );
        })}

        {/* Monitored District Markers */}
        {filteredDistricts.map((d) => {
          const isSelected = selectedDistrict?.district_id === d.district_id;
          const isCritical = d.overall_category === 'CRITICAL';
          const color = getRiskColor(d.overall_category);

          return (
            <React.Fragment key={d.district_id}>
              {/* Outer pulse ring for critical zones */}
              {isCritical && (
                <Circle
                  center={{ lat: d.lat, lng: d.lng }}
                  radius={35000}
                  options={{
                    fillColor: color,
                    fillOpacity: 0.08,
                    strokeColor: color,
                    strokeOpacity: 0.4,
                    strokeWeight: 1,
                  }}
                />
              )}

              <Marker
                position={{ lat: d.lat, lng: d.lng }}
                icon={createCustomIcon(color, isCritical, isSelected) as any}
                zIndex={isSelected ? 1000 : isCritical ? 500 : 100}
                onClick={() => {
                  setActiveDistrictInfo(d);
                  setActivePlaceInfo(null);
                  onSelectDistrict(d);
                }}
              />

              {/* District Info Window */}
              {activeDistrictInfo?.district_id === d.district_id && (
                <InfoWindow
                  position={{ lat: d.lat, lng: d.lng }}
                  onCloseClick={() => setActiveDistrictInfo(null)}
                >
                  <div className="p-1 space-y-2 min-w-[210px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', margin: 0 }}>
                          {d.district_name}
                        </h4>
                        <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>{d.state}</p>
                      </div>
                      <span style={{
                        padding: '2px 8px', borderRadius: 999, fontSize: 10,
                        fontWeight: 700, backgroundColor: `${color}25`, color,
                        border: `1px solid ${color}50`
                      }}>
                        {d.overall_category} ({d.overall_risk_score}%)
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, padding: '6px 0', borderTop: '1px solid #e2e8f0' }}>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 9, color: '#64748b', margin: 0 }}>Flood</p>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', margin: 0 }}>{d.hazard_breakdown.flood.risk_score}%</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 9, color: '#64748b', margin: 0 }}>Fire</p>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#d97706', margin: 0 }}>{d.hazard_breakdown.fire.risk_score}%</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 9, color: '#64748b', margin: 0 }}>AQI</p>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', margin: 0 }}>{d.hazard_breakdown.pollution.aqi}</p>
                      </div>
                    </div>
                    <div style={{
                      padding: '6px 8px', background: '#f8fafc', borderRadius: 8,
                      border: '1px solid #e2e8f0', fontSize: 11, color: '#334155',
                      lineHeight: 1.4
                    }}>
                      {d.primary_action.slice(0, 80)}...
                    </div>
                  </div>
                </InfoWindow>
              )}
            </React.Fragment>
          );
        })}
      </GoogleMap>
    </div>
  );
};
