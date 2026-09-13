export type HazardCategory = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type HazardType = 'FLOOD' | 'FIRE' | 'POLLUTION';

export interface Telemetry {
  rainfall_24h_mm: number;
  rainfall_72h_mm: number;
  river_gauge_m: number;
  river_danger_mark_m: number;
  soil_saturation_pct: number;
  surface_temp_c: number;
  relative_humidity_pct: number;
  wind_speed_kmh: number;
  dry_spell_days: number;
  ndvi_vegetation: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
}

export interface SARSatellite {
  satellite: string;
  pass_timestamp: string;
  orbit_direction: string;
  polarization: string;
  water_body_expansion_pct: number;
  detected_flood_km2: number;
  confidence: number;
}

export interface FireHotspot {
  district_id?: string;
  district_name?: string;
  state?: string;
  lat: number;
  lng: number;
  brightness_k: number;
  frp_mw: number;
  confidence: string;
  sensor: string;
}

export interface FloodBreakdown {
  hazard: 'FLOOD';
  risk_score: number;
  category: HazardCategory;
  recommended_action: string;
  estimated_flooded_km2: number;
  river_overtopping_pct: number;
  soil_absorption_remaining_pct: number;
  lead_time_hours: number;
  confidence: number;
}

export interface FireBreakdown {
  hazard: 'FIRE';
  risk_score: number;
  category: HazardCategory;
  recommended_action: string;
  fire_weather_index_fwi: number;
  estimated_spread_velocity_kmh: number;
  fuel_moisture_status: string;
  containment_difficulty: string;
  active_hotspots_detected: number;
  confidence: number;
}

export interface PollutionBreakdown {
  aqi: number;
  category: string;
  dominant_pollutant: string;
  health_impact: string;
  color: string;
  sub_indices: Record<string, number>;
  risk_score: number;
}

export interface DistrictProfile {
  district_id: string;
  district_name: string;
  state: string;
  lat: number;
  lng: number;
  overall_risk_score: number;
  overall_category: HazardCategory;
  status_color: string;
  dominant_hazard: HazardType;
  primary_action: string;
  observed_facts: string[];
  hazard_breakdown: {
    flood: FloodBreakdown;
    fire: FireBreakdown;
    pollution: PollutionBreakdown;
  };
  sar_satellite?: SARSatellite | null;
  fire_hotspots: FireHotspot[];
  telemetry: Telemetry;
}

export interface AlertBulletin {
  id: string;
  district_id: string;
  location: string;
  hazard: HazardType;
  severity: HazardCategory;
  risk_score: number;
  issued_at: string;
  predicted_lead_time: string;
  affected_area_km2: number;
  population_exposed: number;
  reasons: string[];
  recommended_actions: string[];
  channels_dispatched: string[];
  acknowledged: boolean;
}

export interface DashboardSummary {
  status: string;
  timestamp: string;
  national_summary: {
    critical_districts: number;
    high_risk_districts: number;
    medium_risk_districts: number;
    safe_monitored_districts: number;
    total_monitored: number;
    total_flooded_area_km2: number;
    active_fire_hotspots: number;
    average_national_aqi: number;
    active_satellites: string[];
  };
  top_vulnerable_hotspots: DistrictProfile[];
  recent_alerts: AlertBulletin[];
}

export interface AQIForecastStep {
  predicted_aqi: number;
  predicted_pm25: number;
  trend: string;
  confidence_interval: [number, number];
}

export interface AQIForecastData {
  current: PollutionBreakdown;
  forecast_6h: AQIForecastStep;
  forecast_12h: AQIForecastStep;
  forecast_24h: AQIForecastStep;
  recommended_action: string;
}

export interface SARRadarChip {
  grid_size: number;
  sar_vv_matrix: number[][];
  segmentation_mask: number[][];
  water_pixel_coverage_pct: number;
  detected_inundation_km2: number;
  radar_sensor: string;
  polarization: string;
  spatial_resolution: string;
}

export interface DistrictDetailsResponse {
  profile: DistrictProfile;
  aqi_forecast: AQIForecastData;
  sar_radar_chip?: SARRadarChip | null;
}
