import {
  DashboardSummary,
  DistrictProfile,
  DistrictDetailsResponse,
  AlertBulletin,
  SARRadarChip
} from '../types';

const API_BASE = '/api';

export const api = {
  async getDashboard(): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard telemetry');
    return res.json();
  },

  async getDistricts(): Promise<DistrictProfile[]> {
    const res = await fetch(`${API_BASE}/districts`);
    if (!res.ok) throw new Error('Failed to fetch districts');
    return res.json();
  },

  async getDistrictDetails(id: string): Promise<DistrictDetailsResponse> {
    const res = await fetch(`${API_BASE}/district/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch details for district ${id}`);
    return res.json();
  },

  async getFloods(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/floods`);
    if (!res.ok) throw new Error('Failed to fetch flood layer');
    return res.json();
  },

  async getFires(): Promise<{ active_hotspots: any[]; regional_fire_zones: any[] }> {
    const res = await fetch(`${API_BASE}/fires`);
    if (!res.ok) throw new Error('Failed to fetch fire hotspots');
    return res.json();
  },

  async getAirQuality(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/air-quality`);
    if (!res.ok) throw new Error('Failed to fetch air quality data');
    return res.json();
  },

  async getAlerts(): Promise<AlertBulletin[]> {
    const res = await fetch(`${API_BASE}/alerts`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async dispatchAlert(alertId: string, channel: string, recipient: string): Promise<any> {
    const res = await fetch(`${API_BASE}/alerts/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alert_id: alertId,
        channel,
        recipient
      })
    });
    return res.json();
  },

  async acknowledgeAlert(alertId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/alerts/acknowledge/${alertId}`, {
      method: 'POST'
    });
    return res.json();
  },

  async predictFlood(params: {
    rainfall_24h_mm: number;
    rainfall_72h_mm: number;
    river_gauge_m: number;
    river_danger_mark_m: number;
    soil_saturation_pct: number;
    elevation_m: number;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/predict/flood`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  async predictFire(params: {
    surface_temp_c: number;
    relative_humidity_pct: number;
    wind_speed_kmh: number;
    dry_spell_days: number;
    ndvi_vegetation: number;
    active_hotspots_count: number;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/predict/fire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  async predictAirQuality(params: {
    pm25: number;
    pm10: number;
    temp_c: number;
    humidity_pct: number;
    wind_speed_kmh: number;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/predict/air-quality`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  async predictCompositeRisk(params: {
    flood_risk: number;
    fire_risk: number;
    pollution_risk: number;
    flood_weight?: number;
    fire_weight?: number;
    pollution_weight?: number;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/predict/composite-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  async getModelMetrics(): Promise<any> {
    const res = await fetch(`${API_BASE}/models/metrics`);
    if (!res.ok) throw new Error('Failed to fetch model metrics');
    return res.json();
  },

  async getSARChip(districtId: string): Promise<SARRadarChip> {
    const res = await fetch(`${API_BASE}/satellite/sar-chip/${districtId}`);
    return res.json();
  },

  async trainModel(params: {
    model_type: 'flood' | 'fire' | 'pollution';
    epochs: number;
    learning_rate: number;
    batch_size: number;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/models/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Training failed');
    }
    return res.json();
  }
};
